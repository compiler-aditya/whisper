"use client";

import { useWhisperStore } from "@/store/whisper-store";
import type { WhisperResult } from "@/types";

interface HistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (whisper: WhisperResult) => void;
}

export default function HistoryDrawer({ open, onClose, onSelect }: HistoryDrawerProps) {
  const whispers = useWhisperStore((s) => s.whispers);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-40">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer from right */}
      <div className="absolute top-0 right-0 bottom-0 w-72 bg-gray-950/95 backdrop-blur-xl border-l border-white/5 animate-slide-in-right overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="sticky top-0 bg-gray-950/90 backdrop-blur-md px-4 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-white/80 text-sm font-medium">Past Whispers</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Whisper list */}
        <div className="p-3 space-y-2">
          {whispers.length === 0 ? (
            <p className="text-white/30 text-xs text-center py-8">
              No whispers yet. Point your camera at something!
            </p>
          ) : (
            whispers.map((w) => (
              <button
                key={w.id}
                onClick={() => {
                  onSelect(w);
                  onClose();
                }}
                className="w-full text-left px-3 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] transition-colors group"
              >
                <div className="flex items-start gap-3">
                  {/* Thumbnail or icon */}
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                    {w.isEnvironmental ? (
                      <span className="text-base">🌍</span>
                    ) : (
                      <span className="text-base">🔊</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm font-medium truncate group-hover:text-white transition-colors">
                      {w.objectName}
                    </p>
                    {w.entityName && (
                      <p className="text-emerald-400/60 text-[10px] mt-0.5">
                        {w.entityName}
                      </p>
                    )}
                    <p className="text-white/30 text-[10px] mt-1">
                      {formatTimeAgo(w.timestamp)}
                    </p>
                  </div>

                  {/* Play indicator */}
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-3 h-3 text-white/50 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
