"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { useWhisperStore } from "@/store/whisper-store";

/**
 * ElevenLabs Agents WebSocket conversation hook.
 *
 * Protocol (from docs):
 * - Server sends: conversation_initiation_metadata, audio, user_transcript,
 *   agent_response, agent_response_correction, ping
 * - Client sends: raw audio bytes (PCM/webm), pong responses
 * - Audio events contain base64-encoded PCM audio in audio_event.audio_base_64
 */
export function useConversation() {
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioQueueRef = useRef<string[]>([]); // base64 audio chunks
  const isPlayingRef = useRef(false);
  const outputFormatRef = useRef<string>("pcm_16000");

  const {
    conversationActive,
    setConversation,
    addTranscriptEntry,
    clearTranscript,
    currentWhisper,
  } = useWhisperStore();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Decode base64 PCM to AudioBuffer and play
  const playNextChunk = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return;
    isPlayingRef.current = true;
    setIsSpeaking(true);

    while (audioQueueRef.current.length > 0) {
      const base64 = audioQueueRef.current.shift()!;

      if (!audioContextRef.current || audioContextRef.current.state === "closed") {
        audioContextRef.current = new AudioContext({ sampleRate: 44100 });
      }
      const ctx = audioContextRef.current;

      try {
        // Decode base64 to raw bytes
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Try decoding as encoded audio first (mp3/opus), fall back to raw PCM
        let audioBuffer: AudioBuffer;
        try {
          audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
        } catch {
          // Treat as raw 16-bit PCM at the sample rate from initiation metadata
          const sampleRate = parseSampleRate(outputFormatRef.current);
          const samples = new Float32Array(bytes.length / 2);
          const view = new DataView(bytes.buffer);
          for (let i = 0; i < samples.length; i++) {
            samples[i] = view.getInt16(i * 2, true) / 32768;
          }
          audioBuffer = ctx.createBuffer(1, samples.length, sampleRate);
          audioBuffer.getChannelData(0).set(samples);
        }

        // Play the buffer
        await new Promise<void>((resolve) => {
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(ctx.destination);
          sourceNodeRef.current = source;
          source.onended = () => {
            sourceNodeRef.current = null;
            resolve();
          };
          source.start(0);
        });
      } catch {
        // Skip bad chunks
      }
    }

    isPlayingRef.current = false;
    setIsSpeaking(false);
  }, []);

  // Stop any currently playing audio (for interruptions)
  const stopPlayback = useCallback(() => {
    audioQueueRef.current = [];
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch { /* already stopped */ }
      sourceNodeRef.current = null;
    }
    isPlayingRef.current = false;
    setIsSpeaking(false);
  }, []);

  const startMicrophone = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      recorder.ondataavailable = (event) => {
        if (
          event.data.size > 0 &&
          wsRef.current?.readyState === WebSocket.OPEN
        ) {
          // Send raw audio bytes to the agent
          event.data.arrayBuffer().then((buffer) => {
            wsRef.current?.send(new Uint8Array(buffer));
          });
        }
      };

      recorder.start(100); // 100ms chunks
      mediaRecorderRef.current = recorder;
      setIsListening(true);
    } catch (err) {
      console.error("Microphone error:", err);
      setError("Microphone access denied");
    }
  }, []);

  const stopMicrophone = useCallback(() => {
    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      } catch { /* already stopped */ }
      mediaRecorderRef.current = null;
      setIsListening(false);
    }
  }, []);

  const startConversation = useCallback(async () => {
    if (!currentWhisper) return;

    setError(null);
    clearTranscript();
    stopPlayback();

    try {
      // Create agent and get signed URL from our API route
      const res = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voiceId: currentWhisper.voiceId,
          systemPrompt: currentWhisper.personality.systemPrompt,
          facts: currentWhisper.facts,
          objectName: currentWhisper.objectName,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to start conversation");
      }

      const { agentId, signedUrl } = await res.json();
      setConversation(true, agentId, signedUrl);

      // Connect WebSocket
      const ws = new WebSocket(signedUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        startMicrophone();
      };

      ws.onmessage = (event) => {
        // Binary data — shouldn't happen with ElevenLabs agents (they use JSON)
        if (event.data instanceof Blob) return;

        try {
          const msg = JSON.parse(event.data);

          switch (msg.type) {
            case "conversation_initiation_metadata": {
              // Store the output audio format for PCM decoding
              const format =
                msg.conversation_initiation_metadata_event
                  ?.agent_output_audio_format;
              if (format) outputFormatRef.current = format;
              break;
            }

            case "ping": {
              // Must respond to pings to keep connection alive
              const pongPayload = {
                type: "pong",
                event_id: msg.ping_event?.event_id,
              };
              ws.send(JSON.stringify(pongPayload));
              break;
            }

            case "audio": {
              const base64Audio =
                msg.audio_event?.audio_base_64;
              if (base64Audio) {
                audioQueueRef.current.push(base64Audio);
                playNextChunk();
              }
              break;
            }

            case "agent_response": {
              const text =
                msg.agent_response_event?.agent_response;
              if (text) {
                addTranscriptEntry({
                  role: "object",
                  text,
                  timestamp: Date.now(),
                });
              }
              break;
            }

            case "agent_response_correction": {
              // Agent was interrupted — update last agent transcript
              const corrected =
                msg.agent_response_correction_event
                  ?.corrected_agent_response;
              if (corrected) {
                addTranscriptEntry({
                  role: "object",
                  text: corrected + " [interrupted]",
                  timestamp: Date.now(),
                });
              }
              break;
            }

            case "user_transcript": {
              const text =
                msg.user_transcription_event?.user_transcript;
              if (text) {
                addTranscriptEntry({
                  role: "user",
                  text,
                  timestamp: Date.now(),
                });
              }
              break;
            }

            case "interruption": {
              // User interrupted the agent — stop playback
              stopPlayback();
              break;
            }
          }
        } catch {
          // Non-JSON or malformed — skip
        }
      };

      ws.onerror = () => {
        setError("Connection error — please try again");
      };

      ws.onclose = () => {
        setConversation(false);
        stopMicrophone();
        stopPlayback();
      };
    } catch (err) {
      console.error("Conversation start error:", err);
      setError(err instanceof Error ? err.message : "Failed to start");
      setConversation(false);
    }
  }, [
    currentWhisper,
    setConversation,
    clearTranscript,
    addTranscriptEntry,
    playNextChunk,
    stopPlayback,
    startMicrophone,
    stopMicrophone,
  ]);

  const endConversation = useCallback(() => {
    const { agentId } = useWhisperStore.getState();

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    stopMicrophone();
    stopPlayback();
    setConversation(false);

    // Best-effort agent cleanup
    if (agentId) {
      fetch("/api/conversation", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      }).catch(() => {});
    }
  }, [stopMicrophone, stopPlayback, setConversation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
      stopMicrophone();
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }
    };
  }, [stopMicrophone]);

  return {
    startConversation,
    endConversation,
    conversationActive,
    isSpeaking,
    isListening,
    error,
  };
}

function parseSampleRate(format: string): number {
  // Formats like "pcm_16000", "pcm_44100", etc.
  const match = format.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 16000;
}
