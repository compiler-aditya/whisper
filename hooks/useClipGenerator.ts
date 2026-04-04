"use client";

import { useState, useCallback } from "react";
import { useWhisperStore } from "@/store/whisper-store";
import { mixAudioTracks } from "@/lib/audio-mixer";
import { v4 as uuidv4 } from "uuid";
import type { WhisperResult } from "@/types";

export function useClipGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const addClip = useWhisperStore((s) => s.addClip);

  const generateClip = useCallback(
    async (whisper: WhisperResult): Promise<Blob | null> => {
      setIsGenerating(true);
      setProgress("Generating ambient audio...");

      try {
        // Request SFX + music from server
        const res = await fetch("/api/clip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            objectName: whisper.objectName,
            entityName: whisper.entityName,
            monologue: whisper.monologue,
          }),
        });

        let sfxBase64: string | null = null;
        let musicBase64: string | null = null;

        if (res.ok) {
          const data = await res.json();
          sfxBase64 = data.sfxBase64;
          musicBase64 = data.musicBase64;
        }

        setProgress("Mixing audio...");

        // Mix tracks on client
        const blob = await mixAudioTracks(
          whisper.audioBase64,
          sfxBase64 ?? undefined,
          musicBase64 ?? undefined,
          0.12, // music volume
          0.25  // sfx volume
        );

        // Convert blob to base64 for storage
        const reader = new FileReader();
        const clipBase64 = await new Promise<string>((resolve) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
          };
          reader.readAsDataURL(blob);
        });

        // Save clip
        const clip = {
          id: uuidv4(),
          whisperId: whisper.id,
          objectName: whisper.objectName,
          entityName: whisper.entityName,
          audioBlob: clipBase64,
          voiceAudioBase64: whisper.audioBase64,
          timestamp: Date.now(),
        };
        addClip(clip);

        setProgress("");
        setIsGenerating(false);
        return blob;
      } catch (err) {
        console.error("Clip generation error:", err);
        setProgress("");
        setIsGenerating(false);
        // Fallback: return voice-only audio as blob
        const binaryString = atob(whisper.audioBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return new Blob([bytes], { type: "audio/mp3" });
      }
    },
    [addClip]
  );

  return { generateClip, isGenerating, progress };
}
