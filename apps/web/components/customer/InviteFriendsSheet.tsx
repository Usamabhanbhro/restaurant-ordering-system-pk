"use client";

import { useState, useEffect } from "react";
import { Drawer } from "vaul";
import {
  Share2,
  MessageCircle,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/store/authStore";
import type { InviteInfo } from "@/lib/api/types";
import { MOCK_INVITE_INFO } from "@/lib/api/mockClient";

interface InviteFriendsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteFriendsSheet({ isOpen, onClose }: InviteFriendsSheetProps) {
  const { currentUser } = useAuthStore();
  const [inviteData, setInviteData] = useState<InviteInfo>(MOCK_INVITE_INFO);

  useEffect(() => {
    if (isOpen) {
      apiClient
        .getInviteLink()
        .then((data) => {
          if (data) setInviteData(data);
        })
        .catch(() => {
          setInviteData(MOCK_INVITE_INFO);
        });
    }
  }, [isOpen]);

  // Derive personalized referral code/link based on current user
  const userCode = currentUser?.name
    ? currentUser.name.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 10) || "QUEUELESS"
    : inviteData.inviteCode;
  const userInviteUrl = `https://queueless.pk/join/${userCode}`;

  const handleNativeShare = async () => {
    const shareText = `Hey! Join me on QueueLess to skip the lines at campus cafes. Use my code ${userCode} for Rs. 50 off your first order: ${userInviteUrl}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "QueueLess Invite",
          text: shareText,
          url: userInviteUrl,
        });
        return;
      } catch {
        // Fallback to clipboard write if share cancelled or unavailable
      }
    }
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(userInviteUrl).catch(() => {});
    }
  };

  const shareTextEncoded = encodeURIComponent(
    `Hey! Join me on QueueLess to skip the lines at campus cafes. Use my code ${userCode} for Rs. 50 off your first order: ${userInviteUrl}`
  );
  const whatsappUrl = `https://wa.me/?text=${shareTextEncoded}`;

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Drawer.Content className="fixed bottom-0 inset-x-0 z-50 max-w-md mx-auto h-full max-h-[92vh] bg-white rounded-t-[2.5rem] shadow-float overflow-hidden flex flex-col focus:outline-none">
          {/* iOS Handle */}
          <div className="pt-3 pb-1 flex justify-center shrink-0">
            <div className="w-12 h-1.5 rounded-full bg-neutral-300" />
          </div>

          {/* Sheet Header: Just "Invite Friends" */}
          <div className="px-5 py-3 border-b border-neutral-100 flex items-center justify-center shrink-0 bg-white">
            <h3 className="font-extrabold text-base text-neutral-900 tracking-tight text-center">
              Invite Friends
            </h3>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
            {/* Hero Card: Food-app-style giftbox visual & simplified reward copy */}
            <div className="p-5 rounded-3xl bg-gradient-to-b from-[#FFF5EE] via-[#FFF9F5] to-white border border-orange-200/60 text-center relative overflow-hidden shadow-2xs space-y-2.5">
              <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                <img
                  src="/images/queueless-giftbox.jpg"
                  alt="QueueLess Gift Box"
                  className="w-32 h-32 object-contain rounded-2xl shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <h2 className="text-lg font-black text-neutral-900 tracking-tight">
                  Invite friends, get Rs. 100
                </h2>
                <p className="text-xs text-neutral-600 font-medium max-w-[280px] mx-auto leading-relaxed">
                  They get Rs. 50 on signup. You get Rs. 100 after their first order (min. Rs. 200).
                </p>
              </div>
            </div>

            {/* Referral Code Box */}
            <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-2">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                Your Referral Code
              </span>

              <div className="p-3 rounded-xl bg-neutral-50 border border-dashed border-neutral-300 text-center">
                <span className="font-mono font-black text-lg text-neutral-900 tracking-wider">
                  {userCode}
                </span>
              </div>
            </div>

            {/* Credits / Rupees Earned Display */}
            <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Credits Earned
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-black text-neutral-950 tracking-tight">
                      Rs. {inviteData.earnedRupees ?? 100}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
                  Available Balance
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 pt-1.5 border-t border-neutral-100">
                Reward credits earned from completed friend referrals.
              </p>
            </div>

            {/* Terms Footer Note */}
            <p className="text-[10px] text-neutral-400 text-center leading-relaxed px-4">
              Credits are awarded after your friend completes their first counter-settled order.
            </p>
          </div>

          {/* Sticky Bottom Share CTAs */}
          <div className="p-4 bg-white/95 backdrop-blur-md border-t border-neutral-100 space-y-2 shrink-0">
            {/* Primary Share CTA */}
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full py-3.5 rounded-2xl bg-[#EF5A30] hover:bg-[#DE4920] text-white font-extrabold text-xs shadow-soft transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4 text-white" />
              <span>Share your link</span>
            </button>

            {/* Secondary WhatsApp Share CTA */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-bold text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-[#25D366]/30"
            >
              <MessageCircle className="w-4 h-4 text-[#128C7E]" />
              <span>Share via WhatsApp</span>
            </a>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
