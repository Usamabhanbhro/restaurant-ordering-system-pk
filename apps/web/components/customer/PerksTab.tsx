"use client";

import { useState } from "react";
import { Check, Gift, GraduationCap, Zap } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";

export function PerksTab() {
  const { promoCode, promoApplied, applyPromo, removePromo } = useCartStore();
  const [inputCode, setInputCode] = useState(promoCode);
  const [successMsg, setSuccessMsg] = useState(promoApplied ? `Voucher ${promoCode} active` : "");

  const handleApply = () => {
    if (!inputCode.trim()) return;
    const cleanCode = inputCode.trim().toUpperCase();
    applyPromo(cleanCode);
    setSuccessMsg(`Partner voucher ${cleanCode} attached! Rs. 50 discount active.`);
  };

  const handleRemove = () => {
    removePromo();
    setInputCode("");
    setSuccessMsg("");
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">
          Perks & Student Rewards
        </h2>
      </div>

      {/* 5-Stamp Digital Loyalty Punch Card */}
      <div className="p-4 rounded-3xl bg-neutral-950 text-white shadow-float relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400">
              Coffee Stamp Card
            </p>
            <h3 className="font-extrabold text-sm text-white mt-0.5">Buy 5 Drinks, Get 1 Free</h3>
          </div>
          <span className="text-xs font-bold text-orange-400 bg-orange-950/60 px-2.5 py-1 rounded-full border border-orange-500/30">
            3 of 5 Stamped
          </span>
        </div>

        {/* Stamp circles */}
        <div className="grid grid-cols-5 gap-2 mt-4">
          {[1, 2, 3, 4, 5].map((idx) => {
            const isStamped = idx <= 3;
            const isFree = idx === 5;
            return (
              <div
                key={idx}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center border transition-all ${
                  isStamped
                    ? "bg-gradient-to-br from-[#FF6B42] to-[#EF5A30] border-transparent text-white shadow-md shadow-orange-950/50"
                    : isFree
                    ? "bg-slate-900 border-dashed border-orange-400/60 text-orange-400"
                    : "bg-slate-900 border-slate-800 text-slate-500"
                }`}
              >
                {isStamped ? (
                  <Check className="w-5 h-5 text-white" />
                ) : isFree ? (
                  <Gift className="w-4 h-4 text-orange-400 animate-pulse" />
                ) : (
                  <span className="font-bold text-xs">{idx}</span>
                )}
                <span className="text-[8px] font-bold mt-0.5 opacity-80">
                  {isFree ? "FREE" : `#${idx}`}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-400 mt-3">
          Next free specialty drink unlock at 5th counter pickup.
        </p>
      </div>

      {/* Campus Affiliation Discounts */}
      <div className="p-4 rounded-3xl bg-white border border-neutral-200/80 shadow-soft space-y-3">
        <h4 className="font-bold text-xs text-neutral-900 uppercase tracking-wider">
          Active Campus Affiliations
        </h4>

        <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-[#EF5A30]">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900">FAST / LUMS / SZABIST 10% Off</p>
              <p className="text-[10px] text-neutral-500">
                Auto-applied at counter on showing student card
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
            Active
          </span>
        </div>

        {/* Promo Voucher Input */}
        <div className="pt-2">
          <label className="text-[11px] font-bold text-neutral-700">
            Enter Partner Voucher Code
          </label>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              placeholder="e.g. FAST10 or CAMPUSPASS"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              className="flex-1 px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#EF5A30]"
            />
            {promoApplied ? (
              <button
                type="button"
                onClick={handleRemove}
                className="px-4 py-2 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold transition-colors"
              >
                Remove
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApply}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-[#EF5A30] text-white text-xs font-bold transition-colors"
              >
                Apply
              </button>
            )}
          </div>
          {successMsg && (
            <p className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>{successMsg}</span>
            </p>
          )}
        </div>
      </div>

      {/* Zero Fee Guarantee Notice */}
      <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-xs flex items-center gap-2.5 text-orange-950">
        <Zap className="w-4 h-4 text-[#EF5A30] shrink-0" />
        <p className="text-[11px] font-medium leading-relaxed">
          <strong>Zero Platform Fees:</strong> QueueLess directly links you with venue staff with 0%
          middleman cut.
        </p>
      </div>
    </div>
  );
}
