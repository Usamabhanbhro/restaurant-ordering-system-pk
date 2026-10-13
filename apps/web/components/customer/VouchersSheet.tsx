"use client";

import { useState, useEffect } from "react";
import { Drawer } from "vaul";
import {
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
  const [customCode, setCustomCode] = useState("");
  const [customFeedback, setCustomFeedback] = useState<{ message: string; success: boolean } | null>(null);

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

  const handleAddCustomVoucher = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customCode.trim().toUpperCase();
    if (!trimmed) return;

    if (vouchers.some((v) => v.code.toUpperCase() === trimmed)) {
      setCustomFeedback({ message: `Voucher ${trimmed} is already in your wallet.`, success: false });
      return;
    }

    const newVoucher: VoucherItem = {
      id: `custom-${Date.now()}`,
      code: trimmed,
      title: `${trimmed} Voucher`,
      description: `Custom Promo Code • ${trimmed}`,
      discountType: "FIXED",
      discountValue: 100,
      validUntil: "End of Month",
      status: "UNUSED",
    };

    setVouchers([newVoucher, ...vouchers]);
    setCustomCode("");
    setCustomFeedback({ message: `Voucher ${trimmed} added successfully!`, success: true });
    setTimeout(() => setCustomFeedback(null), 3000);
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
          <div className="px-5 py-3 border-b border-neutral-100 flex items-center justify-center shrink-0 bg-white">
            <h3 className="font-extrabold text-base text-neutral-900 tracking-tight text-center">
              Vouchers
            </h3>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
            {/* Custom Voucher Input Box */}
            <form onSubmit={handleAddCustomVoucher} className="p-3.5 rounded-2xl bg-neutral-50/90 border border-neutral-200/80 space-y-2">
              <label htmlFor="custom-voucher-input" className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500 block">
                Add Custom Voucher
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Ticket className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="custom-voucher-input"
                    type="text"
                    placeholder="Enter voucher code (e.g. SAVE20)..."
                    value={customCode}
                    onChange={(e) => {
                      setCustomCode(e.target.value.toUpperCase());
                      setCustomFeedback(null);
                    }}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-neutral-200/90 text-xs font-mono font-bold text-neutral-900 uppercase placeholder:normal-case placeholder:font-sans placeholder:font-normal placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#fd8535]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!customCode.trim()}
                  className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-[#fd8535] disabled:opacity-40 disabled:hover:bg-neutral-900 text-white text-xs font-bold transition-all shrink-0 active:scale-95 cursor-pointer shadow-xs"
                >
                  Add
                </button>
              </div>
              {customFeedback && (
                <p className={`text-[11px] font-semibold ${customFeedback.success ? "text-emerald-600" : "text-amber-700"}`}>
                  {customFeedback.message}
                </p>
              )}
            </form>

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
