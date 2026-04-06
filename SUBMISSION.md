# Whisper — Submission Materials

---

## Hackathon Submission Description

### Whisper — Everything Has A Voice. Now You Can Hear It.

Point your camera at anything. A coffee mug. A park bench. A plastic bottle. It speaks to you — not with a generic robot voice, but with a unique AI-designed voice matched to its material, personality, and story. Every object becomes a character with real things to say, backed by live web intelligence.

**What it does:**

Whisper is a camera-first web app that gives voice to the world around you. When you scan an object, a 4-stage pipeline fires in under 5 seconds:

1. **Vision** — Gemini 2.0 Flash identifies the object (type, material, condition, context)
2. **Personality Engine** — An LLM generates a unique character: name, traits, voice description, and an opening monologue
3. **Web Intelligence** — Firecrawl pulls real-time facts (environmental data, history, statistics) so the object speaks truth, not fiction
4. **Voice Creation** — ElevenLabs Voice Design creates a one-of-a-kind voice from the personality description and speaks the monologue in a single API call

But the magic doesn't stop at the monologue. You can **have a full voice conversation** with the object. Ask it questions. Challenge it. Listen to its stories. Every conversation is powered by an ElevenLabs Conversational Agent with the object's designed voice and personality, enriched with real-world facts.

**Environmental Conscience Mode:**

Scan a plastic bottle and you don't hear the bottle — you hear **The Pacific Ocean**, weary and ancient, telling you what your plastic is doing to marine life. Scan a fast-fashion t-shirt and **A Cotton Field in Uzbekistan** speaks. Scan a steak and **The Amazon Rainforest** addresses you. Every environmental object triggers an affected entity with its own voice, pulling live statistics from the web. No guilt trips — just a voice you've never heard before, telling you what it's living through.

**Whisper Duets:**

Two people looking at the same object? It notices. Using ElevenLabs Text-to-Dialogue, the object delivers a multi-line performance addressing both viewers, playing them off each other.

**Whisper Clips:**

Every interaction can become a shareable 15-30 second audio clip with AI-generated sound effects and background music — layered and mixed client-side with Web Audio API.

**Built with 8 ElevenLabs APIs:**

| API | Use |
|-----|-----|
| **Voice Design** (text-to-voice) | Creates a unique voice per object from personality description |
| **Text-to-Speech** | Fallback TTS and follow-up speech |
| **Conversational AI Agents** | Full-duplex voice conversations via WebSocket |
| **Speech-to-Text** | Transcribes user speech during conversations |
| **Text-to-Dialogue** | Multi-character Whisper Duets |
| **Sound Effects** | Ambient audio for shareable clips |
| **Music Compose** | Background music for clips |
| **Voice Cloning / Save** | Persists designed voices for reuse in conversations |

**Tech Stack:** Next.js (App Router) + TypeScript + Tailwind CSS + Zustand + Gemini 2.0 Flash + ElevenLabs + Firecrawl + Google Cloud Run

**Live:** https://whisper-590954766263.us-central1.run.app

---

## LinkedIn Post

What if everything around you could speak?

I just built Whisper for ElevenHacks 2 — a web app where you point your camera at any object and it talks to you with a unique AI-designed voice.

Not a generic text-to-speech. Every single object gets its own voice, matched to what it's made of, how old it is, and where it's been. A vintage guitar sounds different from a plastic water bottle. A park bench in winter sounds different from one in summer.

But here's the part that hit me hardest while building this:

When you scan a plastic bottle, you don't hear the bottle. You hear The Pacific Ocean — ancient, tired, telling you what your plastic means with real statistics pulled from the web in real-time. Scan a fast-fashion t-shirt and a Cotton Field in Uzbekistan speaks. Scan a steak and The Amazon Rainforest addresses you.

No guilt trips. Just a voice you've never heard before, telling you what it's living through.

The tech behind it:
- Gemini 2.0 Flash for vision + personality generation
- 8 ElevenLabs APIs including Voice Design, Conversational AI Agents, Text-to-Dialogue, Sound Effects, and Music
- Firecrawl for real-time web intelligence
- Full voice conversations — you can actually talk back and forth with objects
- Everything runs in under 5 seconds from camera capture to speech

Built solo in 6 days. Deployed on Google Cloud Run.

Try it: https://whisper-590954766263.us-central1.run.app

Everything has a voice. Now you can hear it.

#ElevenHacks #ElevenLabs #AI #VoiceAI #Hackathon #NextJS #GeminiAI #BuildInPublic

---

## X (Twitter) Post

I built an app where you point your camera at anything and it speaks to you with a unique AI voice.

Scan a coffee mug — it's sarcastic and warm.
Scan a plastic bottle — you hear The Pacific Ocean, tired and ancient, citing real pollution stats.
Scan a steak — The Amazon Rainforest speaks.

8 ElevenLabs APIs. Gemini vision. Real-time web facts via Firecrawl. Full voice conversations — you can talk back.

Every object. A unique voice. A real story.

Built for @ElevenLabs ElevenHacks 2.

https://whisper-590954766263.us-central1.run.app

#ElevenHacks #VoiceAI

---

## Instagram Post

**Caption:**

Point your camera at anything. It speaks.

Built Whisper for ElevenHacks 2 — an app that gives every object a unique AI-designed voice matched to its material, personality, and context. And it knows real facts.

The twist: scan something harmful to the environment and the affected entity speaks instead. Plastic bottle? You hear The Pacific Ocean. Fast-fashion shirt? A Cotton Field in Uzbekistan. Steak? The Amazon Rainforest.

No guilt. Just a voice you've never heard, telling its story.

8 ElevenLabs APIs / Gemini Vision / Firecrawl / Full voice conversations / Built solo in 6 days

Link in bio.

#ElevenHacks #ElevenLabs #AI #VoiceAI #Hackathon #BuildInPublic #NextJS #WebDev #CreativeAI #EnvironmentalAwareness #TechForGood
