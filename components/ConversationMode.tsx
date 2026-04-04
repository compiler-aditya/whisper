"use client";

import { useRef, useEffect } from "react";
import { useConversation } from "@/hooks/useConversation";
import { useWhisperStore } from "@/store/whisper-store";

export default function ConversationMode() {
  const {
    startConversation,
    endConversation,
    conversationActive,
    isSpeaking,
    isListening,
    error,
  } = useConversation();

  const transcript = useWhisperStore((s) => s.transcript);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  if (!conversationActive) {
    return (
      <button
        onClick={startConversation}
        className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 rounded-xl text-white font-medium text-sm hover:from-violet-500 hover:to-blue-500 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        Talk to this object
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active conversation header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Animated status orb */}
          <div className="relative">
            <span
              className={`block w-2.5 h-2.5 rounded-full ${
                isSpeaking
                  ? "bg-violet-400"
                  : isListening
                    ? "bg-green-400"
                    : "bg-white/30"
              }`}
            />
            {(isSpeaking || isListening) && (
              <span
                className={`absolute inset-0 rounded-full animate-ping ${
                  isSpeaking ? "bg-violet-400/50" : "bg-green-400/50"
                }`}
              />
            )}
          </div>
          <span className="text-white/60 text-xs font-medium">
            {isSpeaking
              ? "Speaking..."
              : isListening
                ? "Listening..."
                : "Connected"}
          </span>
        </div>

        <button
          onClick={endConversation}
          className="px-3 py-1.5 text-xs text-red-400/80 border border-red-400/20 rounded-full hover:bg-red-400/10 transition-colors"
        >
          End conversation
        </button>
      </div>

      {/* Speaking visualization */}
      {isSpeaking && (
        <div className="flex items-center justify-center gap-[3px] py-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="w-[3px] bg-gradient-to-t from-violet-500 to-blue-400 rounded-full wave-bar"
              style={{
                height: "18px",
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Listening indicator */}
      {isListening && !isSpeaking && (
        <div className="flex items-center justify-center gap-1.5 py-3">
          <div className="flex items-center gap-[2px]">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span className="text-white/30 text-[10px] ml-2">Speak now...</span>
        </div>
      )}

      {/* Transcript */}
      {transcript.length > 0 && (
        <div className="max-h-48 overflow-y-auto space-y-2.5 scrollbar-thin rounded-lg bg-white/[0.02] p-3">
          {transcript.map((entry, i) => (
            <div
              key={i}
              className={`animate-fade-in ${
                entry.role === "user" ? "text-right" : "text-left"
              }`}
            >
              <div
                className={`inline-block max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                  entry.role === "user"
                    ? "bg-blue-500/15 text-blue-200/80 rounded-br-sm"
                    : "bg-white/5 text-white/70 rounded-bl-sm"
                }`}
              >
                {entry.text}
              </div>
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          <p className="text-red-400/80 text-xs text-center">{error}</p>
        </div>
      )}
    </div>
  );
}
