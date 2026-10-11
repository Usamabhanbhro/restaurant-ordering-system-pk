"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  LogOut,
  Utensils,
  HelpCircle,
  MessageSquare,
  MessageCircle,
  Info,
  FileText,
  ShieldCheck,
  ChevronRight,
  RotateCcw,
  Check,
  Ticket,
  UserPlus,
  Handshake,
  Briefcase,
} from "lucide-react";
import type { OrderingMode, TableContext } from "@/lib/mockData";
import { useAuthStore } from "@/lib/store/authStore";

interface ProfileTabProps {
  onReplaySplash: () => void;
  mode?: OrderingMode;
  tableContext?: TableContext | null;
}

export function ProfileTab({
  onReplaySplash,
  mode = "REMOTE",
  tableContext,
}: ProfileTabProps) {
  const { currentUser, setCurrentUser, setAuthModal, setPendingPostAuthAction, signOut } =
    useAuthStore();

  const [stagedNotice, setStagedNotice] = useState<string | null>(null);

  const handleStagedClick = (title: string) => {
    setStagedNotice(`${title} panel is staged and will be wired in the next phase.`);
    setTimeout(() => setStagedNotice(null), 2500);
  };

  return (
    <div className="p-4 space-y-5">
      {/* 1. Account / Diner Identity Header & Profile Information */}
      {currentUser ? (
        <div className="rounded-3xl bg-white border border-neutral-200/80 p-5 shadow-soft space-y-4">
          {/* Header with Title and Edit Control */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#fd8535] flex items-center justify-center font-bold">
                <User className="w-4 h-4 text-[#fd8535]" />
              </div>
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">
                  Identity
                </h2>
                <h3 className="text-sm font-black text-neutral-900 tracking-tight">
                  Profile Information
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleStagedClick("Edit Profile")}
              className="text-xs font-extrabold text-[#fd8535] hover:text-[#e07227] px-3 py-1 rounded-full bg-orange-50 hover:bg-orange-100/70 border border-orange-200/60 transition-colors"
            >
              Edit
            </button>
          </div>

          {/* Identity Avatar & Quick Summary */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#fd8535] text-white font-extrabold flex items-center justify-center text-sm shadow-sm shrink-0">
                {currentUser.name
                  ? currentUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "AA"}
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-neutral-900 leading-tight">
                    {currentUser.name}
                  </h4>
                  {currentUser.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1546d9] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                      <ShieldCheck className="w-3 h-3 text-[#1546d9]" />
                      Verified
                    </span>
                  )}
                </div>
                {currentUser.affiliation && (
                  <p className="text-xs text-neutral-500 font-medium mt-0.5">
                    {currentUser.affiliation}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded-full transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Nested Profile Controls & Details */}
          <div className="space-y-2 pt-1">
            {/* Display Name */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-100 text-xs transition-colors">
              <span className="text-neutral-500 font-medium">Display Name</span>
              <span className="font-bold text-neutral-900">{currentUser.name}</span>
            </div>

            {/* Verified Email */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-100 text-xs transition-colors">
              <span className="text-neutral-500 font-medium">Verified Email</span>
              <div className="flex items-center gap-1.5 font-semibold text-neutral-800">
                <span>{currentUser.email}</span>
                {currentUser.isVerified && (
                  <span className="text-[10px] font-bold text-[#1546d9] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                    Verified
                  </span>
                )}
              </div>
            </div>

            {/* Mobile Number */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-100 text-xs transition-colors">
              <span className="text-neutral-500 font-medium">Mobile Number</span>
              <span className="font-semibold text-neutral-800">{currentUser.phone}</span>
            </div>

            {/* Campus Affiliation & Status */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-100 text-xs transition-colors">
              <span className="text-neutral-500 font-medium">Affiliation & Status</span>
              <span className="font-semibold text-neutral-800">
                {currentUser.affiliation || "Campus Member"}
                {currentUser.badge ? ` • ${currentUser.badge}` : ""}
              </span>
            </div>

            {/* Dietary & Kitchen Notes */}
            {currentUser.dietaryNotes && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-100 text-xs transition-colors">
                <div className="flex items-center gap-1.5 text-neutral-500 font-medium">
                  <Utensils className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Dietary Notes</span>
                </div>
                <span className="font-medium text-neutral-700">{currentUser.dietaryNotes}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Guest Diner State */
        <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-soft text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#FF6B42] to-[#fd8535] text-white flex items-center justify-center mx-auto shadow-md shadow-orange-950/20">
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
              className="w-full py-3.5 rounded-2xl bg-[#fd8535] hover:bg-[#e07227] text-white font-extrabold text-xs shadow-soft transition-all active:scale-[0.98]"
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
                  savedPaymentRails: ["Easypaisa", "SadaPay"],
                  dietaryNotes: "Halal only • Mild spice",
                });
              }}
              className="text-[11px] text-neutral-400 hover:text-neutral-700 font-semibold pt-2 inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Quick Demo Login as Ahmad Ali</span>
            </button>
          </div>

          <p className="text-xs text-neutral-500 pt-2 text-center leading-relaxed">
            Platform member discounts are offered across participating venues with verified email.
          </p>
        </div>
      )}

      {/* 2. Perks Group (Formerly Preferences) */}
      <section className="space-y-1.5">
        <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
          Perks
        </h4>
        <div className="rounded-2xl bg-white border border-neutral-200/80 divide-y divide-neutral-100 overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => handleStagedClick("Vouchers")}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-neutral-50/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Ticket className="w-4 h-4 text-neutral-600 shrink-0" />
              <p className="text-xs font-bold text-neutral-900">Vouchers</p>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => handleStagedClick("Invite Friends")}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-neutral-50/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <UserPlus className="w-4 h-4 text-neutral-600 shrink-0" />
              <p className="text-xs font-bold text-neutral-900">Invite Friends</p>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
          </button>
        </div>
      </section>

      {/* 3. Support Group (Matching Reference Architecture) */}
      <section className="space-y-1.5">
        <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
          Support
        </h4>
        <div className="rounded-2xl bg-white border border-neutral-200/80 divide-y divide-neutral-100 overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => handleStagedClick("Frequently Asked Questions")}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-neutral-50/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-4 h-4 text-neutral-600 shrink-0" />
              <p className="text-xs font-bold text-neutral-900">Frequently asked questions</p>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => handleStagedClick("Chat with us")}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-neutral-50/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-neutral-600 shrink-0" />
              <p className="text-xs font-bold text-neutral-900">Chat with us</p>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => handleStagedClick("Share feedback")}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-neutral-50/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <MessageCircle className="w-4 h-4 text-neutral-600 shrink-0" />
              <p className="text-xs font-bold text-neutral-900">Share feedback</p>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
          </button>
        </div>
      </section>

      {/* 4. More Group (Matching Reference Architecture) */}
      <section className="space-y-1.5">
        <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
          More
        </h4>
        <div className="rounded-2xl bg-white border border-neutral-200/80 divide-y divide-neutral-100 overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => handleStagedClick("Become a Partner")}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-neutral-50/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Handshake className="w-4 h-4 text-neutral-600 shrink-0" />
              <p className="text-xs font-bold text-neutral-900">Become a Partner</p>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => handleStagedClick("QueueLess for Business")}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-neutral-50/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-neutral-600 shrink-0" />
              <p className="text-xs font-bold text-neutral-900">QueueLess for Business</p>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => handleStagedClick("About QueueLess")}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-neutral-50/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Info className="w-4 h-4 text-neutral-600 shrink-0" />
              <p className="text-xs font-bold text-neutral-900">About us</p>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
          </button>

          <Link
            href="/terms"
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-neutral-50/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-neutral-600 shrink-0" />
              <p className="text-xs font-bold text-neutral-900">Pickup terms & rules</p>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
          </Link>

          <Link
            href="/privacy"
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-neutral-50/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-neutral-600 shrink-0" />
              <p className="text-xs font-bold text-neutral-900">Privacy policy</p>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
          </Link>
        </div>
      </section>

      {/* 5. Session Actions (Sign Out / Replay Splash) */}
      <div className="space-y-2 pt-1">
        {currentUser && (
          <div className="rounded-2xl bg-white border border-neutral-200/80 overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={signOut}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-neutral-50/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-xs font-bold text-red-600">Logout</p>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onReplaySplash}
          className="w-full py-2.5 rounded-2xl bg-white border border-neutral-200/80 text-neutral-700 hover:text-neutral-900 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
          <span>Experience Opening Splash</span>
        </button>
      </div>

      {/* 6. Brand Footer */}
      <div className="pt-2 pb-6 text-center space-y-0.5">
        <p className="font-extrabold text-sm tracking-tight text-neutral-800">
          Queue<span className="text-[#fd8535]">Less</span>
        </p>
        <p className="text-[11px] font-medium text-neutral-400">
          v1.0.0
        </p>
      </div>

      {/* Staged Notification Feedback Toast */}
      {stagedNotice && (
        <div className="fixed bottom-20 inset-x-6 z-50 max-w-sm mx-auto p-3 rounded-2xl bg-neutral-900/95 text-white text-xs font-semibold text-center shadow-float backdrop-blur-md animate-fade-in flex items-center justify-center gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{stagedNotice}</span>
        </div>
      )}
    </div>
  );
}
