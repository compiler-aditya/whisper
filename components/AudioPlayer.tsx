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
    <div className="flex items-center gap-3">
      {/* Play/Pause button */}
      <button
        onClick={() => togglePlayback(audioBase64)}
        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
      >
        {isPlaying ? (
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        )}
      </button>

      {/* Progress bar */}
      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-400 to-blue-400 transition-all duration-100"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Waveform visualization (decorative) */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`w-0.5 rounded-full transition-all duration-150 ${
              isPlaying ? "bg-violet-400" : "bg-white/20"
            }`}
            style={{
              height: isPlaying
                ? `${8 + Math.sin((progress * 20 + i) * 0.8) * 8}px`
                : "4px",
              transitionDelay: `${i * 20}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
