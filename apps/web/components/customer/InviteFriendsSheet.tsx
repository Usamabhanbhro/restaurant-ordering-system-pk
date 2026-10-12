"use client";

import { useState, useEffect } from "react";
import { Drawer } from "vaul";
import {
  X,
  Gift,
  Share2,
  Copy,
  Check,
  Users,
  MessageCircle,
  Sparkles,
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
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

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

  const handleCopyLink = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(userInviteUrl).catch(() => {});
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(userCode).catch(() => {});
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

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
        // Fallback to copy link if user cancelled or share failed
      }
    }
    handleCopyLink();
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
          <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5">
            {/* Hero Visual Card (inspired by Foodpanda/DoorDash invite pattern in reference) */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FFF4ED] via-[#FFEADB] to-[#FED6C0] border border-orange-200/70 text-center relative overflow-hidden shadow-2xs">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#fd8535] to-[#EF5A30] text-white flex items-center justify-center mx-auto shadow-md shadow-orange-950/20 mb-3">
                <Gift className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-xl font-black text-neutral-900 tracking-tight">
                {inviteData.headline}
              </h2>
              <p className="text-xs text-neutral-600 font-medium mt-1 max-w-[260px] mx-auto leading-relaxed">
                Share QueueLess with friends and earn rewards when they place their first order.
              </p>
            </div>

            {/* 2-Step Rules Box (matching reference layout: 1. Your friend gets... 2. Then you get...) */}
            <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-100 space-y-3">
              <div className="space-y-0.5">
                <h4 className="text-sm font-black text-neutral-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#fd8535] text-white text-[11px] font-extrabold inline-flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>Your friend gets Rs. 50</span>
                </h4>
                <p className="text-xs text-neutral-500 font-medium pl-6">
                  when they sign up with your unique invite link
                </p>
              </div>

              <div className="border-t border-neutral-200/60 pt-2.5 space-y-0.5">
                <h4 className="text-sm font-black text-neutral-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-extrabold inline-flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>Then you get Rs. 100</span>
                </h4>
                <p className="text-xs text-neutral-500 font-medium pl-6">
                  once they complete their first order (min. Rs. 200)
                </p>
              </div>
            </div>

            {/* Referral Code & Link Box */}
            <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                Your Referral Code
              </span>

              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-dashed border-neutral-300">
                <span className="font-mono font-black text-base text-neutral-900 tracking-wider">
                  {userCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:bg-neutral-100 active:scale-95 transition-all"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-500 pt-0.5">
                <span className="truncate max-w-[220px] font-mono text-[11px] text-neutral-400">
                  {userInviteUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="text-xs font-bold text-[#fd8535] hover:underline shrink-0"
                >
                  {copiedLink ? "Link Copied!" : "Copy Link"}
                </button>
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
