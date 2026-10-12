"use client";

import React from "react";
import { Shield, Check, AlertTriangle } from "lucide-react";
import CodeSlots, { type CodeSlotsStatus } from "@/components/customer/CodeSlots";

export interface AuthVerifyEmailProps {
  email: string;
  otpCode: string;
  setOtpCode: (code: string) => void;
  otpStatus: CodeSlotsStatus;
  setOtpStatus: (status: CodeSlotsStatus) => void;
  onOtpComplete: (code: string) => void;
  resendTimer: number;
  onResendCode: () => void;
  isRecoveryFlow: boolean;
  errorMessage: string;
  onSubmit: (e: React.FormEvent) => void;
}

export function AuthVerifyEmail({
  email,
  otpCode,
  setOtpCode,
  otpStatus,
  setOtpStatus,
  onOtpComplete,
  resendTimer,
  onResendCode,
  isRecoveryFlow,
  errorMessage,
  onSubmit,
}: AuthVerifyEmailProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 text-center">
      {/* 3-Step Progress Indicator: Only shown in registration flow */}
      {!isRecoveryFlow && (
        <div className="flex items-center justify-between px-1 pb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <Check className="w-3 h-3 text-white" />
            </span>
            <span className="text-xs font-bold text-neutral-800">Details</span>
          </div>
          <div className="w-8 h-0.5 bg-emerald-400" />
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#EF5A30] text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-orange-200">
              2
            </span>
            <span className="text-xs font-bold text-neutral-900">Verify</span>
          </div>
          <div className="w-8 h-0.5 bg-neutral-200" />
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-neutral-200 text-neutral-500 flex items-center justify-center text-[10px] font-bold">
              3
            </span>
            <span className="text-xs font-medium text-neutral-400">Profile</span>
          </div>
        </div>
      )}

      <div className="w-14 h-14 rounded-2xl bg-orange-100 text-[#EF5A30] flex items-center justify-center mx-auto shadow-xs">
        <Shield className="w-7 h-7" />
      </div>

      <div>
        <h3 className="font-black text-lg text-neutral-900 tracking-tight">Enter 6-Digit Code</h3>
        <p className="text-xs text-neutral-500 mt-1 max-w-[280px] mx-auto">
          We sent a verification code to{" "}
          <span className="font-bold text-neutral-800">{email || "your email"}</span>
        </p>
      </div>

      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center justify-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* React Bits CodeSlots Animated OTP Input */}
      <div className="flex items-center justify-center py-2">
        <CodeSlots
          length={6}
          status={otpStatus}
          value={otpCode}
          onChange={(code) => {
            setOtpCode(code);
            if (otpStatus !== "idle") setOtpStatus("idle");
          }}
          onComplete={onOtpComplete}
          accentColor="#1546d9"
          inkColor="#18181b"
          slotColor="#FFFBF8"
          digitColor="#18181b"
          dangerColor="#EF5A30"
          slotSize={44}
          gap={8}
          radius={12}
          bounce={0.2}
          settle={0.3}
          rise={8}
          cascade={20}
          autoFocus
          ariaLabel="6-digit verification code"
        />
      </div>

      {!isRecoveryFlow ? (
        <>
          <div className="text-xs text-neutral-500">
            {resendTimer > 0 ? (
              <p>
                Resend code in{" "}
                <span className="font-mono font-bold text-neutral-800">
                  00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}
                </span>
              </p>
            ) : (
              <button
                type="button"
                onClick={onResendCode}
                className="text-[#EF5A30] font-bold hover:underline cursor-pointer"
              >
                Resend Code Now
              </button>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-[#EF5A30] hover:bg-[#DE4920] text-white font-extrabold text-xs shadow-soft transition-all active:scale-[0.98] cursor-pointer"
          >
            Verify & Continue
          </button>
        </>
      ) : (
        <div className="text-xs text-neutral-500 py-1">
          {resendTimer > 0 ? (
            <p>
              Resend code in{" "}
              <span className="font-mono font-bold text-neutral-800">
                00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}
              </span>
            </p>
          ) : (
            <button
              type="button"
              onClick={onResendCode}
              className="text-[#EF5A30] font-bold hover:underline cursor-pointer"
            >
              Resend Code Now
            </button>
          )}
        </div>
      )}

      <p className="text-[11px] text-neutral-400">
        Code expires in 10 minutes. Check spam if not received.
      </p>
    </form>
  );
}
