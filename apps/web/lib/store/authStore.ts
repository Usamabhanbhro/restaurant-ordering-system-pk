import { create } from "zustand";

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  affiliation?: string | undefined;
  badge?: string | undefined;
  isVerified: boolean;
  dietaryNotes?: string | undefined;
  profilePicture?: string | undefined;
}

export type AuthModalMode =
  | "NONE"
  | "WELCOME"
  | "LOGIN"
  | "REGISTER"
  | "VERIFY_EMAIL"
  | "ONBOARDING"
  | "FORGOT_PASSWORD"
  | "RESET_PASSWORD";

export type PendingPostAuthAction = "CHECKOUT" | null;

interface AuthState {
  currentUser: UserProfile | null;
  authModal: AuthModalMode;
  pendingPostAuthAction: PendingPostAuthAction;
  setCurrentUser: (user: UserProfile | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setAuthModal: (mode: AuthModalMode) => void;
  setPendingPostAuthAction: (action: PendingPostAuthAction) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: {
    name: "Ahmad Ali",
    email: "ahmad.ali@nu.edu.pk",
    phone: "+92 300 1234567",
    affiliation: "FAST-NUCES",
    badge: "Student",
    isVerified: true,
  },
  authModal: "NONE",
  pendingPostAuthAction: null,

  setCurrentUser: (user) => {
    if (!user) {
      set({ currentUser: null });
      return;
    }
    const hasAffiliation =
      Boolean(user.affiliation) &&
      user.affiliation !== "None" &&
      (user.affiliation?.trim().length ?? 0) > 0;
    set({
      currentUser: {
        ...user,
        affiliation: hasAffiliation ? user.affiliation : undefined,
        badge: hasAffiliation ? "Student" : "Diner",
      },
    });
  },
  updateProfile: (updates) =>
    set((state) => {
      if (!state.currentUser) return { currentUser: null };
      const merged = { ...state.currentUser, ...updates };
      const hasAffiliation =
        Boolean(merged.affiliation) &&
        merged.affiliation !== "None" &&
        (merged.affiliation?.trim().length ?? 0) > 0;
      return {
        currentUser: {
          ...merged,
          affiliation: hasAffiliation ? merged.affiliation : undefined,
          badge: hasAffiliation ? "Student" : "Diner",
        },
      };
    }),
  setAuthModal: (mode) => set({ authModal: mode }),
  setPendingPostAuthAction: (action) => set({ pendingPostAuthAction: action }),
  signOut: () => set({ currentUser: null }),
}));
