"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  WhisperResult,
  Clip,
  MapPin,
  ProcessingStage,
  TranscriptEntry,
  ObjectMemory,
} from "@/types";

export interface RevealData {
  imageBase64: string;
  objectType?: string;
  material?: string;
  condition?: string;
  name?: string;
  traits?: string[];
  monologue?: string;
  entityName?: string;
  conversationStarters?: string[];
  audioBase64?: string;
}

interface WhisperStore {
  // Current session
  currentWhisper: WhisperResult | null;
  isProcessing: boolean;
  processingStage: ProcessingStage;
  revealData: RevealData | null;

  // Conversation
  conversationActive: boolean;
  agentId: string | null;
  signedUrl: string | null;
  transcript: TranscriptEntry[];

  // History (persisted)
  whispers: WhisperResult[];
  clips: Clip[];
  mapPins: MapPin[];
  objectMemories: ObjectMemory[];

  // Actions
  setCurrentWhisper: (whisper: WhisperResult | null) => void;
  setProcessing: (processing: boolean, stage?: ProcessingStage) => void;
  setProcessingStage: (stage: ProcessingStage) => void;
  setRevealData: (data: RevealData | null) => void;
  addWhisper: (whisper: WhisperResult) => void;

  setConversation: (active: boolean, agentId?: string | null, signedUrl?: string | null) => void;
  addTranscriptEntry: (entry: TranscriptEntry) => void;
  clearTranscript: () => void;

  addClip: (clip: Clip) => void;
  addMapPin: (pin: MapPin) => void;

  upsertObjectMemory: (partial: { objectType: string; material: string; name: string; traits: string[] }) => void;

  reset: () => void;
}

export const useWhisperStore = create<WhisperStore>()(
  persist(
    (set) => ({
      currentWhisper: null,
      isProcessing: false,
      processingStage: "idle",
      revealData: null,
      conversationActive: false,
      agentId: null,
      signedUrl: null,
      transcript: [],
      whispers: [],
      clips: [],
      mapPins: [],
      objectMemories: [],

      setCurrentWhisper: (whisper) => set({ currentWhisper: whisper }),

      setProcessing: (processing, stage) =>
        set({
          isProcessing: processing,
          processingStage: stage ?? (processing ? "capturing" : "idle"),
        }),

      setProcessingStage: (stage) => set({ processingStage: stage }),

      setRevealData: (data) =>
        set((state) => ({
          revealData: data
            ? state.revealData
              ? { ...state.revealData, ...data }
              : data
            : null,
        })),

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

      upsertObjectMemory: ({ objectType, material, name, traits }) =>
        set((state) => {
          const key = `${objectType.toLowerCase()}|${material.toLowerCase()}`;
          const existing = state.objectMemories.find(
            (m) => `${m.objectType.toLowerCase()}|${m.material.toLowerCase()}` === key
          );
          if (existing) {
            return {
              objectMemories: state.objectMemories.map((m) =>
                `${m.objectType.toLowerCase()}|${m.material.toLowerCase()}` === key
                  ? { ...m, name, traits, scanCount: m.scanCount + 1, lastSeen: Date.now() }
                  : m
              ),
            };
          }
          return {
            objectMemories: [
              ...state.objectMemories,
              { objectType, material, name, traits, scanCount: 1, firstSeen: Date.now(), lastSeen: Date.now() },
            ].slice(0, 200),
          };
        }),

      reset: () =>
        set({
          currentWhisper: null,
          isProcessing: false,
          processingStage: "idle",
          revealData: null,
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
        objectMemories: state.objectMemories,
      }),
    }
  )
);
