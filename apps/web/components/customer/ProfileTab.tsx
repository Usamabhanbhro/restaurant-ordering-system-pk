"use client";

import {
  User,
  GraduationCap,
  Check,
  Sparkles,
  LogOut,
  Zap,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

interface ProfileTabProps {
  onReplaySplash: () => void;
}

export function ProfileTab({ onReplaySplash }: ProfileTabProps) {
  const { currentUser, setCurrentUser, setAuthModal, setPendingPostAuthAction, signOut } =
    useAuthStore();

  return (
    <div className="p-4 space-y-4">
      {currentUser ? (
        <>
          {/* User Profile Card */}
          <div className="p-4 rounded-3xl bg-white border border-neutral-200/80 shadow-soft flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#EF5A30] text-white font-bold flex items-center justify-center text-lg shadow-sm shrink-0">
                {currentUser.name
                  ? currentUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "AA"}
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-neutral-900">{currentUser.name}</h3>
                <p className="text-xs text-neutral-500">
                  {currentUser.email} • {currentUser.phone}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  {currentUser.affiliation && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-[#EF5A30]">
                      <GraduationCap className="w-3 h-3 text-[#EF5A30]" />
                      <span>{currentUser.affiliation}</span>
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="w-2.5 h-2.5" />
                    <span>{currentUser.badge || "Verified Account"}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Preferences Card */}
          <div className="p-4 rounded-3xl bg-white border border-neutral-200/80 shadow-soft space-y-3 text-xs">
            <h4 className="font-bold text-neutral-900">Account Preferences</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-neutral-50 border border-neutral-100">
                <span className="text-neutral-500">Default Rail</span>
                <span className="font-bold text-neutral-800">Easypaisa</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-neutral-50 border border-neutral-100">
                <span className="text-neutral-500">Order Notifications</span>
                <span className="font-bold text-emerald-600">Audio Chime Enabled</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-neutral-50 border border-neutral-100">
                <span className="text-neutral-500">Pickup Counter Location</span>
                <span className="font-bold text-neutral-800">Main Hall Register #2</span>
              </div>
            </div>
          </div>

          {/* Experience Splash Screen Button */}
          <button
            type="button"
            onClick={onReplaySplash}
            className="w-full py-2.5 rounded-2xl bg-white border border-neutral-200/80 text-neutral-700 hover:text-neutral-900 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#EF5A30]" />
            <span>Experience Opening Splash</span>
          </button>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={signOut}
            className="w-full py-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <LogOut className="w-3.5 h-3.5 text-neutral-500" />
            <span>Sign Out (Switch to Guest Mode)</span>
          </button>
        </>
      ) : (
        /* Guest Diner State */
        <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-soft text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#FF6B42] to-[#EF5A30] text-white flex items-center justify-center mx-auto shadow-md shadow-orange-950/20">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-black text-lg text-neutral-900 tracking-tight">
              Welcome to QueueLess
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-[280px] mx-auto leading-relaxed">
              Sign in or create an account to schedule remote pre-orders, skip counter lines, and unlock
              student discounts.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setAuthModal("LOGIN");
                setPendingPostAuthAction(null);
              }}
              className="w-full py-3.5 rounded-2xl bg-[#EF5A30] hover:bg-[#DE4920] text-white font-extrabold text-xs shadow-soft transition-all active:scale-[0.98]"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthModal("REGISTER");
                setPendingPostAuthAction(null);
              }}
              className="w-full py-3.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs transition-all active:scale-[0.98]"
            >
              Create an Account
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentUser({
                  name: "Ahmad Ali",
                  email: "ahmad.ali@nu.edu.pk",
                  phone: "+92 300 1234567",
                  affiliation: "FAST-NUCES",
                  badge: "Verified Student",
                  isVerified: true,
                });
              }}
              className="text-[11px] text-neutral-400 hover:text-neutral-700 font-semibold pt-2 inline-flex items-center gap-1.5 transition-colors"
            >
              <Zap className="w-3 h-3 text-[#EF5A30]" />
              <span>Quick Demo Login as Ahmad Ali (FAST)</span>
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-orange-50/80 border border-orange-200/60 text-left flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#EF5A30] shrink-0" />
            <div>
              <p className="text-xs font-bold text-neutral-900">Campus Partnership Discounts</p>
              <p className="text-[11px] text-neutral-500">
                Students at FAST, LUMS, IBA, NUST get 10% off with university email.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onReplaySplash}
            className="w-full py-2.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#EF5A30]" />
            <span>Experience Opening Splash</span>
          </button>
        </div>
      )}
    </div>
  );
}
