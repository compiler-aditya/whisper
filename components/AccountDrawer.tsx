"use client";

import { signOut as nextAuthSignOut } from "next-auth/react";
import { useAuthStore } from "@/store/auth-store";
import { useWhisperStore } from "@/store/whisper-store";
import type { WhisperResult } from "@/types";

interface AccountDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelectWhisper: (whisper: WhisperResult) => void;
}

export default function AccountDrawer({ open, onClose, onSelectWhisper }: AccountDrawerProps) {
  const user = useAuthStore((s) => s.user);
  const conversations = useAuthStore((s) => s.conversations);
  const signOut = useAuthStore((s) => s.signOut);
  const whispers = useWhisperStore((s) => s.whispers);

  if (!open || !user) return null;

  const totalConversations = conversations.length;
  const totalMessages = conversations.reduce((acc, c) => acc + c.transcript.length, 0);

  return (
    <div className="absolute inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: "rgba(5,5,5,0.8)" }} onClick={onClose} />

      {/* Drawer */}
      <div
        className="absolute top-0 right-0 bottom-0 w-80 overflow-y-auto scrollbar-thin animate-slide-in-right"
        style={{ background: "var(--surface)", borderLeft: "1px solid var(--border)" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
          <div className="px-6 py-5 flex items-center justify-between">
            <span className="text-xs tracking-[0.15em] uppercase" style={{ color: "var(--text-muted)" }}>Account</span>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Profile */}
        <div className="px-6 py-6" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
              style={{
                background: user.avatarColor + "15",
                border: `1px solid ${user.avatarColor}30`,
                color: user.avatarColor,
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-light truncate" style={{ color: "var(--text)" }}>{user.name}</p>
              <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>{user.email}</p>
            </div>
          </div>

          {/* Stats — clean, no boxes */}
          <div className="flex gap-8">
            {[
              { value: whispers.length, label: "Scans" },
              { value: totalConversations, label: "Chats" },
              { value: totalMessages, label: "Messages" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-lg font-extralight" style={{ color: "var(--text)" }}>{value}</p>
                <p className="text-[9px] tracking-[0.15em] uppercase" style={{ color: "var(--text-muted)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="px-6 py-5">
          <h3 className="text-[9px] tracking-[0.2em] uppercase mb-4" style={{ color: "var(--text-muted)" }}>
            History
          </h3>

          {whispers.length === 0 ? (
            <p className="text-xs text-center py-8" style={{ color: "var(--text-muted)" }}>
              No activity yet
            </p>
          ) : (
            <div className="space-y-1">
              {whispers.map((w) => {
                const convos = conversations.filter((c) => c.whisperId === w.id);
                const messageCount = convos.reduce((acc, c) => acc + c.transcript.length, 0);

                return (
                  <button
                    key={w.id}
                    onClick={() => { onSelectWhisper(w); onClose(); }}
                    className="w-full text-left py-3 transition-all group"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <div className="flex items-start gap-3">
                      {w.imageBase64 ? (
                        <div
                          className="w-10 h-10 overflow-hidden flex-shrink-0"
                          style={{ borderRadius: 8, border: "1px solid var(--border)" }}
                        >
                          <img
                            src={`data:image/jpeg;base64,${w.imageBase64}`}
                            alt={w.objectName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                          style={{
                            borderRadius: 8,
                            background: w.isEnvironmental ? "var(--eco-dim)" : "var(--accent-dim)",
                          }}
                        >
                          <span className="text-xs">{w.isEnvironmental ? "🌍" : "🔊"}</span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-light truncate transition-colors" style={{ color: "var(--text-secondary)" }}>
                          {w.objectName}
                        </p>
                        {w.entityName && (
                          <p className="text-[10px]" style={{ color: "var(--eco)", opacity: 0.6 }}>{w.entityName}</p>
                        )}
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                            {formatTimeAgo(w.timestamp)}
                          </span>
                          {messageCount > 0 && (
                            <>
                              <span style={{ color: "var(--text-muted)", fontSize: 8 }}>·</span>
                              <span className="text-[10px]" style={{ color: "var(--accent)", opacity: 0.5 }}>
                                {messageCount} msg
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Sign out */}
        <div className="px-6 py-6" style={{ borderTop: "1px solid var(--border)" }}>
          <button
            onClick={() => { signOut(); nextAuthSignOut({ redirect: false }); onClose(); }}
            className="w-full py-2.5 text-xs transition-all active:scale-[0.98]"
            style={{
              color: "var(--danger)",
              border: "1px solid rgba(212,68,59,0.15)",
              borderRadius: 10,
            }}
          >
            Sign Out
          </button>
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
