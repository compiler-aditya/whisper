"use client";

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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer from right */}
      <div className="absolute top-0 right-0 bottom-0 w-80 bg-[#0e0e10]/98 backdrop-blur-xl border-l border-white/5 animate-slide-in-right overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="sticky top-0 bg-[#0e0e10]/95 backdrop-blur-md border-b border-white/5 z-10">
          <div className="px-5 py-4 flex items-center justify-between">
            <h2 className="text-white/80 text-sm font-medium">Account</h2>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Profile card */}
        <div className="px-5 py-5">
          <div className="flex items-center gap-3.5 mb-5">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{ backgroundColor: user.avatarColor + "30", borderColor: user.avatarColor + "50", borderWidth: 1 }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white/90 text-sm font-medium truncate">{user.name}</p>
              <p className="text-white/30 text-[11px] truncate">{user.email}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-center">
              <p className="text-white/80 text-base font-semibold">{whispers.length}</p>
              <p className="text-white/30 text-[9px] uppercase tracking-wider">Scans</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-center">
              <p className="text-white/80 text-base font-semibold">{totalConversations}</p>
              <p className="text-white/30 text-[9px] uppercase tracking-wider">Chats</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-center">
              <p className="text-white/80 text-base font-semibold">{totalMessages}</p>
              <p className="text-white/30 text-[9px] uppercase tracking-wider">Messages</p>
            </div>
          </div>
        </div>

        {/* Activity history */}
        <div className="px-5 pb-4">
          <h3 className="text-white/40 text-[10px] uppercase tracking-wider mb-3">History</h3>

          {whispers.length === 0 ? (
            <p className="text-white/20 text-xs text-center py-6">
              No activity yet. Scan something!
            </p>
          ) : (
            <div className="space-y-2">
              {whispers.map((w) => {
                const convos = conversations.filter((c) => c.whisperId === w.id);
                const messageCount = convos.reduce((acc, c) => acc + c.transcript.length, 0);

                return (
                  <button
                    key={w.id}
                    onClick={() => { onSelectWhisper(w); onClose(); }}
                    className="w-full text-left rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] transition-all group"
                  >
                    <div className="px-3 py-3 flex items-start gap-3">
                      {/* Thumbnail */}
                      {w.imageBase64 ? (
                        <div className="w-11 h-11 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                          <img
                            src={`data:image/jpeg;base64,${w.imageBase64}`}
                            alt={w.objectName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm">{w.isEnvironmental ? "🌍" : "🔊"}</span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-white/80 text-sm font-medium truncate group-hover:text-white transition-colors">
                          {w.objectName}
                        </p>
                        {w.entityName && (
                          <p className="text-emerald-400/50 text-[10px]">{w.entityName}</p>
                        )}

                        {/* Conversation info */}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-white/25 text-[10px]">
                            {formatTimeAgo(w.timestamp)}
                          </span>
                          {messageCount > 0 && (
                            <>
                              <span className="text-white/10">·</span>
                              <span className="text-violet-400/50 text-[10px]">
                                {messageCount} messages
                              </span>
                            </>
                          )}
                        </div>

                        {/* Last conversation preview */}
                        {convos.length > 0 && convos[0].transcript.length > 0 && (
                          <p className="text-white/20 text-[10px] mt-1 truncate italic">
                            &ldquo;{convos[0].transcript[0].text}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Sign out */}
        <div className="px-5 py-5 border-t border-white/5 mt-2">
          <button
            onClick={() => { signOut(); onClose(); }}
            className="w-full py-2.5 text-xs text-red-400/60 border border-red-400/10 rounded-xl hover:bg-red-400/5 hover:text-red-400/80 transition-all"
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
