const API_BASE = "https://api.elevenlabs.io/v1";
const API_KEY = process.env.ELEVENLABS_API_KEY!;

function headers(contentType = "application/json") {
  return {
    "xi-api-key": API_KEY,
    "Content-Type": contentType,
  };
}

export interface VoiceDesignResult {
  voiceId: string;
  audioBase64: string;
  durationSecs: number;
}

/**
 * Voice Design: create a unique voice AND get the first speech in one call.
 * The `text` param is spoken as a preview — we pass the monologue here.
 */
export async function designVoice(
  voiceDescription: string,
  monologue: string
): Promise<VoiceDesignResult> {
  // Clamp description to 20-1000 chars
  const desc = voiceDescription.slice(0, 1000).padEnd(20, ".");
  // Clamp text to 100-1000 chars
  const text = monologue.slice(0, 1000).padEnd(100, ".");

  const res = await fetch(`${API_BASE}/text-to-voice/create-previews`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      voice_description: desc,
      text,
      auto_generate_text: false,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Voice Design failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  const preview = data.previews?.[0];

  if (!preview) {
    throw new Error("No voice preview returned");
  }

  return {
    voiceId: preview.generated_voice_id,
    audioBase64: preview.audio_base_64,
    durationSecs: preview.duration_secs ?? 0,
  };
}

/**
 * Save a generated voice preview so it can be reused for conversation.
 */
export async function saveVoice(
  generatedVoiceId: string,
  name: string
): Promise<string> {
  const res = await fetch(`${API_BASE}/text-to-voice/create-voice-from-preview`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      voice_name: name.slice(0, 40),
      voice_description: name,
      generated_voice_id: generatedVoiceId,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Save voice failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.voice_id;
}

/**
 * Text-to-Speech using a voice ID. Returns audio as base64.
 */
export async function textToSpeech(
  voiceId: string,
  text: string
): Promise<string> {
  const res = await fetch(
    `${API_BASE}/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`TTS failed (${res.status}): ${err}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return base64;
}

/**
 * Create a conversational agent with the object's personality.
 * Returns agent_id used to get a signed conversation URL.
 */
export async function createAgent(
  voiceId: string,
  systemPrompt: string,
  objectName: string
): Promise<string> {
  const res = await fetch(`${API_BASE}/convai/agents/create`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      name: `whisper-${objectName.replace(/\s+/g, "-").slice(0, 20)}-${Date.now()}`,
      conversation_config: {
        agent: {
          prompt: {
            prompt: systemPrompt,
          },
          first_message: "",
          language: "en",
        },
        tts: {
          voice_id: voiceId,
        },
        conversation: {
          client_events: [
            "audio",
            "agent_response",
            "user_transcript",
            "interruption",
          ],
        },
        turn: {
          turn_timeout: 15,
          mode: {
            type: "conversational",
          },
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Agent creation failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.agent_id;
}

/**
 * Delete an agent after conversation ends.
 */
export async function deleteAgent(agentId: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/convai/agents/${agentId}`, {
      method: "DELETE",
      headers: { "xi-api-key": API_KEY },
    });
  } catch {
    // Best-effort cleanup, don't throw
  }
}

/**
 * Get a signed WebSocket URL for conversation with an agent.
 */
export async function getSignedUrl(agentId: string): Promise<string> {
  const res = await fetch(
    `${API_BASE}/convai/conversation/get-signed-url?agent_id=${agentId}`,
    {
      method: "GET",
      headers: { "xi-api-key": API_KEY },
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Signed URL failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.signed_url;
}

/**
 * Generate a sound effect from a text description.
 */
export async function generateSoundEffect(
  description: string,
  durationSeconds = 3
): Promise<string> {
  const res = await fetch(`${API_BASE}/sound-generation`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      text: description,
      duration_seconds: Math.min(Math.max(durationSeconds, 0.5), 22),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SFX generation failed (${res.status}): ${err}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}

/**
 * Compose background music.
 */
export async function composeMusic(
  prompt: string,
  durationMs = 20000
): Promise<string> {
  const res = await fetch(`${API_BASE}/music/compose`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      prompt,
      music_length_ms: Math.min(Math.max(durationMs, 3000), 300000),
      model_id: "music_v1",
      force_instrumental: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Music composition failed (${res.status}): ${err}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}

/**
 * Text-to-Dialogue for duet mode.
 */
export async function textToDialogue(
  inputs: { text: string; voice_id: string }[]
): Promise<string> {
  const res = await fetch(`${API_BASE}/text-to-dialogue/convert`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      inputs,
      model_id: "eleven_v3",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Dialogue generation failed (${res.status}): ${err}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}
