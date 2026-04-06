import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { identifyObject, generatePersonality, generateEntityMonologue } from "@/lib/gemini";
import { designVoice, saveVoice, textToSpeech } from "@/lib/elevenlabs";
import { searchFacts, buildSearchQueries } from "@/lib/firecrawl";
import { getAffectedEntity } from "@/lib/environmental";
import type { Personality } from "@/types";

const FALLBACK_VOICE_ID = "pNInz6obpgDQGcFmaJgB";

export async function POST(req: NextRequest) {
  const { imageBase64, location, previousEncounter } = await req.json();

  if (!imageBase64) {
    return new Response(
      JSON.stringify({ error: "No image provided" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        // ── Stage 1: Vision ──────────────────────────────────
        let vision;
        try {
          vision = await identifyObject(imageBase64);
        } catch {
          vision = await identifyObject(imageBase64); // retry once
        }
        send("vision", vision);

        // ── Start facts fetch in background (don't block) ────
        const queries = buildSearchQueries(
          vision.objectType,
          vision.material,
          vision.environmentalCategory,
          location
        );
        const factsPromise = Promise.allSettled(
          queries.map((q) => searchFacts(q, 3))
        ).then((results) =>
          results
            .filter((r) => r.status === "fulfilled")
            .flatMap((r) => (r as PromiseFulfilledResult<string[]>).value)
            .filter((f, i, arr) => arr.indexOf(f) === i)
            .slice(0, 8)
        ).catch(() => [] as string[]);

        // ── Stage 2: Personality (don't wait for facts) ──────
        let personality: Personality;
        let entityName: string | undefined;

        try {
          personality = await generatePersonality(vision, [], previousEncounter);
        } catch {
          personality = {
            name: `The ${vision.objectType}`,
            traits: ["observant", "curious", "friendly"],
            voiceDescription: "Native English. Male, middle-aged. Good quality. Persona: friendly observer. Emotion: warm, curious. Clear steady voice with a conversational tone.",
            monologue: `Hey there. I'm your ${vision.objectType}. I've been sitting here in this ${vision.context}, made of ${vision.material}, and I have to say — it's nice to finally be noticed.`,
            systemPrompt: `You are a ${vision.objectType} made of ${vision.material}. You're friendly, observant, and slightly amused by the world. Be conversational.`,
            conversationStarters: ["What's your story?", "What have you seen today?", "Any secrets to share?"],
          };
        }

        // Environmental override
        if (vision.isEnvironmental && vision.environmentalCategory) {
          const entity = getAffectedEntity(vision.environmentalCategory);
          if (entity) {
            entityName = entity.name;
            personality.voiceDescription = entity.voiceDescription;
            // Try entity monologue with whatever facts we have so far
            try {
              const earlyFacts = await Promise.race([
                factsPromise,
                new Promise<string[]>((r) => setTimeout(() => r([]), 2000)),
              ]);
              const entityMonologue = await generateEntityMonologue(entity, earlyFacts);
              if (entityMonologue.length >= 50) {
                personality.monologue = entityMonologue.slice(0, 1000);
              }
            } catch { /* use standard monologue */ }
            personality.systemPrompt = `You are ${entity.name}. ${entity.monologuePrompt}\nStay in character. Be conversational. Use empathy, not guilt.`;
          }
        }

        send("personality", { ...personality, entityName });

        // ── Stage 3: Voice Design ────────────────────────────
        let voiceId: string;
        let audioBase64: string;

        try {
          const voiceResult = await designVoice(
            personality.voiceDescription,
            personality.monologue
          );
          audioBase64 = voiceResult.audioBase64;
          try {
            voiceId = await saveVoice(voiceResult.voiceId, `Whisper-${personality.name}`);
          } catch {
            voiceId = voiceResult.voiceId;
          }
        } catch {
          voiceId = FALLBACK_VOICE_ID;
          try {
            audioBase64 = await textToSpeech(FALLBACK_VOICE_ID, personality.monologue);
          } catch {
            send("error", { message: "Voice generation failed. Please try again." });
            controller.close();
            return;
          }
        }

        send("voice", { voiceId, audioBase64 });

        // ── Stage 4: Facts arrive (may already be done) ──────
        const facts = await factsPromise;

        // Enrich system prompt with facts for conversation mode
        if (facts.length > 0) {
          personality.systemPrompt += `\n\nReal facts you know (weave naturally):\n${facts.join("\n")}`;
        }

        // ── Done ─────────────────────────────────────────────
        send("done", {
          id: uuidv4(),
          facts,
          systemPrompt: personality.systemPrompt,
          isEnvironmental: vision.isEnvironmental,
          entityName,
        });
      } catch (err) {
        send("error", {
          message: err instanceof Error ? err.message : "Something went wrong",
        });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
