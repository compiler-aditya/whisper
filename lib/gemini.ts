import { GoogleGenerativeAI } from "@google/generative-ai";
import type { VisionResult, Personality } from "@/types";
import { VISION_PROMPT, personalityPrompt, entityMonologuePrompt } from "./prompts";
import type { EnvironmentalEntity } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const visionModel = genAI.getGenerativeModel({ model: "gemini-3.0-flash" });
const textModel = genAI.getGenerativeModel({ model: "gemini-3.0-flash" });

export async function identifyObject(imageBase64: string): Promise<VisionResult> {
  const result = await visionModel.generateContent([
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64,
      },
    },
    { text: VISION_PROMPT },
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
  facts: string[]
): Promise<Personality> {
  const prompt = personalityPrompt(vision, facts);
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
