"use client";

import { useRef, useEffect, useState } from "react";
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
  const currentWhisper = useWhisperStore((s) => s.currentWhisper);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const starters = currentWhisper?.personality?.conversationStarters || [];

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  const handleStart = async () => {
    setIsConnecting(true);
    try {
      await startConversation();
    } finally {
      setIsConnecting(false);
    }
  };

  if (!conversationActive) {
    return (
      <div className="space-y-3">
        {/* Conversation starter chips */}
        {starters.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {starters.map((starter, i) => (
              <button
                key={i}
                onClick={handleStart}
                disabled={isConnecting}
                className="px-3 py-1.5 text-[11px] transition-all active:scale-95 disabled:opacity-30"
                style={{
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}
              >
                &ldquo;{starter}&rdquo;
              </button>
            ))}
          </div>
        )}

        <button
          onClick={handleStart}
          disabled={isConnecting}
          className="w-full py-3.5 text-sm font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          style={{
            background: "var(--accent)",
            color: "var(--bg)",
            borderRadius: 12,
          }}
        >
          {isConnecting ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Talk to this object
            </>
          )}
        </button>

        {/* Error shown even when not connected */}
        {error && (
          <div className="px-3 py-2" style={{ background: "rgba(212,68,59,0.08)", border: "1px solid rgba(212,68,59,0.15)", borderRadius: 10 }}>
            <p className="text-xs text-center" style={{ color: "var(--danger)" }}>{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active conversation header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <span
              className="block w-2.5 h-2.5 rounded-full"
              style={{
                background: isSpeaking
                  ? "var(--accent)"
                  : isListening
                    ? "var(--eco)"
                    : "var(--text-muted)",
              }}
            />
            {(isSpeaking || isListening) && (
              <span
                className="absolute inset-0 rounded-full animate-ping"
                style={{
                  background: isSpeaking
                    ? "rgba(232,196,124,0.4)"
                    : "rgba(61,221,182,0.4)",
                }}
              />
            )}
          </div>
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {isSpeaking
              ? "Speaking..."
              : isListening
                ? "Listening..."
                : "Connected"}
          </span>
        </div>

        <button
          onClick={endConversation}
          className="px-3 py-1.5 text-xs transition-colors"
          style={{ color: "var(--danger)", border: "1px solid rgba(212,68,59,0.2)", borderRadius: 8 }}
        >
          End
        </button>
      </div>

      {/* Speaking visualization */}
      {isSpeaking && (
        <div className="flex items-center justify-center gap-[3px] py-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="w-[2px] rounded-full wave-bar"
              style={{
                height: 18,
                background: "var(--accent)",
                opacity: 0.6,
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Listening indicator */}
      {isListening && !isSpeaking && (
        <div className="flex items-center justify-center gap-1.5 py-3">
          <div className="flex items-center gap-[3px]">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{ background: "var(--eco)", animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span className="text-[10px] ml-2" style={{ color: "var(--text-muted)" }}>Speak now...</span>
        </div>
      )}

      {/* Transcript */}
      {transcript.length > 0 && (
        <div className="max-h-48 overflow-y-auto space-y-2.5 scrollbar-thin p-3" style={{ background: "var(--surface-raised)", borderRadius: 12 }}>
          {transcript.map((entry, i) => (
            <div
              key={i}
              className={`animate-fade-in ${entry.role === "user" ? "text-right" : "text-left"}`}
            >
              <div
                className="inline-block max-w-[85%] px-3 py-2 text-xs leading-relaxed"
                style={{
                  borderRadius: 12,
                  background: entry.role === "user" ? "var(--accent-dim)" : "rgba(255,255,255,0.03)",
                  color: entry.role === "user" ? "var(--accent)" : "var(--text-secondary)",
                }}
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
        <div className="px-3 py-2" style={{ background: "rgba(212,68,59,0.08)", border: "1px solid rgba(212,68,59,0.15)", borderRadius: 10 }}>
          <p className="text-xs text-center" style={{ color: "var(--danger)" }}>{error}</p>
        </div>
      )}
    </div>
  );
}
