"use client";

import React, { useState } from "react";
import { Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";

export interface AuthResetPasswordProps {
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  errorMessage: string;
  onSubmit: (e: React.FormEvent) => void;
}

export function AuthResetPassword({
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  errorMessage,
  onSubmit,
}: AuthResetPasswordProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <h3 className="font-black text-lg text-neutral-900 tracking-tight">Set New Password</h3>
        <p className="text-xs text-neutral-500 mt-0.5">
          Enter your new password to regain access to your account.
        </p>
      </div>

      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wide">
            New Password
          </label>
          <span className="text-[10px] text-neutral-400">Min. 8 characters</span>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
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

      <div className="space-y-1">
        <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wide">
          Confirm New Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs font-medium text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-[#EF5A30] focus:ring-2 focus:ring-[#EF5A30]/15 outline-none transition-all"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3.5 rounded-2xl bg-[#EF5A30] hover:bg-[#DE4920] text-white font-extrabold text-xs shadow-soft transition-all active:scale-[0.98] mt-2 cursor-pointer"
      >
        Save New Password & Sign In
      </button>
    </form>
  );
}
