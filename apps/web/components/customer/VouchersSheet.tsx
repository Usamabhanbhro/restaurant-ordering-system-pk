"use client";

import { useState, useEffect } from "react";
import { Drawer } from "vaul";
import {
  X,
  Ticket,
  Copy,
  Check,
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

          {/* Sheet Header: Single centered word "Vouchers" */}
          <div className="relative px-5 py-3 border-b border-neutral-100 flex items-center justify-center shrink-0 bg-white">
            <h3 className="font-extrabold text-base text-neutral-900 tracking-tight text-center">
              Vouchers
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
              title="Close"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-3">
            {vouchers.length > 0 ? (
              <div className="space-y-2.5">
                {vouchers.map((voucher) => {
                  const isUnused = voucher.status === "UNUSED";
                  const isUsed = voucher.status === "USED";
                  const isCopied = copiedCode === voucher.code;

                  return (
                    <div
                      key={voucher.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isUnused
                          ? "bg-white border-neutral-200/90 shadow-2xs"
                          : "bg-neutral-50/70 border-neutral-200/60 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-extrabold text-xs text-neutral-900 leading-tight">
                            {voucher.description}
                          </p>
                          <p className="text-[11px] text-neutral-400 font-medium mt-1">
                            Valid until {voucher.validUntil}
                            {isUsed && " • Used"}
                          </p>
                        </div>

                        {/* Copy Code Action Button */}
                        <button
                          type="button"
                          disabled={!isUnused}
                          onClick={() => handleCopyCode(voucher.code)}
                          className={`px-3 py-1.5 rounded-xl font-mono font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 border shrink-0 ${
                            isCopied
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : isUnused
                              ? "bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border-neutral-200/80 cursor-pointer"
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
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
