"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useWhisperStore } from "@/store/whisper-store";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import type { Clip } from "@/types";

export default function ClipPage() {
  const params = useParams();
  const clipId = params.id as string;
  const clips = useWhisperStore((s) => s.clips);
  const whispers = useWhisperStore((s) => s.whispers);
  const [clip, setClip] = useState<Clip | null>(null);
  const { playBase64Audio, togglePlayback, isPlaying, progress } = useAudioPlayback();

  useEffect(() => {
    const found = clips.find((c) => c.id === clipId);
    setClip(found ?? null);
  }, [clipId, clips]);

  if (!clip) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center">
            <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
          </div>
          <p className="text-white/40 text-sm">Clip not found</p>
          <a href="/" className="inline-block text-violet-400/70 text-xs hover:text-violet-400 transition-colors">
            Open Whisper
          </a>
        </div>
      </div>
    );
  }

  const audioBase64 = clip.audioBlob || clip.voiceAudioBase64;
  const whisper = whispers.find((w) => w.id === clip.whisperId);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-black px-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        {/* Branding */}
        <p className="text-white/30 text-xs tracking-[0.3em] uppercase">Whisper</p>

        {/* Animated orb */}
        <div className="relative mx-auto w-32 h-32">
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/30 to-blue-500/30 ${isPlaying ? "animate-orb-pulse" : ""}`} />
          <div className={`absolute inset-3 rounded-full bg-gradient-to-br from-violet-500/50 to-blue-500/50 ${isPlaying ? "animate-orb-pulse" : ""}`} style={{ animationDelay: "0.3s" }} />
          <div className="absolute inset-6 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center">
            <button
              onClick={() => togglePlayback(audioBase64)}
              className="w-full h-full rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              {isPlaying ? (
                <div className="flex items-end gap-[3px]">
                  {[0.4, 0.7, 1, 0.7, 0.4].map((s, i) => (
                    <div
                      key={i}
                      className="w-[3px] bg-white/90 rounded-full wave-bar"
                      style={{ height: `${s * 20}px`, animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              ) : (
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Object info */}
        <div className="space-y-2">
          {clip.entityName && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-emerald-300 text-[10px]">{clip.entityName}</span>
            </div>
          )}
          <h1 className="text-white text-xl font-semibold">{clip.objectName}</h1>
          {whisper && (
            <p className="text-white/40 text-sm italic leading-relaxed">
              &ldquo;{whisper.monologue.slice(0, 120)}...&rdquo;
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-400 to-blue-400 transition-all duration-100"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* CTA */}
        <a
          href="/"
          className="inline-block px-6 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 rounded-full text-white text-sm font-medium hover:from-violet-500 hover:to-blue-500 transition-all"
        >
          Try Whisper
        </a>
      </div>
    </div>
  );
}
