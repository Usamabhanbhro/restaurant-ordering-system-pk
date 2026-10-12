"use client";

import { useState, useEffect } from "react";
import { Drawer } from "vaul";
import {
  X,
  Ticket,
  Copy,
  Check,
  Calendar,
  Sparkles,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import type { VoucherItem } from "@/lib/api/types";
import { MOCK_VOUCHERS } from "@/lib/api/mockClient";

interface VouchersSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VouchersSheet({ isOpen, onClose }: VouchersSheetProps) {
  const [vouchers, setVouchers] = useState<VoucherItem[]>(MOCK_VOUCHERS);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      apiClient
        .getVouchers()
        .then((data) => {
          if (data && data.length > 0) {
            setVouchers(data);
          }
        })
        .catch(() => {
          setVouchers(MOCK_VOUCHERS);
        });
    }
  }, [isOpen]);

  const handleCopyCode = (code: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Drawer.Content className="fixed bottom-0 inset-x-0 z-50 max-w-md mx-auto h-full max-h-[88vh] bg-white rounded-t-[2.5rem] shadow-float overflow-hidden flex flex-col focus:outline-none">
          {/* iOS Handle */}
          <div className="pt-3 pb-1 flex justify-center shrink-0">
            <div className="w-12 h-1.5 rounded-full bg-neutral-300" />
          </div>

          {/* Sheet Header */}
          <div className="px-5 py-3 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#fd8535] flex items-center justify-center font-bold">
                <Ticket className="w-4 h-4 text-[#fd8535]" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-neutral-900 tracking-tight">
                  Your Vouchers
                </h3>
                <p className="text-[11px] text-neutral-400 font-medium">
                  Active discounts & member rewards
                </p>
              </div>
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

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-3.5">
            {vouchers.length > 0 ? (
              <div className="space-y-3">
                {vouchers.map((voucher) => {
                  const isUnused = voucher.status === "UNUSED";
                  const isUsed = voucher.status === "USED";
                  const isCopied = copiedCode === voucher.code;

                  return (
                    <div
                      key={voucher.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isUnused
                          ? "bg-white border-neutral-200/90 shadow-2xs hover:border-[#fd8535]/50"
                          : "bg-neutral-50/70 border-neutral-200/60 opacity-75"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-neutral-900">
                              {voucher.title}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isUnused
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                                  : isUsed
                                  ? "bg-neutral-100 text-neutral-500 border-neutral-200"
                                  : "bg-red-50 text-red-600 border-red-200"
                              }`}
                            >
                              {voucher.status === "UNUSED"
                                ? "Active"
                                : voucher.status === "USED"
                                ? "Used"
                                : "Expired"}
                            </span>
                          </div>

                          <p className="text-xs text-neutral-600 font-medium">
                            {voucher.description}
                          </p>

                          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 pt-1">
                            <Calendar className="w-3 h-3 text-neutral-400" />
                            <span>Valid until {voucher.validUntil}</span>
                          </div>
                        </div>

                        {/* Copy Code Action Button */}
                        <div className="shrink-0">
                          <button
                            type="button"
                            disabled={!isUnused}
                            onClick={() => handleCopyCode(voucher.code)}
                            className={`px-3 py-1.5 rounded-xl font-mono font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 border ${
                              isCopied
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : isUnused
                                ? "bg-neutral-100 hover:bg-neutral-200/80 text-neutral-900 border-neutral-200/80 cursor-pointer"
                                : "bg-neutral-100 text-neutral-400 border-transparent cursor-not-allowed"
                            }`}
                            title="Copy voucher code"
                          >
                            <span>{voucher.code}</span>
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-neutral-500" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-3xl border border-neutral-100 shadow-soft space-y-2">
                <Ticket className="w-10 h-10 text-neutral-300 mx-auto" />
                <h4 className="font-extrabold text-sm text-neutral-800">No vouchers yet</h4>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Invite friends to earn rewards and unlock special counter discounts!
                </p>
              </div>
            )}

            {/* Bottom Helpful Hint Card */}
            <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200/60 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#fd8535] shrink-0 mt-0.5" />
              <div className="text-[11px] text-neutral-600 leading-relaxed">
                <strong className="text-neutral-800 font-bold block mb-0.5">
                  How to redeem:
                </strong>
                Copy your active voucher code and paste it in the Voucher field inside the Cart Drawer before placing your order.
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
