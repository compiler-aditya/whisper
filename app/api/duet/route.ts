import { NextRequest, NextResponse } from "next/server";
import { textToDialogue } from "@/lib/elevenlabs";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { voiceId, objectName, personality, facts } = await req.json();

    if (!voiceId || !objectName) {
      return NextResponse.json(
        { error: "voiceId and objectName are required" },
        { status: 400 }
      );
    }

    // Generate duet dialogue lines using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent(
      `You are "${objectName}" with these traits: ${personality?.traits?.join(", ") || "witty, observant"}.

Generate a short dialogue (3-4 lines) where you address TWO people who are both looking at you right now. Play them off each other — notice differences between them, make observations, be funny and warm. Each line should be 20-80 characters.

Known facts: ${facts?.slice(0, 3).join("; ") || "none"}

Return ONLY a JSON array of strings, each being one dialogue line. Example:
["Ah, both of you. Interesting.", "You — yes, you on the left — you seem nervous.", "And you're trying not to laugh. I like that.", "Now, let me tell you something about myself."]

Return ONLY the JSON array, nothing else.`
    );

    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to parse dialogue");
    }

    const lines: string[] = JSON.parse(jsonMatch[0]);

    // Build dialogue inputs — all same voice (the object speaking)
    const inputs = lines.slice(0, 6).map((line) => ({
      text: line,
      voice_id: voiceId,
    }));

    // Generate dialogue audio
    const audioBase64 = await textToDialogue(inputs);

    return NextResponse.json({
      audioBase64,
      lines,
    });
  } catch (err) {
    console.error("Duet generation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Duet generation failed" },
      { status: 500 }
    );
  }
}
