"use client";

import React, { useState, useEffect } from "react";
import { Drawer } from "vaul";
import { ArrowLeft } from "lucide-react";
import { useAuthStore, type UserProfile } from "@/lib/store/authStore";
import { CustomerLoginSchema, CustomerRegisterSchema } from "@queueless/types";
import { apiClient } from "@/lib/api";
import type { CodeSlotsStatus } from "@/components/customer/CodeSlots";
import {
  AuthWelcome,
  AuthLogin,
  AuthRegister,
  AuthVerifyEmail,
  AuthOnboarding,
  AuthForgotPassword,
  AuthResetPassword,
} from "./auth";

interface CustomerAuthSheetProps {
  onAuthSuccess?: (user: UserProfile) => void;
}

export function CustomerAuthSheet({ onAuthSuccess }: CustomerAuthSheetProps) {
  const { authModal, setAuthModal, setCurrentUser, setPendingPostAuthAction } =
    useAuthStore();

  const [mode, setMode] = useState(authModal !== "NONE" ? authModal : "WELCOME");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [affiliation, setAffiliation] = useState("FAST-NUCES");
  const [rememberMe, setRememberMe] = useState(true);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resendTimer, setResendTimer] = useState(59);
  const [otpCode, setOtpCode] = useState("");
  const [otpStatus, setOtpStatus] = useState<CodeSlotsStatus>("idle");
  const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync mode with global modal state
  useEffect(() => {
    if (authModal !== "NONE") {
      setMode(authModal);
      setErrorMessage("");
      if (authModal === "FORGOT_PASSWORD") {
        setIsRecoveryFlow(true);
      } else if (authModal === "REGISTER" || authModal === "LOGIN") {
        setIsRecoveryFlow(false);
      }
    }
  }, [authModal]);

  // Resend OTP Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mode === "VERIFY_EMAIL" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, resendTimer]);

  const handleClose = () => {
    setAuthModal("NONE");
    setPendingPostAuthAction(null);
  };

  const completeLogin = (user: UserProfile) => {
    setCurrentUser(user);
    if (onAuthSuccess) {
      onAuthSuccess(user);
    }
    handleClose();
  };

  const handleGoogleSignIn = () => {
    completeLogin({
      name: "Ahmad Ali",
      email: "ahmad.ali@nu.edu.pk",
      phone: "+92 300 1234567",
      affiliation: "FAST-NUCES",
      badge: "Student",
      isVerified: true,
    });
  };

  const handleFacebookSignIn = () => {
    completeLogin({
      name: "Zainab Fatima",
      email: "zainab@lums.edu.pk",
      phone: "+92 321 9876543",
      affiliation: "LUMS",
      badge: "Student",
      isVerified: true,
    });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const validation = CustomerLoginSchema.safeParse({ email: email.trim(), password });
    if (!validation.success) {
      setErrorMessage(validation.error.errors[0]?.message || "Invalid login credentials.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { profile } = await apiClient.loginCustomer(validation.data);
      const isAffiliated = Boolean(profile.affiliation && profile.affiliation !== "None");
      completeLogin({
        name: profile.displayName || "Ahmad Ali",
        email: profile.email,
        phone: profile.phone,
        affiliation: isAffiliated ? profile.affiliation || undefined : undefined,
        badge: isAffiliated ? "Student" : "Diner",
        isVerified: profile.emailVerified,
        dietaryNotes: profile.dietaryNotes,
      });
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to log in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!termsAgreed) {
      setErrorMessage("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    const normalizedPhone = phone.trim().replace(/[\s-]/g, "");
    const formattedPhone = normalizedPhone.startsWith("+92")
      ? normalizedPhone
      : normalizedPhone.startsWith("0")
      ? `+92${normalizedPhone.slice(1)}`
      : `+92${normalizedPhone}`;

    const validation = CustomerRegisterSchema.safeParse({
      email: email.trim(),
      phone: formattedPhone,
      password,
      displayName: displayName.trim() || undefined,
    });

    if (!validation.success) {
      setErrorMessage(validation.error.errors[0]?.message || "Invalid registration details.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.registerCustomer(validation.data);
      setPhone(formattedPhone);
      setIsRecoveryFlow(false);
      setResendTimer(59);
      setOtpCode("");
      setOtpStatus("idle");
      setMode("VERIFY_EMAIL");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpComplete = (code: string) => {
    setErrorMessage("");
    setOtpStatus("success");
    setTimeout(() => {
      if (isRecoveryFlow) {
        setMode("RESET_PASSWORD");
      } else {
        setMode("ONBOARDING");
      }
    }, 600);
  };

  const handleVerifyEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      setOtpStatus("error");
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }
    handleOtpComplete(otpCode);
  };

  const handleForgotPasswordSubmit = () => {
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    setIsRecoveryFlow(true);
    setResendTimer(59);
    setOtpCode("");
    setOtpStatus("idle");
    setMode("VERIFY_EMAIL");
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!newPassword || newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    const isAffiliated = Boolean(affiliation && affiliation !== "None" && affiliation.trim().length > 0);
    completeLogin({
      name: displayName.trim() || "Ahmad Ali",
      email: email.trim() || "student@nu.edu.pk",
      phone: phone || "+92 300 1234567",
      affiliation: isAffiliated ? affiliation : undefined,
      badge: isAffiliated ? "Student" : "Diner",
      isVerified: true,
    });
  };

  const handleCompleteOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMessage("Please enter your name or nickname for the counter pickup callout.");
      return;
    }

    const isAffiliated = Boolean(affiliation && affiliation !== "None" && affiliation.trim().length > 0);
    completeLogin({
      name: displayName.trim(),
      email: email.trim() || "student@nu.edu.pk",
      phone: phone.startsWith("+92") ? phone : `+92 ${phone.replace(/^0/, "")}`,
      affiliation: isAffiliated ? affiliation : undefined,
      badge: isAffiliated ? "Student" : "Diner",
      isVerified: true,
    });
  };

  const isOpen = authModal !== "NONE";

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Drawer.Content className="fixed bottom-0 inset-x-0 z-50 max-w-md mx-auto max-h-[92vh] bg-white rounded-t-[2.5rem] shadow-float overflow-hidden flex flex-col focus:outline-none">
          {/* iOS Handle */}
          <div className="pt-3 pb-1 flex justify-center shrink-0">
            <div className="w-12 h-1.5 rounded-full bg-neutral-300" />
          </div>

          {/* Top Bar with Brand & Back Navigation */}
          <div className="px-5 py-2.5 flex items-center justify-between border-b border-neutral-100 shrink-0">
            {mode !== "WELCOME" ? (
              <button
                type="button"
                onClick={() => {
                  setErrorMessage("");
                  if (mode === "VERIFY_EMAIL") setMode(isRecoveryFlow ? "FORGOT_PASSWORD" : "REGISTER");
                  else if (mode === "RESET_PASSWORD") setMode("VERIFY_EMAIL");
                  else if (mode === "ONBOARDING") setMode("VERIFY_EMAIL");
                  else if (mode === "FORGOT_PASSWORD") setMode("LOGIN");
                  else setMode("WELCOME");
                }}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-8" />
            )}

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#fd8535] p-1 flex items-center justify-center text-white shadow-xs">
                <svg viewBox="0 0 800 800" className="w-full h-full fill-white" aria-hidden="true">
                  <g fill="#FFFFFF" fillRule="evenodd">
                    <path d="M 235 285 C 310 290, 410 265, 545 220 L 495 265 C 415 275, 320 295, 235 285 Z" />
                    <path d="M 195 348 C 285 352, 420 325, 595 272 L 535 325 C 425 338, 305 362, 195 348 Z" />
                    <path d="M 205 435 C 275 425, 470 380, 615 330 C 570 470, 470 545, 345 545 C 260 545, 215 500, 205 435 Z M 245 448 C 255 485, 290 512, 350 512 C 435 512, 515 460, 560 365 C 445 405, 300 440, 245 448 Z" />
                  </g>
                </svg>
              </div>
              <span className="font-extrabold text-sm text-neutral-900 tracking-tight">
                Queue<span className="text-[#fd8535]">Less</span>
              </span>
            </div>

            <div className="w-8" />
          </div>

          {/* Scrollable Body: Renders Active Auth Mode */}
          <div className="p-5 overflow-y-auto no-scrollbar space-y-4 flex-1">
            {mode === "WELCOME" && (
              <AuthWelcome
                onGoogleSignIn={handleGoogleSignIn}
                onFacebookSignIn={handleFacebookSignIn}
                onCreateAccount={() => {
                  setErrorMessage("");
                  setMode("REGISTER");
                }}
                onSignIn={() => {
                  setErrorMessage("");
                  setMode("LOGIN");
                }}
                onGuestBrowse={handleClose}
              />
            )}

            {mode === "LOGIN" && (
              <AuthLogin
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                rememberMe={rememberMe}
                setRememberMe={setRememberMe}
                errorMessage={errorMessage}
                isSubmitting={isSubmitting}
                onGoogleSignIn={handleGoogleSignIn}
                onFacebookSignIn={handleFacebookSignIn}
                onForgotPassword={() => {
                  setErrorMessage("");
                  setMode("FORGOT_PASSWORD");
                }}
                onCreateAccount={() => {
                  setErrorMessage("");
                  setMode("REGISTER");
                }}
                onSubmit={handleLoginSubmit}
              />
            )}

            {mode === "REGISTER" && (
              <AuthRegister
                email={email}
                setEmail={setEmail}
                phone={phone}
                setPhone={setPhone}
                password={password}
                setPassword={setPassword}
                termsAgreed={termsAgreed}
                setTermsAgreed={setTermsAgreed}
                errorMessage={errorMessage}
                isSubmitting={isSubmitting}
                onSignIn={() => {
                  setErrorMessage("");
                  setMode("LOGIN");
                }}
                onSubmit={handleRegisterSubmit}
              />
            )}

            {mode === "VERIFY_EMAIL" && (
              <AuthVerifyEmail
                email={email}
                otpCode={otpCode}
                setOtpCode={setOtpCode}
                otpStatus={otpStatus}
                setOtpStatus={setOtpStatus}
                onOtpComplete={handleOtpComplete}
                resendTimer={resendTimer}
                onResendCode={() => {
                  setResendTimer(59);
                  setOtpCode("");
                  setOtpStatus("idle");
                }}
                isRecoveryFlow={isRecoveryFlow}
                errorMessage={errorMessage}
                onSubmit={handleVerifyEmailSubmit}
              />
            )}

            {mode === "ONBOARDING" && (
              <AuthOnboarding
                displayName={displayName}
                setDisplayName={setDisplayName}
                affiliation={affiliation}
                setAffiliation={setAffiliation}
                errorMessage={errorMessage}
                onSubmit={handleCompleteOnboarding}
              />
            )}

            {mode === "FORGOT_PASSWORD" && (
              <AuthForgotPassword
                email={email}
                setEmail={setEmail}
                errorMessage={errorMessage}
                onSubmit={handleForgotPasswordSubmit}
              />
            )}

            {mode === "RESET_PASSWORD" && (
              <AuthResetPassword
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                errorMessage={errorMessage}
                onSubmit={handleResetPasswordSubmit}
              />
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
