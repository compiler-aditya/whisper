import { NextRequest, NextResponse } from "next/server";
import { generateSoundEffect, composeMusic } from "@/lib/elevenlabs";

export async function POST(req: NextRequest) {
  try {
    const { objectName, entityName, monologue } = await req.json();

    const name = entityName || objectName;

    // Generate SFX and music in parallel — both are optional
    const [sfxResult, musicResult] = await Promise.allSettled([
      generateSoundEffect(
        `ambient atmospheric sound for ${name}, subtle cinematic`,
        5
      ),
      composeMusic(
        `gentle ambient lo-fi underscore, emotional, cinematic, for a ${name} speaking its truth`,
        20000
      ),
    ]);

    const sfxBase64 =
      sfxResult.status === "fulfilled" ? sfxResult.value : null;
    const musicBase64 =
      musicResult.status === "fulfilled" ? musicResult.value : null;

    return NextResponse.json({
      sfxBase64,
      musicBase64,
    });
  } catch (err) {
    console.error("Clip generation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Clip generation failed" },
      { status: 500 }
    );
  }
}
