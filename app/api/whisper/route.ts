import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { identifyObject, generatePersonality, generateEntityMonologue } from "@/lib/gemini";
import { designVoice, saveVoice, textToSpeech } from "@/lib/elevenlabs";
import { searchFacts, buildSearchQueries } from "@/lib/firecrawl";
import { getAffectedEntity } from "@/lib/environmental";
import type { WhisperResponse, Personality } from "@/types";

// Fallback voice ID if Voice Design fails (ElevenLabs "Adam" voice)
const FALLBACK_VOICE_ID = "pNInz6obpgDQGcFmaJgB";

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, location } = await req.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Step 1: Vision recognition (critical — no fallback)
    let vision;
    try {
      vision = await identifyObject(imageBase64);
    } catch (err) {
      console.error("Vision failed, retrying:", err);
      // Retry once
      vision = await identifyObject(imageBase64);
    }

    // Step 2: Fetch facts (non-blocking — app works without facts)
    const queries = buildSearchQueries(
      vision.objectType,
      vision.material,
      vision.environmentalCategory,
      location
    );

    let facts: string[] = [];
    try {
      const factsArrays = await Promise.allSettled(
        queries.map((q) => searchFacts(q, 3))
      );
      facts = factsArrays
        .filter((r) => r.status === "fulfilled")
        .flatMap((r) => (r as PromiseFulfilledResult<string[]>).value)
        .filter((f, i, arr) => arr.indexOf(f) === i)
        .slice(0, 8);
    } catch (err) {
      console.error("Facts gathering failed (continuing without):", err);
    }

    // Step 3: Generate personality (with fallback)
    let personality: Personality;
    try {
      personality = await generatePersonality(vision, facts);
    } catch (err) {
      console.error("Personality generation failed, using fallback:", err);
      personality = {
        name: `The ${vision.objectType}`,
        traits: ["observant", "curious", "friendly"],
        voiceDescription: "Native English. Male, middle-aged. Good quality. Persona: friendly observer. Emotion: warm, curious. Clear steady voice with a conversational tone.",
        monologue: `Hey there. I'm your ${vision.objectType}. I've been sitting here in this ${vision.context}, made of ${vision.material}, and I have to say — it's nice to finally be noticed. You'd be surprised what I've seen from here.`,
        systemPrompt: `You are a ${vision.objectType} made of ${vision.material}. You're friendly, observant, and slightly amused by the world. Be conversational.`,
      };
    }

    // Step 4: Environmental conscience check
    let entityName: string | undefined;
    if (vision.isEnvironmental && vision.environmentalCategory) {
      const entity = getAffectedEntity(vision.environmentalCategory);
      if (entity) {
        entityName = entity.name;
        personality.voiceDescription = entity.voiceDescription;
        try {
          const entityMonologue = await generateEntityMonologue(entity, facts);
          if (entityMonologue.length >= 50) {
            personality.monologue = entityMonologue.slice(0, 1000);
          }
        } catch (err) {
          console.error("Entity monologue failed (using standard):", err);
        }
        personality.systemPrompt = `You are ${entity.name}. ${entity.monologuePrompt}\n\nFacts you know:\n${facts.join("\n")}\n\nStay in character. Be conversational. Use empathy, not guilt.`;
      }
    }

    // Step 5: Voice Design (with TTS fallback)
    let voiceId: string;
    let audioBase64: string;

    try {
      const voiceResult = await designVoice(
        personality.voiceDescription,
        personality.monologue
      );
      audioBase64 = voiceResult.audioBase64;

      // Save voice for conversation mode (best-effort)
      try {
        voiceId = await saveVoice(voiceResult.voiceId, `Whisper-${personality.name}`);
      } catch {
        voiceId = voiceResult.voiceId;
      }
    } catch (err) {
      console.error("Voice Design failed, falling back to TTS:", err);
      // Fallback: use a pre-existing voice with standard TTS
      voiceId = FALLBACK_VOICE_ID;
      try {
        audioBase64 = await textToSpeech(FALLBACK_VOICE_ID, personality.monologue);
      } catch (ttsErr) {
        console.error("TTS fallback also failed:", ttsErr);
        return NextResponse.json(
          { error: "Voice generation failed. Please try again." },
          { status: 500 }
        );
      }
    }

    const response: WhisperResponse = {
      id: uuidv4(),
      objectName: personality.name,
      personality,
      monologue: personality.monologue,
      voiceId,
      audioBase64,
      facts,
      isEnvironmental: vision.isEnvironmental,
      entityName,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("Whisper pipeline error:", err);
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
