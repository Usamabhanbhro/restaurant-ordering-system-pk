"use client";

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { GoogleIcon, FacebookIcon } from "./authIcons";

export interface AuthLoginProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  rememberMe: boolean;
  setRememberMe: (val: boolean) => void;
  errorMessage: string;
  isSubmitting: boolean;
  onGoogleSignIn: () => void;
  onFacebookSignIn: () => void;
  onForgotPassword: () => void;
  onCreateAccount: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AuthLogin({
  email,
  setEmail,
  password,
  setPassword,
  rememberMe,
  setRememberMe,
  errorMessage,
  isSubmitting,
  onGoogleSignIn,
  onFacebookSignIn,
  onForgotPassword,
  onCreateAccount,
  onSubmit,
}: AuthLoginProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <h3 className="font-black text-lg text-neutral-900 tracking-tight">Welcome back</h3>
        <p className="text-xs text-neutral-500 mt-0.5">Please sign in to your QueueLess account</p>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={onGoogleSignIn}
          className="w-full py-3 px-4 rounded-2xl bg-white border border-neutral-200/90 hover:bg-neutral-50 text-neutral-800 font-bold text-xs flex items-center justify-center gap-3 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <GoogleIcon className="w-4 h-4 shrink-0" />
          <span>Continue with Google</span>
        </button>

        <button
          type="button"
          onClick={onFacebookSignIn}
          className="w-full py-3 px-4 rounded-2xl bg-white border border-neutral-200/90 hover:bg-neutral-50 text-neutral-800 font-bold text-xs flex items-center justify-center gap-3 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <FacebookIcon className="w-4 h-4 shrink-0" />
          <span>Continue with Facebook</span>
        </button>
      </div>

      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-neutral-200" />
        <span className="flex-shrink mx-3 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
          or sign in with password
        </span>
        <div className="flex-grow border-t border-neutral-200" />
      </div>

      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-1">
        <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wide">
          Email or Mobile Number
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <Mail className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="student@nu.edu.pk or 03001234567"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs font-medium text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-[#EF5A30] focus:ring-2 focus:ring-[#EF5A30]/15 outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wide">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
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

      <div className="flex items-center justify-between text-xs pt-0.5">
        <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-600">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded border-neutral-300 text-[#EF5A30] focus:ring-[#EF5A30]"
          />
          <span>Remember me</span>
        </label>
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-[#EF5A30] hover:underline font-bold cursor-pointer"
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-3.5 rounded-2xl text-white font-extrabold text-xs shadow-soft transition-all active:scale-[0.98] mt-2 cursor-pointer ${
          isSubmitting ? "bg-neutral-400 cursor-not-allowed" : "bg-[#EF5A30] hover:bg-[#DE4920]"
        }`}
      >
        {isSubmitting ? "Signing in..." : "Sign In"}
      </button>

      <p className="text-center text-xs text-neutral-500 pt-1">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={onCreateAccount}
          className="text-[#EF5A30] font-extrabold hover:underline cursor-pointer"
        >
          Create one
        </button>
      </p>
    </form>
  );
}
