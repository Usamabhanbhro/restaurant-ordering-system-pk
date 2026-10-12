"use client";

import { useState, useEffect } from "react";
import { Drawer } from "vaul";
import {
  X,
  Gift,
  Share2,
  Users,
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

          {/* Sheet Header */}
          <div className="px-5 py-3 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">
                Perks
              </span>
              <span className="text-xs text-neutral-300">•</span>
              <h3 className="font-extrabold text-sm text-neutral-900 tracking-tight">
                Invite Friends
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
              title="Close"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
            {/* Hero Card: Reworked and simplified invite reward copy */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FFF4ED] via-[#FFEADB] to-[#FED6C0] border border-orange-200/70 text-center relative overflow-hidden shadow-2xs space-y-1.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#fd8535] to-[#EF5A30] text-white flex items-center justify-center mx-auto shadow-md shadow-orange-950/20 mb-2">
                <Gift className="w-7 h-7 text-white" />
              </div>

              <h2 className="text-lg font-black text-neutral-900 tracking-tight">
                Invite friends, get Rs. 100
              </h2>
              <p className="text-xs text-neutral-600 font-medium max-w-[280px] mx-auto leading-relaxed">
                They get Rs. 50 on signup. You get Rs. 100 once they complete their first order (min. Rs. 200).
              </p>
            </div>

            {/* Referral Code Box (without button or invite link block) */}
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

            {/* Friends Invited Progress Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 text-neutral-700">
                  <Users className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="text-xs font-bold">Friends Invited</span>
                </div>
                <span className="text-[11px] font-bold text-neutral-400">
                  {inviteData.invitedFriends.length} total
                </span>
              </div>

              {inviteData.invitedFriends.length > 0 ? (
                <div className="rounded-2xl bg-white border border-neutral-200/80 divide-y divide-neutral-100 overflow-hidden shadow-2xs">
                  {inviteData.invitedFriends.map((friend) => (
                    <div
                      key={friend.id}
                      className="px-3.5 py-2.5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-neutral-900">{friend.name}</p>
                        <p className="text-[10px] text-neutral-400">Joined {friend.joinedDate}</p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          friend.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                            : "bg-orange-50 text-orange-700 border-orange-200/60"
                        }`}
                      >
                        {friend.status === "COMPLETED" ? "Reward Earned" : "Pending Order"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-neutral-50 text-center text-xs text-neutral-400 border border-neutral-100">
                  No friends invited yet. Start sharing your link today!
                </div>
              )}
            </div>

            {/* Terms Footer Note */}
            <p className="text-[10px] text-neutral-400 text-center leading-relaxed px-4">
              Friends receive a Rs. 50 welcome discount on their first order. You earn a Rs. 100 voucher perk once their order is settled at the pickup counter.
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
