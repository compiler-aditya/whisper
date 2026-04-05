"use client";

import { useCallback } from "react";
import { useWhisperStore } from "@/store/whisper-store";
import type { WhisperResponse, WhisperResult } from "@/types";

const MAX_RETRIES = 1;
const TIMEOUT_MS = 120000;

export function useWhisper() {
  const {
    setProcessing,
    setProcessingStage,
    addWhisper,
    setCurrentWhisper,
    currentWhisper,
    isProcessing,
    processingStage,
  } = useWhisperStore();

  const startWhisper = useCallback(
    async (
      imageBase64: string,
      location?: { lat: number; lng: number }
    ) => {
      setProcessing(true, "recognizing");

      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          if (attempt > 0) {
            setProcessingStage("recognizing");
            // Brief pause so user sees the retry stage
            await new Promise((r) => setTimeout(r, 300));
          }

          setProcessingStage("generating");

          // Fetch with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

          const res = await fetch("/api/whisper", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64, location }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: `Server error (${res.status})` }));
            throw new Error(err.error || `Request failed (${res.status})`);
          }

          const data: WhisperResponse = await res.json();

          // Validate response has required fields
          if (!data.audioBase64 || !data.voiceId) {
            throw new Error("Incomplete response from server");
          }

          setProcessingStage("speaking");

          const whisper: WhisperResult = {
            ...data,
            location,
            timestamp: Date.now(),
            imageBase64,
          };

          addWhisper(whisper);
          return whisper;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error("Unknown error");
          console.error(`Whisper attempt ${attempt + 1} failed:`, lastError.message);

          if (lastError.name === "AbortError") {
            lastError = new Error("Request timed out. Please try again.");
            break; // Don't retry timeouts
          }

          if (attempt < MAX_RETRIES) {
            // Brief pause before retry
            await new Promise((r) => setTimeout(r, 500));
          }
        }
      }

      setProcessing(false);
      throw lastError || new Error("Whisper failed");
    },
    [setProcessing, setProcessingStage, addWhisper]
  );

  return {
    startWhisper,
    currentWhisper,
    isProcessing,
    processingStage,
    setCurrentWhisper,
    setProcessing,
  };
}
