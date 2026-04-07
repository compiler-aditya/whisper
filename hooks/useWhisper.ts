"use client";

import { useCallback } from "react";
import { useWhisperStore } from "@/store/whisper-store";
import type { WhisperResult, VisionResult, Personality, ObjectMemory } from "@/types";

export class WhisperError extends Error {
  code: string;
  title: string;
  retryable: boolean;
  constructor(title: string, message: string, code = "UNKNOWN", retryable = true) {
    super(message);
    this.name = "WhisperError";
    this.title = title;
    this.code = code;
    this.retryable = retryable;
  }
}

export function useWhisper() {
  const {
    setProcessing,
    setProcessingStage,
    addWhisper,
    setCurrentWhisper,
    setRevealData,
    currentWhisper,
    isProcessing,
    processingStage,
    revealData,
    objectMemories,
    upsertObjectMemory,
  } = useWhisperStore();

  const startWhisper = useCallback(
    async (
      imageBase64: string,
      location?: { lat: number; lng: number },
      assistMode?: boolean,
      skyMode?: boolean
    ) => {
      setProcessing(true, "recognizing");
      setRevealData({ imageBase64 });

      // Check for previous encounters
      const previousEncounter = findPreviousEncounter(objectMemories, null);

      try {
        const res = await fetch("/api/whisper", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64, location, previousEncounter, assistMode, skyMode }),
        });

        if (!res.ok || !res.body) {
          throw new Error(`Server error (${res.status})`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        let vision: VisionResult | null = null;
        let personality: Personality | null = null;
        let entityName: string | undefined;
        let voiceId = "";
        let audioBase64 = "";
        let facts: string[] = [];
        let whisperId = "";
        let finalSystemPrompt = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE events from buffer
          const events = buffer.split("\n\n");
          buffer = events.pop() || ""; // keep incomplete chunk

          for (const event of events) {
            const eventMatch = event.match(/^event: (\w+)\ndata: ([\s\S]+)$/);
            if (!eventMatch) continue;

            const [, type, dataStr] = eventMatch;
            let data;
            try {
              data = JSON.parse(dataStr);
            } catch {
              continue;
            }

            switch (type) {
              case "vision":
                vision = data as VisionResult;
                setProcessingStage("personality");
                setRevealData({
                  imageBase64,
                  objectType: vision.objectType,
                  material: vision.material,
                  condition: vision.condition,
                });
                // Now we know the object type, find memory match
                const match = findPreviousEncounter(objectMemories, vision);
                if (match && !previousEncounter) {
                  // We could use this for future calls but personality is already generating
                }
                break;

              case "personality":
                personality = data as Personality & { entityName?: string };
                entityName = (data as { entityName?: string }).entityName;
                setProcessingStage("voice");
                setRevealData({
                  imageBase64,
                  objectType: vision?.objectType,
                  material: vision?.material,
                  condition: vision?.condition,
                  name: personality.name,
                  traits: personality.traits,
                  monologue: personality.monologue,
                  entityName,
                  conversationStarters: personality.conversationStarters,
                });
                break;

              case "voice":
                voiceId = data.voiceId;
                audioBase64 = data.audioBase64;
                setProcessingStage("speaking");
                setRevealData({
                  imageBase64,
                  objectType: vision?.objectType,
                  material: vision?.material,
                  condition: vision?.condition,
                  name: personality?.name,
                  traits: personality?.traits,
                  monologue: personality?.monologue,
                  entityName,
                  conversationStarters: personality?.conversationStarters,
                  audioBase64,
                });
                break;

              case "done":
                whisperId = data.id;
                facts = data.facts || [];
                finalSystemPrompt = data.systemPrompt || personality?.systemPrompt || "";
                setProcessingStage("complete");
                break;

              case "error":
                throw new WhisperError(
                  data.title || "Something went wrong",
                  data.message || "Pipeline failed",
                  data.code || "UNKNOWN",
                  data.retryable ?? true
                );
            }
          }
        }

        if (!personality || !voiceId || !audioBase64) {
          throw new Error("Incomplete response from server");
        }

        // Update system prompt with facts
        if (finalSystemPrompt) {
          personality.systemPrompt = finalSystemPrompt;
        }

        const whisper: WhisperResult = {
          id: whisperId,
          objectName: personality.name,
          personality,
          monologue: personality.monologue,
          voiceId,
          audioBase64,
          facts,
          isEnvironmental: vision?.isEnvironmental ?? false,
          entityName,
          location,
          timestamp: Date.now(),
          imageBase64,
        };

        addWhisper(whisper);

        // Save to object memory
        if (vision) {
          upsertObjectMemory({
            objectType: vision.objectType,
            material: vision.material,
            name: personality.name,
            traits: personality.traits,
          });
        }

        return whisper;
      } catch (err) {
        setProcessing(false);
        setRevealData(null);
        if (err instanceof WhisperError) throw err;
        // Wrap network/client-side errors into friendly WhisperError
        const msg = err instanceof Error ? err.message : String(err);
        if (/network|fetch|Failed to fetch/i.test(msg)) {
          throw new WhisperError(
            "Connection interrupted",
            "Check your internet connection and try again.",
            "NETWORK"
          );
        }
        throw new WhisperError("Something went wrong", "Please try again.", "UNKNOWN");
      }
    },
    [setProcessing, setProcessingStage, addWhisper, setRevealData, objectMemories, upsertObjectMemory]
  );

  return {
    startWhisper,
    currentWhisper,
    isProcessing,
    processingStage,
    revealData,
    setCurrentWhisper,
    setProcessing,
    setRevealData,
  };
}

function findPreviousEncounter(
  memories: ObjectMemory[],
  vision: VisionResult | null
): ObjectMemory | null {
  if (!vision || memories.length === 0) return null;
  const key = `${vision.objectType.toLowerCase()}|${vision.material.toLowerCase()}`;
  return (
    memories.find(
      (m) =>
        `${m.objectType.toLowerCase()}|${m.material.toLowerCase()}` === key
    ) ?? null
  );
}
