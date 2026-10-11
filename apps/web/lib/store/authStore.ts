import { create } from "zustand";

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  affiliation?: string | undefined;
  badge?: string | undefined;
  isVerified: boolean;
  savedPaymentRails?: string[] | undefined;
  dietaryNotes?: string | undefined;
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
    badge: "Verified Student",
    isVerified: true,
    savedPaymentRails: ["Easypaisa", "SadaPay"],
    dietaryNotes: "Halal only • Mild spice",
  },
  authModal: "NONE",
  pendingPostAuthAction: null,

  setCurrentUser: (user) => set({ currentUser: user }),
  setAuthModal: (mode) => set({ authModal: mode }),
  setPendingPostAuthAction: (action) => set({ pendingPostAuthAction: action }),
  signOut: () => set({ currentUser: null }),
}));
