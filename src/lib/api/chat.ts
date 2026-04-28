// ============================================
// EduNex AI Tutor - Chat API (Real Backend)
// ============================================
// Connects to the FastAPI backend for AI-powered responses
// via Server-Sent Events (SSE) streaming.

import { ChatCompletionResponse, ChatRequest, Interest } from "@/types";

/** Backend API base URL */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Send a chat message and receive a complete (non-streaming) AI response.
 * Calls the real backend POST /chat endpoint.
 */
export async function sendChatMessage(
  request: ChatRequest
): Promise<ChatCompletionResponse> {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: request.userId || "default-user",
      session_id: request.sessionId,
      message: request.message,
      interest: request.interests?.[0] || null,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Chat API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  return {
    message: data.message?.content || data.content || "No response received.",
    detectedInterest: data.message?.detected_interest || undefined,
    suggestedTopics: data.suggested_topics || [
      "Explain further with examples",
      "Give me a practice problem",
      "How does this connect to real life?",
    ],
  };
}

/**
 * Stream a chat message response from the backend via SSE.
 * Connects to POST /chat/stream and yields token chunks.
 */
export async function* streamChatMessage(
  request: ChatRequest
): AsyncGenerator<{ chunk: string; done: boolean; detectedInterest?: Interest }> {
  const response = await fetch(`${API_BASE}/api/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: request.userId || "default-user",
      session_id: request.sessionId,
      message: request.message,
      interest: request.interests?.[0] || null,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Stream API error (${response.status}): ${errorText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body available for streaming");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done: readerDone, value } = await reader.read();

      if (readerDone) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE events from the buffer
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      for (const line of lines) {
        const trimmed = line.trim();

        // SSE data lines start with "data: "
        if (!trimmed.startsWith("data: ")) continue;

        const jsonStr = trimmed.slice(6); // Remove "data: " prefix

        try {
          const event = JSON.parse(jsonStr);

          if (event.type === "token" && event.content) {
            yield {
              chunk: event.content,
              done: false,
              detectedInterest: undefined,
            };
          } else if (event.type === "done") {
            yield {
              chunk: "",
              done: true,
              detectedInterest: event.detected_interest as Interest | undefined,
            };
          } else if (event.type === "error") {
            throw new Error(event.message || "Stream error from server");
          }
          // "meta" events are session metadata — we can ignore them
        } catch (parseError) {
          // Skip malformed JSON lines (e.g., partial data)
          if (parseError instanceof SyntaxError) continue;
          throw parseError;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
