"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  LogOut,
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
  Edit,
  UtensilsCrossed,
  AlertCircle,
} from "lucide-react";
import type { OrderingMode, TableContext } from "@/lib/mockData";
import { useAuthStore } from "@/lib/store/authStore";
import { EditProfileSheet } from "./EditProfileSheet";
import { VouchersSheet } from "./VouchersSheet";
import { InviteFriendsSheet } from "./InviteFriendsSheet";
import { ShareFeedbackSheet } from "./ShareFeedbackSheet";

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
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isVouchersOpen, setIsVouchersOpen] = useState(false);
  const [isInviteFriendsOpen, setIsInviteFriendsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const isInVenue = mode === "IN_VENUE";
  const tableNumber = tableContext?.tableNumber || "01";
  const zoneName =
    tableContext?.zoneName ||
    (tableContext?.zoneSlug ? tableContext.zoneSlug.replace(/-/g, " ").toUpperCase() : "Dine-In Area");

  const handleStagedClick = (title: string) => {
    setStagedNotice(`${title} panel is staged and will be wired in the next phase.`);
    setTimeout(() => setStagedNotice(null), 2500);
  };

  const handleProfileSaved = () => {
    setStagedNotice("Profile updated successfully!");
    setTimeout(() => setStagedNotice(null), 2500);
  };

  return (
    <div className="p-4 space-y-5">
      {/* 1. Account / Diner Identity Header */}
      {isInVenue ? (
        <div className="space-y-3">
          {/* Table Session Header Card (In-Venue QR Mode) */}
          <div className="rounded-3xl bg-white border border-neutral-200/80 p-4 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900">Table Session</span>
            </div>

            {/* Table Highlight & Zone */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#fd8535] flex items-center justify-center shrink-0 border border-orange-100 shadow-2xs">
                <UtensilsCrossed className="w-6 h-6 text-[#fd8535]" />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <h3 className="font-black text-lg text-neutral-900 leading-tight truncate">
                  Table {tableNumber}
                </h3>
                <p className="text-xs text-neutral-500 font-medium truncate mt-0.5">
                  {zoneName}
                </p>
              </div>
            </div>

            {/* Grouped Table Session Details */}
            <div className="pt-2 border-t border-neutral-100 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 font-medium">Table Number</span>
                <span className="font-bold text-neutral-900">Table {tableNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 font-medium">Dining Zone</span>
                <span className="font-semibold text-neutral-800">{zoneName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 font-medium">Ordering Mode</span>
                <span className="font-semibold text-neutral-800">In-Venue QR</span>
              </div>
            </div>

            {/* In-Venue Settlement Notice */}
            <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/60 text-xs text-neutral-600 font-medium leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
              <span>Orders at this table are settled directly at the counter.</span>
            </div>
          </div>

          {/* Secondary Account / Sign-In Banner (Editing Actions Hidden) */}
          {currentUser ? (
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                {currentUser.profilePicture ? (
                  <img
                    src={currentUser.profilePicture}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-neutral-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#fd8535] text-white font-extrabold flex items-center justify-center text-xs shrink-0">
                    {currentUser.name
                      ? currentUser.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "AA"}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-extrabold text-neutral-900 truncate">{currentUser.name}</p>
                  <p className="text-[11px] text-neutral-400 font-medium truncate">{currentUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={signOut}
                className="px-3 py-1.5 rounded-xl text-neutral-500 hover:text-red-600 hover:bg-red-50 text-xs font-bold transition-colors shrink-0"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0">
                <p className="font-bold text-neutral-900">Ordering as Guest Diner</p>
                <p className="text-[11px] text-neutral-500 truncate">
                  Sign in to earn vouchers and track orders.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAuthModal("LOGIN");
                  setPendingPostAuthAction(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs shrink-0 transition-all active:scale-95 shadow-2xs"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      ) : (
        /* REMOTE Mode */
        currentUser ? (
          <div className="space-y-3">
            {/* Honest Unverified Account Callout */}
            {!currentUser.isVerified && (
              <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-900 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-semibold text-amber-900 leading-tight">
                    Verify your email to place remote orders
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModal("VERIFY_EMAIL");
                    setStagedNotice("Verification code sent to your email!");
                    setTimeout(() => setStagedNotice(null), 3000);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-[#fd8535] hover:bg-[#e0681c] text-white text-[11px] font-bold shrink-0 transition-all active:scale-95 shadow-2xs"
                >
                  Resend verification
                </button>
              </div>
            )}

            {/* Standard Personal Identity Card */}
            <div className="rounded-3xl bg-white border border-neutral-200/80 p-4 shadow-soft space-y-3">
              {/* Identity Header: Plain text title & Edit icon button */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900">Profile Information</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsEditProfileOpen(true)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
                    title="Edit Profile"
                    aria-label="Edit Profile"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={signOut}
                    className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Identity Summary: Avatar + Clean Name + Affiliation */}
              <div className="flex items-center gap-3">
                {currentUser.profilePicture ? (
                  <img
                    src={currentUser.profilePicture}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover shadow-sm shrink-0 border border-neutral-200/80"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#fd8535] text-white font-extrabold flex items-center justify-center text-xs shadow-sm shrink-0">
                    {currentUser.name
                      ? currentUser.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "AA"}
                  </div>
                )}
                <div className="flex flex-col justify-center min-w-0">
                  <h4 className="font-extrabold text-sm text-neutral-900 leading-tight truncate">
                    {currentUser.name}
                  </h4>
                </div>
              </div>

              {/* Grouped Profile Details with reduced gaps */}
              <div className="pt-2 border-t border-neutral-100 space-y-1.5 text-xs">
                {/* Display Name */}
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 font-medium">Display Name</span>
                  <span className="font-bold text-neutral-900">{currentUser.name}</span>
                </div>

                {/* Email */}
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 font-medium">Email</span>
                  <div className="flex items-center gap-1 font-semibold text-neutral-800">
                    <span>{currentUser.email}</span>
                    {currentUser.isVerified ? (
                      <span className="text-[10px] font-bold text-[#1546d9] bg-blue-50 px-1 py-0.5 rounded border border-blue-200/60 inline-flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5 text-[#1546d9]" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200/60 inline-flex items-center gap-0.5">
                        <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                        Unverified
                      </span>
                    )}
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 font-medium">Mobile Number</span>
                  <span className="font-semibold text-neutral-800">{currentUser.phone}</span>
                </div>

                {/* Campus Affiliation & Status */}
                {currentUser.affiliation && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 font-medium">Affiliation</span>
                    <span className="font-semibold text-neutral-800">
                      {currentUser.affiliation}
                      {currentUser.badge ? ` • ${currentUser.badge}` : ""}
                    </span>
                  </div>
                )}
              </div>
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
                    badge: "Student",
                    isVerified: true,
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
        )
      )}

      {/* 2. Perks Group (Formerly Preferences) */}
      <section className="space-y-1.5">
        <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
          Perks
        </h4>
        <div className="rounded-2xl bg-white border border-neutral-200/80 divide-y divide-neutral-100 overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setIsVouchersOpen(true)}
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
            onClick={() => setIsInviteFriendsOpen(true)}
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
            onClick={() => setIsFeedbackOpen(true)}
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

      {/* Sheets & Dialogs */}
      <EditProfileSheet
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSaved={handleProfileSaved}
      />

      <VouchersSheet
        isOpen={isVouchersOpen}
        onClose={() => setIsVouchersOpen(false)}
      />

      <InviteFriendsSheet
        isOpen={isInviteFriendsOpen}
        onClose={() => setIsInviteFriendsOpen(false)}
      />

      <ShareFeedbackSheet
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        tableContext={tableContext}
        mode={mode}
      />

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
