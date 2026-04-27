// ============================================
// EduNex AI Tutor - Chat Store (Zustand)
// ============================================

import { create } from "zustand";
import { ChatMessage, ChatSession, Interest } from "@/types";
import { generateId } from "@/lib/utils";
import { streamChatMessage } from "@/lib/api/chat";

interface ChatState {
  /** All chat sessions */
  sessions: ChatSession[];
  /** Currently active session ID */
  activeSessionId: string | null;
  /** Whether the AI is currently generating a response */
  isGenerating: boolean;
  /** Error message if something goes wrong */
  error: string | null;

  // Actions
  createSession: () => string;
  setActiveSession: (id: string) => void;
  deleteSession: (id: string) => void;
  sendMessage: (content: string, interests: Interest[]) => Promise<void>;
  clearError: () => void;
  getActiveSession: () => ChatSession | undefined;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  isGenerating: false,
  error: null,

  createSession: () => {
    const newSession: ChatSession = {
      id: generateId(),
      title: "New Conversation",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      sessions: [newSession, ...state.sessions],
      activeSessionId: newSession.id,
    }));
    return newSession.id;
  },

  setActiveSession: (id) => {
    set({ activeSessionId: id });
  },

  deleteSession: (id) => {
    set((state) => {
      const filtered = state.sessions.filter((s) => s.id !== id);
      return {
        sessions: filtered,
        activeSessionId:
          state.activeSessionId === id
            ? filtered[0]?.id ?? null
            : state.activeSessionId,
      };
    });
  },

  sendMessage: async (content, interests) => {
    const state = get();
    let sessionId = state.activeSessionId;

    // Create a session if none exists
    if (!sessionId) {
      sessionId = get().createSession();
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    // Add placeholder assistant message for streaming
    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    set((state) => ({
      isGenerating: true,
      error: null,
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              messages: [...s.messages, userMessage, assistantMessage],
              // Update title from first user message
              title:
                s.messages.length === 0
                  ? content.slice(0, 50) + (content.length > 50 ? "..." : "")
                  : s.title,
              updatedAt: new Date(),
            }
          : s
      ),
    }));

    try {
      // Stream the response
      const stream = streamChatMessage({
        message: content,
        sessionId: sessionId!,
        interests,
      });

      let fullContent = "";

      for await (const { chunk, done, detectedInterest } of stream) {
        fullContent += chunk;

        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantMessage.id
                      ? {
                          ...m,
                          content: fullContent,
                          isStreaming: !done,
                          detectedInterest: detectedInterest || m.detectedInterest,
                        }
                      : m
                  ),
                }
              : s
          ),
        }));
      }

      set({ isGenerating: false });
    } catch {
      set({
        isGenerating: false,
        error: "Failed to get response. Please try again.",
      });

      // Remove the empty assistant message on error
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                messages: s.messages.filter(
                  (m) => m.id !== assistantMessage.id
                ),
              }
            : s
        ),
      }));
    }
  },

  clearError: () => set({ error: null }),

  getActiveSession: () => {
    const state = get();
    return state.sessions.find((s) => s.id === state.activeSessionId);
  },
}));
