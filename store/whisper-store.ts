"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  WhisperResult,
  Clip,
  MapPin,
  ProcessingStage,
  TranscriptEntry,
} from "@/types";

interface WhisperStore {
  // Current session
  currentWhisper: WhisperResult | null;
  isProcessing: boolean;
  processingStage: ProcessingStage;

  // Conversation
  conversationActive: boolean;
  agentId: string | null;
  signedUrl: string | null;
  transcript: TranscriptEntry[];

  // History (persisted)
  whispers: WhisperResult[];
  clips: Clip[];
  mapPins: MapPin[];

  // Actions
  setCurrentWhisper: (whisper: WhisperResult | null) => void;
  setProcessing: (processing: boolean, stage?: ProcessingStage) => void;
  setProcessingStage: (stage: ProcessingStage) => void;
  addWhisper: (whisper: WhisperResult) => void;

  setConversation: (active: boolean, agentId?: string | null, signedUrl?: string | null) => void;
  addTranscriptEntry: (entry: TranscriptEntry) => void;
  clearTranscript: () => void;

  addClip: (clip: Clip) => void;
  addMapPin: (pin: MapPin) => void;

  reset: () => void;
}

export const useWhisperStore = create<WhisperStore>()(
  persist(
    (set) => ({
      currentWhisper: null,
      isProcessing: false,
      processingStage: "idle",
      conversationActive: false,
      agentId: null,
      signedUrl: null,
      transcript: [],
      whispers: [],
      clips: [],
      mapPins: [],

      setCurrentWhisper: (whisper) => set({ currentWhisper: whisper }),

      setProcessing: (processing, stage) =>
        set({
          isProcessing: processing,
          processingStage: stage ?? (processing ? "capturing" : "idle"),
        }),

      setProcessingStage: (stage) => set({ processingStage: stage }),

      addWhisper: (whisper) =>
        set((state) => ({
          whispers: [whisper, ...state.whispers].slice(0, 100),
          currentWhisper: whisper,
        })),

      setConversation: (active, agentId = null, signedUrl = null) =>
        set({ conversationActive: active, agentId, signedUrl }),

      addTranscriptEntry: (entry) =>
        set((state) => ({
          transcript: [...state.transcript, entry],
        })),

      clearTranscript: () => set({ transcript: [] }),

      addClip: (clip) =>
        set((state) => ({
          clips: [clip, ...state.clips].slice(0, 50),
        })),

      addMapPin: (pin) =>
        set((state) => ({
          mapPins: [pin, ...state.mapPins].slice(0, 200),
        })),

      reset: () =>
        set({
          currentWhisper: null,
          isProcessing: false,
          processingStage: "idle",
          conversationActive: false,
          agentId: null,
          signedUrl: null,
          transcript: [],
        }),
    }),
    {
      name: "whisper-storage",
      partialize: (state) => ({
        whispers: state.whispers,
        clips: state.clips,
        mapPins: state.mapPins,
      }),
    }
  )
);
