"use client";

import { useState, useCallback } from "react";
import CameraView from "@/components/CameraView";
import LoadingWhisper from "@/components/LoadingWhisper";
import BottomSheet from "@/components/BottomSheet";
import ObjectCard from "@/components/ObjectCard";
import AudioPlayer from "@/components/AudioPlayer";
import ConversationMode from "@/components/ConversationMode";
import ShareButton from "@/components/ShareButton";
import DuetMode from "@/components/DuetMode";
import HistoryDrawer from "@/components/HistoryDrawer";
import { useWhisper } from "@/hooks/useWhisper";
import { useWhisperStore } from "@/store/whisper-store";
import { useGeolocation } from "@/hooks/useGeolocation";
import type { WhisperResult } from "@/types";

export default function Home() {
  const {
    startWhisper,
    currentWhisper,
    isProcessing,
    processingStage,
    setCurrentWhisper,
    setProcessing,
  } = useWhisper();
  const whispers = useWhisperStore((s) => s.whispers);
  const addMapPin = useWhisperStore((s) => s.addMapPin);
  const { getLocation } = useGeolocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = useCallback(
    async (imageBase64: string) => {
      setError(null);

      try {
        const locationPromise = getLocation();
        const location = await locationPromise;
        const whisper = await startWhisper(imageBase64, location ?? undefined);

        if (whisper) {
          setSheetOpen(true);
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
    [startWhisper, getLocation, setProcessing, addMapPin]
  );

  const handleClose = useCallback(() => {
    setSheetOpen(false);
    setCurrentWhisper(null);
    setProcessing(false);
    setError(null);
  }, [setCurrentWhisper, setProcessing]);

  const handleAudioFinished = useCallback(() => {
    setProcessing(false);
  }, [setProcessing]);

  const handleHistorySelect = useCallback(
    (whisper: WhisperResult) => {
      setCurrentWhisper(whisper);
      setSheetOpen(true);
    },
    [setCurrentWhisper]
  );

  return (
    <main className="relative h-full w-full">
      {/* Camera view (always visible behind everything) */}
      <CameraView
        onCapture={handleCapture}
        disabled={isProcessing || sheetOpen}
      />

      {/* Loading overlay */}
      {isProcessing && !sheetOpen && (
        <LoadingWhisper stage={processingStage} />
      )}

      {/* Error toast */}
      {error && (
        <div className="absolute top-12 left-4 right-4 z-40 animate-fade-in">
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-center">
            <p className="text-red-300 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-400/60 text-xs mt-1 hover:text-red-400"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Result bottom sheet */}
      <BottomSheet open={sheetOpen} onClose={handleClose}>
        {currentWhisper && (
          <div className="space-y-5 stagger-children">
            <ObjectCard whisper={currentWhisper} />

            <AudioPlayer
              audioBase64={currentWhisper.audioBase64}
              autoPlay
              onFinished={handleAudioFinished}
            />

            <div className="border-t border-white/5 pt-4">
              <ConversationMode />
            </div>

            <div className="border-t border-white/5 pt-4">
              <DuetMode whisper={currentWhisper} />
            </div>

            <div className="flex justify-center pt-2">
              <ShareButton whisper={currentWhisper} />
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

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-4 pointer-events-none">
        {/* Branding */}
        <h1 className="text-white/40 text-xs font-light tracking-[0.3em] uppercase">
          Whisper
        </h1>

        {/* Nav buttons */}
        {whispers.length > 0 && (
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Map button */}
            <a
              href="/map"
              className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/50 transition-colors"
            >
              <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </a>

            {/* History button */}
            <button
              onClick={() => setHistoryOpen(true)}
              className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/50 transition-colors"
            >
              <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
