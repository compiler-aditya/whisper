"use client";

import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { useEffect, useRef } from "react";

interface AudioPlayerProps {
  audioBase64: string;
  autoPlay?: boolean;
  onFinished?: () => void;
}

export default function AudioPlayer({
  audioBase64,
  autoPlay = false,
  onFinished,
}: AudioPlayerProps) {
  const { playBase64Audio, togglePlayback, isPlaying, progress } =
    useAudioPlayback();
  const hasAutoPlayed = useRef(false);

  useEffect(() => {
    if (autoPlay && audioBase64 && !hasAutoPlayed.current) {
      hasAutoPlayed.current = true;
      playBase64Audio(audioBase64).then(() => {
        onFinished?.();
      });
    }
  }, [autoPlay, audioBase64, playBase64Audio, onFinished]);

  return (
    <div className="flex items-center gap-4">
      {/* Play/Pause */}
      <button
        onClick={() => togglePlayback(audioBase64)}
        className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
        style={{
          background: isPlaying ? "var(--accent)" : "var(--surface-raised)",
          border: "1px solid var(--border)",
        }}
      >
        {isPlaying ? (
          <svg className="w-3.5 h-3.5" fill="var(--bg)" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5 ml-0.5" fill="var(--text)" viewBox="0 0 24 24">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        )}
      </button>

      {/* Progress line */}
      <div className="flex-1 relative h-px" style={{ background: "var(--border)" }}>
        <div
          className="absolute top-0 left-0 h-full transition-all duration-100"
          style={{
            width: `${progress * 100}%`,
            background: "var(--accent)",
          }}
        />
        {/* Playhead dot */}
        {progress > 0 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
            style={{
              left: `${progress * 100}%`,
              background: "var(--accent)",
              transform: `translateX(-50%) translateY(-50%)`,
            }}
          />
        )}
      </div>

      {/* Waveform */}
      <div className="flex items-center gap-[2px]">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="w-[1.5px] rounded-full transition-all duration-200"
            style={{
              height: isPlaying
                ? `${4 + Math.sin((progress * 20 + i) * 0.7) * 10}px`
                : "3px",
              background: isPlaying ? "var(--accent)" : "var(--text-muted)",
              opacity: isPlaying ? 0.6 + Math.sin((progress * 20 + i) * 0.7) * 0.4 : 0.3,
              transitionDelay: `${i * 15}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
