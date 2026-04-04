import { NextRequest, NextResponse } from "next/server";
import { createAgent, getSignedUrl, deleteAgent } from "@/lib/elevenlabs";
import type { ConversationRequest, ConversationResponse } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: ConversationRequest = await req.json();
    const { voiceId, systemPrompt, facts, objectName } = body;

    if (!voiceId || !systemPrompt) {
      return NextResponse.json(
        { error: "voiceId and systemPrompt are required" },
        { status: 400 }
      );
    }

    // Enrich system prompt with facts
    const fullPrompt = facts.length > 0
      ? `${systemPrompt}\n\nReal facts you know (weave these naturally into conversation):\n${facts.join("\n")}`
      : systemPrompt;

    // Create ephemeral agent
    const agentId = await createAgent(voiceId, fullPrompt, objectName);

    // Get signed WebSocket URL
    const signedUrl = await getSignedUrl(agentId);

    const response: ConversationResponse = { agentId, signedUrl };
    return NextResponse.json(response);
  } catch (err) {
    console.error("Conversation creation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create conversation" },
      { status: 500 }
    );
  }
}

// DELETE — cleanup agent after conversation ends
export async function DELETE(req: NextRequest) {
  try {
    const { agentId } = await req.json();
    if (agentId) {
      await deleteAgent(agentId);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // best-effort
  }
}
