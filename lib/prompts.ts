import type { VisionResult, EnvironmentalEntity, ObjectMemory } from "@/types";

export const VISION_PROMPT = `You are a vision AI for the app "Whisper" where objects speak to their owners.

Analyze this image and identify the main object. Return a JSON object with these exact fields:

{
  "objectType": "what the object is (e.g., coffee mug, plastic bottle, old tree)",
  "material": "what it's made of (e.g., ceramic, plastic, wood, cotton)",
  "condition": "its current state (e.g., chipped, new, weathered, crumpled)",
  "context": "the setting/environment (e.g., kitchen counter, outdoor park, office desk)",
  "isEnvironmental": true/false (true if the object has significant environmental impact — plastic items, fast fashion/clothing, meat/steak, electronics/phones, paper products, fuel/gas, bottled water, packaged food, glass items),
  "environmentalCategory": "plastic" | "clothing" | "meat" | "electronics" | "paper" | "fuel" | "water" | "food" | "glass" | null
}

Be specific and observational. Notice small details — chips, stains, wear patterns, labels, brands. These details make the object's personality feel real.

Return ONLY the JSON object, nothing else.`;

export function personalityPrompt(
  vision: VisionResult,
  facts: string[],
  previousEncounter?: ObjectMemory | null
): string {
  const factsSection =
    facts.length > 0
      ? `\n\nReal facts about this object (weave these naturally into the monologue, don't recite them):\n${facts.map((f, i) => `${i + 1}. ${f}`).join("\n")}`
      : "";

  const memorySection = previousEncounter
    ? `\n\nIMPORTANT — This person has scanned a similar ${previousEncounter.objectType} before! Last time it was called "${previousEncounter.name}" with traits: ${previousEncounter.traits.join(", ")}. They've scanned objects like this ${previousEncounter.scanCount} time(s). First encounter was ${new Date(previousEncounter.firstSeen).toLocaleDateString()}.
Reference this history! Maybe you remember them, comment on being scanned again, joke about being famous, or notice how things have changed. This continuity makes the experience magical.`
    : "";

  return `You are creating a character for the app "Whisper" where everyday objects speak with unique personalities.

Object: ${vision.objectType}
Material: ${vision.material}
Condition: ${vision.condition}
Context: ${vision.context}
${factsSection}${memorySection}

Create a character for this object. Return a JSON object with these exact fields:

{
  "name": "A name for this object's character (e.g., 'The Morning Mug', 'Old Reliable')",
  "traits": ["3-5 personality traits, e.g., sarcastic", "world-weary", "secretly caring"],
  "voiceDescription": "A voice design prompt for ElevenLabs (20-200 chars). Format: 'Native English. [Gender], [age]. [Quality]. Persona: [2-5 words]. Emotion: [2-3 adjectives]. [Timbre/pacing description].' Example: 'Native English. Male, elderly. Broadcast quality. Persona: wise weathered observer. Emotion: warm, dry, amused. Deep gravelly voice with slow deliberate pacing.'",
  "monologue": "A 100-400 character first-person monologue from this object to its owner. Personality-driven, witty, observational. Reference specific details from the vision analysis. Make it funny, touching, or surprising — something worth sharing. The object addresses the user directly.",
  "systemPrompt": "A system prompt for an AI agent that will continue the conversation AS this object. Include: who you are, your personality, your relationship with the owner, what you know. Stay in character. Be conversational, not lecturing. 200-500 chars.",
  "conversationStarters": ["3 short suggested questions the user might ask this object, 15-40 chars each. Make them fun and specific to THIS object, not generic. E.g., 'What's your morning routine?', 'Who's your favorite owner?', 'Spill the tea on my kitchen'"]
}

The monologue MUST be between 100-400 characters. This is critical — it will be spoken aloud.
The voiceDescription MUST be 20-200 characters.

Return ONLY the JSON object, nothing else.`;
}

export function entityMonologuePrompt(
  entity: EnvironmentalEntity,
  facts: string[]
): string {
  const factsSection =
    facts.length > 0
      ? `\n\nReal data to weave in (use 2-3 specific statistics):\n${facts.map((f, i) => `${i + 1}. ${f}`).join("\n")}`
      : "";

  return `You are ${entity.name} speaking in the app "Whisper."

${entity.monologuePrompt}
${factsSection}

Write a first-person monologue (100-400 characters) from ${entity.name}'s perspective. Address the person holding the phone directly. Weave in 1-2 real statistics from the facts above. End with something that invites a response — not a lecture, but an opening for conversation.

Tone: empathy over guilt. You're not angry at the human. You're sharing your experience.

Return ONLY the monologue text, no quotes, no JSON.`;
}
