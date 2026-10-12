"use client";

import React from "react";
import { Mail, AlertTriangle } from "lucide-react";

export interface AuthForgotPasswordProps {
  email: string;
  setEmail: (val: string) => void;
  errorMessage: string;
  onSubmit: () => void;
}

export function AuthForgotPassword({
  email,
  setEmail,
  errorMessage,
  onSubmit,
}: AuthForgotPasswordProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-black text-lg text-neutral-900 tracking-tight">Forgot Password?</h3>
        <p className="text-xs text-neutral-500 mt-0.5">
          Don&apos;t worry! Enter your email address and we&apos;ll send you a password recovery code.
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
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <Mail className="w-4 h-4" />
          </div>
          <input
            type="email"
            placeholder="student@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs font-medium text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-[#EF5A30] focus:ring-2 focus:ring-[#EF5A30]/15 outline-none transition-all"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        className="w-full py-3.5 rounded-2xl bg-[#EF5A30] hover:bg-[#DE4920] text-white font-extrabold text-xs shadow-soft transition-all active:scale-[0.98] cursor-pointer"
      >
        Send Recovery Code
      </button>
    </div>
  );
}
