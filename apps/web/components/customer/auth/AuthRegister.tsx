"use client";

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, AlertTriangle, ArrowRight } from "lucide-react";

export interface AuthRegisterProps {
  email: string;
  setEmail: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  termsAgreed: boolean;
  setTermsAgreed: (val: boolean) => void;
  errorMessage: string;
  isSubmitting: boolean;
  onSignIn: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AuthRegister({
  email,
  setEmail,
  phone,
  setPhone,
  password,
  setPassword,
  termsAgreed,
  setTermsAgreed,
  errorMessage,
  isSubmitting,
  onSignIn,
  onSubmit,
}: AuthRegisterProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* 3-Step Progress Indicator */}
      <div className="flex items-center justify-between px-1 pb-1">
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-[#EF5A30] text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-orange-200">
            1
          </span>
          <span className="text-xs font-bold text-neutral-900">Details</span>
        </div>
        <div className="w-8 h-0.5 bg-neutral-200" />
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-neutral-200 text-neutral-500 flex items-center justify-center text-[10px] font-bold">
            2
          </span>
          <span className="text-xs font-medium text-neutral-400">Verify</span>
        </div>
        <div className="w-8 h-0.5 bg-neutral-200" />
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-neutral-200 text-neutral-500 flex items-center justify-center text-[10px] font-bold">
            3
          </span>
          <span className="text-xs font-medium text-neutral-400">Profile</span>
        </div>
      </div>

      <div>
        <h3 className="font-black text-lg text-neutral-900 tracking-tight">Create your account</h3>
        <p className="text-xs text-neutral-500 mt-0.5">Fast-casual remote pre-ordering in Pakistan</p>
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
            placeholder="student@nu.edu.pk or gmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs font-medium text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-[#EF5A30] focus:ring-2 focus:ring-[#EF5A30]/15 outline-none transition-all"
          />
        </div>
      </div>

      {/* Pakistani Mobile Phone Pill (Mandatory +92) */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wide">
          Pakistani Mobile Phone *
        </label>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 px-3 py-3 rounded-2xl bg-neutral-100 border border-neutral-200 text-xs font-extrabold text-neutral-700 shrink-0">
            <span className="w-3.5 h-2.5 rounded-xs bg-emerald-700 border border-neutral-300 inline-block" />
            <span>+92</span>
          </div>
          <input
            type="tel"
            placeholder="300 1234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1 px-4 py-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs font-medium text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-[#EF5A30] focus:ring-2 focus:ring-[#EF5A30]/15 outline-none transition-all"
          />
        </div>
        <p className="text-[10px] text-neutral-400 pl-1">
          Required for pickup coordination if items are 86&apos;d
        </p>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wide">
            Password
          </label>
          <span className="text-[10px] text-neutral-400">Min. 8 characters</span>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Create strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs font-medium text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-[#EF5A30] focus:ring-2 focus:ring-[#EF5A30]/15 outline-none transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700 cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="pt-1">
        <label className="flex items-start gap-2 text-xs text-neutral-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={termsAgreed}
            onChange={(e) => setTermsAgreed(e.target.checked)}
            className="mt-0.5 rounded border-neutral-300 text-[#EF5A30] focus:ring-[#EF5A30]"
          />
          <span className="text-[11px] leading-tight">
            I agree to the <span className="font-bold text-neutral-800">Terms of Service</span> and{" "}
            <span className="font-bold text-neutral-800">Privacy Policy</span>.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-3.5 rounded-2xl text-white font-extrabold text-xs shadow-soft transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2 cursor-pointer ${
          isSubmitting ? "bg-neutral-400 cursor-not-allowed" : "bg-[#EF5A30] hover:bg-[#DE4920]"
        }`}
      >
        <span>{isSubmitting ? "Registering..." : "Continue to Verification"}</span>
        {!isSubmitting && <ArrowRight className="w-3.5 h-3.5" />}
      </button>

      <p className="text-center text-xs text-neutral-500 pt-1">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSignIn}
          className="text-[#EF5A30] font-extrabold hover:underline cursor-pointer"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
