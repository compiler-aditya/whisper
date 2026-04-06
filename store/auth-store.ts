"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, ConversationHistory } from "@/types";

interface AuthStore {
  user: User | null;
  conversations: ConversationHistory[];

  signUp: (name: string, email: string) => User;
  signIn: (email: string) => User | null;
  signOut: () => void;

  addConversation: (conversation: ConversationHistory) => void;
  getConversationsForWhisper: (whisperId: string) => ConversationHistory[];
}

const AVATAR_COLORS = [
  "#7C3AED", "#2563EB", "#059669", "#D97706",
  "#DC2626", "#DB2777", "#4F46E5", "#0891B2",
];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      conversations: [],

      signUp: (name, email) => {
        const user: User = {
          id: generateId(),
          name,
          email: email.toLowerCase().trim(),
          avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
          createdAt: Date.now(),
        };
        set({ user });
        return user;
      },

      signIn: (email) => {
        // For the hackathon demo, signing in just creates/restores a session
        // In production this would validate against a backend
        const state = get();
        if (state.user && state.user.email === email.toLowerCase().trim()) {
          return state.user;
        }
        // If email matches stored user, restore session
        return null;
      },

      signOut: () => {
        set({ user: null });
      },

      addConversation: (conversation) =>
        set((state) => ({
          conversations: [conversation, ...state.conversations].slice(0, 500),
        })),

      getConversationsForWhisper: (whisperId) => {
        return get().conversations.filter((c) => c.whisperId === whisperId);
      },
    }),
    {
      name: "whisper-auth",
      partialize: (state) => ({
        user: state.user,
        conversations: state.conversations,
      }),
    }
  )
);
