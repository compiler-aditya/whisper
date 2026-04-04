"use client";

import { useState } from "react";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import type { WhisperResult } from "@/types";

interface DuetModeProps {
  whisper: WhisperResult;
}

export default function DuetMode({ whisper }: DuetModeProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [duetAudio, setDuetAudio] = useState<string | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { playBase64Audio, togglePlayback, isPlaying, progress } = useAudioPlayback();

  const handleGenerateDuet = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/duet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voiceId: whisper.voiceId,
          objectName: whisper.objectName,
          personality: whisper.personality,
          facts: whisper.facts,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Duet failed");
      }

      const data = await res.json();
      setDuetAudio(data.audioBase64);
      setLines(data.lines || []);

      // Auto-play
      await playBase64Audio(data.audioBase64);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate duet");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!duetAudio) {
    return (
      <button
        onClick={handleGenerateDuet}
        disabled={isGenerating}
        className={`
          w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2
          ${isGenerating
            ? "bg-white/5 text-white/30 cursor-wait"
            : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80 active:scale-[0.98]"
          }
        `}
      >
        {isGenerating ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Creating duet...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            Whisper Duet (2 people)
          </>
        )}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {/* Duet badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-300 text-[10px] font-medium">
            Duet Mode
          </span>
        </div>
        <button
          onClick={() => {
            setDuetAudio(null);
            setLines([]);
          }}
          className="text-white/30 text-[10px] hover:text-white/50 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Dialogue lines */}
      {lines.length > 0 && (
        <div className="space-y-1.5">
          {lines.map((line, i) => (
            <p key={i} className="text-white/50 text-xs italic leading-relaxed">
              &ldquo;{line}&rdquo;
            </p>
          ))}
        </div>
      )}

      {/* Playback controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => togglePlayback(duetAudio)}
          className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center hover:bg-amber-500/25 transition-colors"
        >
          {isPlaying ? (
            <svg className="w-3.5 h-3.5 text-amber-300" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 text-amber-300 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>
        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-400/60 transition-all duration-100"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {error && <p className="text-red-400/60 text-[10px]">{error}</p>}
    </div>
  );
}
