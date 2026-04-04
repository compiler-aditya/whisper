"use client";

import { useState } from "react";
import { useWhisperStore } from "@/store/whisper-store";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import type { WhisperResult } from "@/types";

export default function MapPage() {
  const whispers = useWhisperStore((s) => s.whispers);
  const geoWhispers = whispers.filter((w) => w.location);
  const [selected, setSelected] = useState<WhisperResult | null>(null);
  const { togglePlayback, isPlaying, progress } = useAudioPlayback();

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <div>
            <h1 className="text-white/80 text-sm font-medium">Whisper Map</h1>
            <p className="text-white/30 text-[10px]">{geoWhispers.length} whispers geotagged</p>
          </div>
        </div>
      </div>

      {/* Map area */}
      <div className="flex-1 relative overflow-hidden">
        {geoWhispers.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-3 px-8">
              <div className="w-14 h-14 mx-auto rounded-full bg-white/5 flex items-center justify-center">
                <svg className="w-7 h-7 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <p className="text-white/30 text-sm">No geotagged whispers yet</p>
              <p className="text-white/20 text-xs">Allow location access when whispering to pin objects on the map</p>
            </div>
          </div>
        ) : (
          <MapView
            whispers={geoWhispers}
            selected={selected}
            onSelect={setSelected}
          />
        )}
      </div>

      {/* Selected whisper panel */}
      {selected && (
        <div className="border-t border-white/5 bg-gray-950/90 backdrop-blur-md px-4 py-4 animate-fade-in safe-bottom">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-base">{selected.isEnvironmental ? "🌍" : "🔊"}</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white/80 text-sm font-medium truncate">{selected.objectName}</h3>
              {selected.entityName && (
                <p className="text-emerald-400/60 text-[10px]">{selected.entityName}</p>
              )}
              <p className="text-white/30 text-[10px] mt-0.5 line-clamp-2 italic">
                &ldquo;{selected.monologue.slice(0, 80)}...&rdquo;
              </p>
            </div>

            {/* Play button */}
            <button
              onClick={() => togglePlayback(selected.audioBase64)}
              className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 hover:bg-violet-500/30 transition-colors"
            >
              {isPlaying ? (
                <svg className="w-4 h-4 text-violet-300" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-violet-300 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              )}
            </button>
          </div>

          {/* Progress */}
          {isPlaying && (
            <div className="mt-2 h-0.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-400 transition-all duration-100"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Simple map rendering whispers as positioned dots.
 * Uses a mercator-like projection relative to the bounding box of all whispers.
 */
function MapView({
  whispers,
  selected,
  onSelect,
}: {
  whispers: WhisperResult[];
  selected: WhisperResult | null;
  onSelect: (w: WhisperResult) => void;
}) {
  // Compute bounding box
  const lats = whispers.map((w) => w.location!.lat);
  const lngs = whispers.map((w) => w.location!.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // Add padding
  const padLat = Math.max((maxLat - minLat) * 0.2, 0.005);
  const padLng = Math.max((maxLng - minLng) * 0.2, 0.005);

  const toPercent = (w: WhisperResult) => {
    const lat = w.location!.lat;
    const lng = w.location!.lng;
    return {
      x: ((lng - (minLng - padLng)) / ((maxLng + padLng) - (minLng - padLng))) * 100,
      // Invert Y since higher lat = higher on screen
      y: (1 - (lat - (minLat - padLat)) / ((maxLat + padLat) - (minLat - padLat))) * 100,
    };
  };

  return (
    <div className="relative w-full h-full bg-gray-950">
      {/* Grid lines */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`h${i}`}
            className="absolute left-0 right-0 border-t border-white/20"
            style={{ top: `${(i + 1) * (100 / 7)}%` }}
          />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`v${i}`}
            className="absolute top-0 bottom-0 border-l border-white/20"
            style={{ left: `${(i + 1) * (100 / 7)}%` }}
          />
        ))}
      </div>

      {/* Whisper pins */}
      {whispers.map((w) => {
        const pos = toPercent(w);
        const isSelected = selected?.id === w.id;

        return (
          <button
            key={w.id}
            onClick={() => onSelect(w)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            {/* Pulse ring for selected */}
            {isSelected && (
              <span className="absolute inset-0 w-8 h-8 -ml-2 -mt-2 rounded-full bg-violet-500/20 animate-ping" />
            )}

            {/* Pin dot */}
            <div
              className={`
                w-4 h-4 rounded-full border-2 transition-all duration-200
                ${isSelected
                  ? "bg-violet-400 border-violet-300 scale-125"
                  : w.isEnvironmental
                    ? "bg-emerald-400/80 border-emerald-300/60 hover:scale-110"
                    : "bg-blue-400/80 border-blue-300/60 hover:scale-110"
                }
              `}
            />

            {/* Label on hover */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <span className="bg-black/80 text-white text-[9px] px-2 py-0.5 rounded whitespace-nowrap">
                {w.objectName}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
