// ============================================
// EduNex AI Tutor - User Store (Zustand)
// ============================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Interest, LearningStyle, UserProfile } from "@/types";

interface UserState {
  /** User profile data */
  profile: UserProfile | null;
  /** Selected interests */
  interests: Interest[];
  /** Whether the user has completed onboarding */
  hasOnboarded: boolean;
  /** Whether the user is authenticated (mock) */
  isAuthenticated: boolean;

  // Actions
  setProfile: (profile: UserProfile) => void;
  setInterests: (interests: Interest[]) => void;
  addInterest: (interest: Interest) => void;
  removeInterest: (interest: Interest) => void;
  toggleInterest: (interest: Interest) => void;
  completeOnboarding: () => void;
  setLearningStyle: (style: LearningStyle) => void;
  login: (name: string, email: string) => void;
  logout: () => void;
  updateName: (name: string) => void;
  updateEmail: (email: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      interests: [],
      hasOnboarded: false,
      isAuthenticated: false,

      setProfile: (profile) => set({ profile }),

      setInterests: (interests) =>
        set((state) => ({
          interests,
          profile: state.profile
            ? { ...state.profile, interests }
            : null,
        })),

      addInterest: (interest) =>
        set((state) => {
          if (state.interests.includes(interest)) return state;
          const newInterests = [...state.interests, interest];
          return {
            interests: newInterests,
            profile: state.profile
              ? { ...state.profile, interests: newInterests }
              : null,
          };
        }),

      removeInterest: (interest) =>
        set((state) => {
          const newInterests = state.interests.filter((i) => i !== interest);
          return {
            interests: newInterests,
            profile: state.profile
              ? { ...state.profile, interests: newInterests }
              : null,
          };
        }),

      toggleInterest: (interest) => {
        const state = get();
        if (state.interests.includes(interest)) {
          get().removeInterest(interest);
        } else {
          get().addInterest(interest);
        }
      },

      completeOnboarding: () => set({ hasOnboarded: true }),

      setLearningStyle: (style) =>
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, learningStyle: style }
            : null,
        })),

      login: (name, email) => {
        const profile: UserProfile = {
          id: `user-${Date.now()}`,
          name,
          email,
          interests: get().interests,
          learningStyle: "visual",
          joinedAt: new Date(),
        };
        set({ profile, isAuthenticated: true });
      },

      logout: () =>
        set({
          profile: null,
          isAuthenticated: false,
          hasOnboarded: false,
          interests: [],
        }),

      updateName: (name) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, name } : null,
        })),

      updateEmail: (email) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, email } : null,
        })),
    }),
    {
      name: "edunex-user-store",
      // Only persist certain fields
      partialize: (state) => ({
        interests: state.interests,
        hasOnboarded: state.hasOnboarded,
        isAuthenticated: state.isAuthenticated,
        profile: state.profile,
      }),
    }
  )
);
