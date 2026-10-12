"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { GoogleIcon, FacebookIcon } from "./authIcons";

export interface AuthWelcomeProps {
  onGoogleSignIn: () => void;
  onFacebookSignIn: () => void;
  onCreateAccount: () => void;
  onSignIn: () => void;
  onGuestBrowse: () => void;
}

export function AuthWelcome({
  onGoogleSignIn,
  onFacebookSignIn,
  onCreateAccount,
  onSignIn,
  onGuestBrowse,
}: AuthWelcomeProps) {
  return (
    <div className="space-y-4">
      <div className="text-center pt-3 pb-2 space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#fd8535] to-[#e0681c] p-2.5 text-white flex items-center justify-center mx-auto shadow-md shadow-orange-950/20">
          <svg viewBox="0 0 800 800" className="w-full h-full fill-white" aria-hidden="true">
            <g fill="#FFFFFF" fillRule="evenodd">
              <path d="M 235 285 C 310 290, 410 265, 545 220 L 495 265 C 415 275, 320 295, 235 285 Z" />
              <path d="M 195 348 C 285 352, 420 325, 595 272 L 535 325 C 425 338, 305 362, 195 348 Z" />
              <path d="M 205 435 C 275 425, 470 380, 615 330 C 570 470, 470 545, 345 545 C 260 545, 215 500, 205 435 Z M 245 448 C 255 485, 290 512, 350 512 C 435 512, 515 460, 560 365 C 445 405, 300 440, 245 448 Z" />
            </g>
          </svg>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={onGoogleSignIn}
          className="w-full py-3.5 px-4 rounded-2xl bg-white border border-neutral-200/90 hover:bg-neutral-50 text-neutral-800 font-bold text-xs flex items-center justify-center gap-3 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <GoogleIcon className="w-4 h-4 shrink-0" />
          <span>Continue with Google</span>
        </button>

        <button
          type="button"
          onClick={onFacebookSignIn}
          className="w-full py-3.5 px-4 rounded-2xl bg-white border border-neutral-200/90 hover:bg-neutral-50 text-neutral-800 font-bold text-xs flex items-center justify-center gap-3 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <FacebookIcon className="w-4 h-4 shrink-0" />
          <span>Continue with Facebook</span>
        </button>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-neutral-200" />
          <span className="flex-shrink mx-3 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
            or with account
          </span>
          <div className="flex-grow border-t border-neutral-200" />
        </div>

        <button
          type="button"
          onClick={onCreateAccount}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#EF5A30] hover:bg-[#DE4920] text-white font-extrabold text-xs shadow-soft transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Create an Account</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onSignIn}
          className="w-full py-3.5 px-4 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          Sign In to Existing Account
        </button>
      </div>

      <div className="text-center pt-1">
        <button
          type="button"
          onClick={onGuestBrowse}
          className="text-xs text-neutral-400 hover:text-neutral-700 font-semibold transition-colors cursor-pointer"
        >
          Continue as Guest (Browse Menu)
        </button>
      </div>
    </div>
  );
}
