import { GoogleGenerativeAI } from "@google/generative-ai";
import type { VisionResult, Personality, ObjectMemory } from "@/types";
import { VISION_PROMPT, ASSIST_VISION_PROMPT, SKY_VISION_PROMPT, personalityPrompt, assistPersonalityPrompt, skyPersonalityPrompt, entityMonologuePrompt } from "./prompts";
import { findConstellation } from "./constellations";
import type { EnvironmentalEntity } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const visionModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const textModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function identifyObject(imageBase64: string, assistMode = false, skyMode = false): Promise<VisionResult> {
  const prompt = skyMode ? SKY_VISION_PROMPT : assistMode ? ASSIST_VISION_PROMPT : VISION_PROMPT;
  const result = await visionModel.generateContent([
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64,
      },
    },
    { text: prompt },
  ]);

  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse vision result");
  }

  return JSON.parse(jsonMatch[0]) as VisionResult;
}

export async function generatePersonality(
  vision: VisionResult,
  facts: string[],
  previousEncounter?: ObjectMemory | null,
  assistMode = false,
  skyMode = false,
  artemisData?: string
): Promise<Personality> {
  let prompt: string;
  if (skyMode) {
    // Detect constellation from vision result
    const constellations = (vision as unknown as Record<string, unknown>).skyFeatures
      ? ((vision as unknown as Record<string, unknown>).skyFeatures as { constellations?: string[] })?.constellations || []
      : [];
    let constellationProfile = null;
    for (const name of constellations) {
      constellationProfile = findConstellation(name);
      if (constellationProfile) break;
    }
    prompt = skyPersonalityPrompt(vision, facts, artemisData || "", constellationProfile);
  } else if (assistMode) {
    prompt = assistPersonalityPrompt(vision, facts);
  } else {
    prompt = personalityPrompt(vision, facts, previousEncounter);
  }

  const result = await textModel.generateContent(prompt);
  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse personality result");
  }

  return JSON.parse(jsonMatch[0]) as Personality;
}

export async function generateEntityMonologue(
  entity: EnvironmentalEntity,
  facts: string[]
): Promise<string> {
  const prompt = entityMonologuePrompt(entity, facts);
  const result = await textModel.generateContent(prompt);
  return result.response.text().replace(/^["']|["']$/g, "").trim();
}
