"use client";

import React from "react";
import { Check, AlertTriangle } from "lucide-react";

export interface AuthOnboardingProps {
  displayName: string;
  setDisplayName: (val: string) => void;
  affiliation: string;
  setAffiliation: (val: string) => void;
  errorMessage: string;
  onSubmit: (e: React.FormEvent) => void;
}

const AFFILIATIONS = ["FAST-NUCES", "LUMS", "IBA", "NUST", "SZABIST", "None"];

export function AuthOnboarding({
  displayName,
  setDisplayName,
  affiliation,
  setAffiliation,
  errorMessage,
  onSubmit,
}: AuthOnboardingProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-center justify-between px-1 pb-1">
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
            <Check className="w-3 h-3 text-white" />
          </span>
          <span className="text-xs font-bold text-neutral-800">Details</span>
        </div>
        <div className="w-8 h-0.5 bg-emerald-400" />
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
            <Check className="w-3 h-3 text-white" />
          </span>
          <span className="text-xs font-bold text-neutral-800">Verify</span>
        </div>
        <div className="w-8 h-0.5 bg-emerald-400" />
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-[#EF5A30] text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-orange-200">
            3
          </span>
          <span className="text-xs font-bold text-neutral-900">Profile</span>
        </div>
      </div>

      <div>
        <h3 className="font-black text-lg text-neutral-900 tracking-tight">
          Almost ready! What should we call you?
        </h3>
        <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
          Your barista and pickup staff will call this name when your food is ready at the
          counter.
        </p>
      </div>

      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-1">
        <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wide">
          Display Name / Callout Name *
        </label>
        <input
          type="text"
          placeholder="e.g. Ahmad Ali or Hassan"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs font-bold text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-[#EF5A30] focus:ring-2 focus:ring-[#EF5A30]/15 outline-none transition-all"
        />
      </div>

      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wide">
            Campus Affiliation (Optional)
          </label>
          <span className="text-[10px] text-neutral-400">For student discounts</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {AFFILIATIONS.map((aff) => (
            <button
              key={aff}
              type="button"
              onClick={() => setAffiliation(aff)}
              className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                affiliation === aff
                  ? "bg-[#EF5A30] text-white border-[#EF5A30] shadow-xs"
                  : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
              }`}
            >
              {aff}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3.5 rounded-2xl bg-[#EF5A30] hover:bg-[#DE4920] text-white font-extrabold text-xs shadow-soft transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>Complete Setup & Start Ordering</span>
      </button>
    </form>
  );
}
