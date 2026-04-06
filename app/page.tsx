"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import CameraView from "@/components/CameraView";
import WhisperReveal from "@/components/WhisperReveal";
import BottomSheet from "@/components/BottomSheet";
import ObjectCard from "@/components/ObjectCard";
import AudioPlayer from "@/components/AudioPlayer";
import ConversationMode from "@/components/ConversationMode";
import ShareButton from "@/components/ShareButton";
import DuetMode from "@/components/DuetMode";
import HistoryDrawer from "@/components/HistoryDrawer";
import AuthScreen from "@/components/AuthScreen";
import AccountDrawer from "@/components/AccountDrawer";
import { useWhisper } from "@/hooks/useWhisper";
import { useWhisperStore } from "@/store/whisper-store";
import { useAuthStore } from "@/store/auth-store";
import { useGeolocation } from "@/hooks/useGeolocation";
import type { WhisperResult } from "@/types";

export default function Home() {
  const {
    startWhisper,
    currentWhisper,
    isProcessing,
    processingStage,
    revealData,
    setCurrentWhisper,
    setProcessing,
    setRevealData,
  } = useWhisper();
  const whispers = useWhisperStore((s) => s.whispers);
  const addMapPin = useWhisperStore((s) => s.addMapPin);
  const user = useAuthStore((s) => s.user);
  const authSignUp = useAuthStore((s) => s.signUp);
  const { data: session } = useSession();
  const { getLocation } = useGeolocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState<"character" | "assist" | "sky">("character");

  // Sync Google session to local auth store
  useEffect(() => {
    if (session?.user && !user) {
      authSignUp(
        session.user.name || "User",
        session.user.email || "google@user"
      );
    }
  }, [session, user, authSignUp]);

  const handleCapture = useCallback(
    async (imageBase64: string) => {
      setError(null);
      setSheetOpen(false);

      try {
        const location = await getLocation();
        const whisper = await startWhisper(
          imageBase64,
          location ?? undefined,
          cameraMode === "assist",
          cameraMode === "sky"
        );

        if (whisper) {
          // Save map pin if we have location
          if (location) {
            addMapPin({
              id: whisper.id,
              whisperId: whisper.id,
              objectName: whisper.objectName,
              entityName: whisper.entityName,
              location,
              timestamp: Date.now(),
            });
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setProcessing(false);
      }
    },
    [startWhisper, getLocation, setProcessing, addMapPin, cameraMode]
  );

  // Called when reveal audio finishes — transition to bottom sheet
  const handleRevealFinished = useCallback(() => {
    setRevealData(null);
    setProcessing(false);
    setSheetOpen(true);
  }, [setRevealData, setProcessing]);

  // Quick re-scan: close everything and return to camera
  const handleRescan = useCallback(() => {
    setSheetOpen(false);
    setCurrentWhisper(null);
    setRevealData(null);
    setProcessing(false);
    setError(null);
  }, [setCurrentWhisper, setProcessing, setRevealData]);

  const handleClose = useCallback(() => {
    setSheetOpen(false);
    setCurrentWhisper(null);
    setProcessing(false);
    setError(null);
  }, [setCurrentWhisper, setProcessing]);

  const handleHistorySelect = useCallback(
    (whisper: WhisperResult) => {
      setCurrentWhisper(whisper);
      setSheetOpen(true);
    },
    [setCurrentWhisper]
  );

  // Show auth screen if not logged in (and no Google session)
  if (!user && !session?.user) {
    return <AuthScreen />;
  }

  // Brief loading state while syncing Google session
  if (!user) {
    return <div className="h-full w-full bg-black" />;
  }

  return (
    <main className="relative h-full w-full">
      {/* Camera view (always visible behind everything) */}
      <CameraView
        onCapture={handleCapture}
        disabled={isProcessing || sheetOpen}
        mode={cameraMode}
        onSetMode={setCameraMode}
      />

      {/* Progressive reveal overlay (replaces old LoadingWhisper) */}
      {isProcessing && revealData && !sheetOpen && (
        <WhisperReveal
          reveal={revealData}
          stage={processingStage}
          onAudioFinished={handleRevealFinished}
        />
      )}

      {/* Error toast */}
      {error && (
        <div className="absolute top-12 left-4 right-4 z-40 animate-fade-in">
          <div className="px-5 py-3 text-center" style={{ background: "var(--surface)", border: "1px solid rgba(212,68,59,0.2)", borderRadius: 12 }}>
            <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-xs mt-1 transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Result bottom sheet */}
      <BottomSheet open={sheetOpen} onClose={handleClose}>
        {currentWhisper && (
          <div className="space-y-6 stagger-children">
            {/* Captured image + object info */}
            {currentWhisper.imageBase64 && (
              <div className="flex gap-4 items-start">
                <div className="w-16 h-16 overflow-hidden flex-shrink-0" style={{ borderRadius: 12, border: "1px solid var(--border)" }}>
                  <img
                    src={`data:image/jpeg;base64,${currentWhisper.imageBase64}`}
                    alt={currentWhisper.objectName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <ObjectCard whisper={currentWhisper} />
              </div>
            )}
            {!currentWhisper.imageBase64 && (
              <ObjectCard whisper={currentWhisper} />
            )}

            <AudioPlayer
              audioBase64={currentWhisper.audioBase64}
              autoPlay={false}
            />

            <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
              <ConversationMode />
            </div>

            <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
              <DuetMode whisper={currentWhisper} />
            </div>

            <div className="flex items-center justify-between pt-3">
              <ShareButton whisper={currentWhisper} />

              <button
                onClick={handleRescan}
                className="flex items-center gap-2 px-4 py-2.5 text-sm transition-all active:scale-95"
                style={{ color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: 10 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
                Scan again
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* History drawer */}
      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelect={handleHistorySelect}
      />

      {/* Account drawer */}
      <AccountDrawer
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        onSelectWhisper={handleHistorySelect}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 pt-5 pointer-events-none">
        {/* Brand mark — sound wave */}
        <div className="flex items-end gap-[2px]">
          {[0.3, 0.6, 1, 0.6, 0.3].map((h, i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: 2,
                height: h * 12,
                background: "var(--accent)",
                opacity: 0.4,
              }}
            />
          ))}
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          {whispers.length > 0 && (
            <>
              <a
                href="/map"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "rgba(5,5,5,0.5)", border: "1px solid var(--border)" }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="var(--text-secondary)" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </a>

              <button
                onClick={() => setHistoryOpen(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "rgba(5,5,5,0.5)", border: "1px solid var(--border)" }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="var(--text-secondary)" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </>
          )}

          <button
            onClick={() => setAccountOpen(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: "rgba(5,5,5,0.5)",
              border: `1px solid ${user.avatarColor}25`,
            }}
          >
            <span className="text-[10px] font-medium" style={{ color: user.avatarColor }}>
              {user.name.charAt(0).toUpperCase()}
            </span>
          </button>
        </div>
      </div>
    </main>
  );
}
