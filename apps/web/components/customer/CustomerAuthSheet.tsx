"use client";

import { useState, useEffect } from "react";
import { Drawer } from "vaul";
import {
  ArrowLeft,
  X,
  Zap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  Shield,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { useAuthStore, type UserProfile } from "@/lib/store/authStore";

// Google Vector SVG Icon
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.34 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.97 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

// Facebook Vector SVG Icon
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#1877F2" className={className} aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

interface CustomerAuthSheetProps {
  onAuthSuccess?: (user: UserProfile) => void;
}

export function CustomerAuthSheet({ onAuthSuccess }: CustomerAuthSheetProps) {
  const { authModal, setAuthModal, setCurrentUser, pendingPostAuthAction, setPendingPostAuthAction } =
    useAuthStore();

  const [mode, setMode] = useState(authModal !== "NONE" ? authModal : "WELCOME");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [affiliation, setAffiliation] = useState("FAST-NUCES");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resendTimer, setResendTimer] = useState(59);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);

  // Sync mode with global modal state
  useEffect(() => {
    if (authModal !== "NONE") {
      setMode(authModal);
      setErrorMessage("");
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
      badge: "Verified Student",
      isVerified: true,
    });
  };

  const handleFacebookSignIn = () => {
    completeLogin({
      name: "Zainab Fatima",
      email: "zainab@lums.edu.pk",
      phone: "+92 321 9876543",
      affiliation: "LUMS",
      badge: "Verified Student",
      isVerified: true,
    });
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your email or mobile number.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    completeLogin({
      name: "Ahmad Ali",
      email: email.includes("@") ? email : "student@nu.edu.pk",
      phone: email.includes("@") ? "+92 300 1234567" : email,
      affiliation: "FAST-NUCES",
      badge: "Verified Student",
      isVerified: true,
    });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!phone.trim()) {
      setErrorMessage("Please enter your Pakistani mobile number.");
      return;
    }
    if (!password || password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }
    if (!termsAgreed) {
      setErrorMessage("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setResendTimer(59);
    setOtpDigits(["", "", "", "", "", ""]);
    setMode("VERIFY_EMAIL");
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split("");
      const nextDigits = [...otpDigits];
      pasted.forEach((char, i) => {
        if (i < 6) nextDigits[i] = char;
      });
      setOtpDigits(nextDigits);
      return;
    }

    const nextDigits = [...otpDigits];
    nextDigits[index] = value;
    setOtpDigits(nextDigits);

    if (value && index < 5) {
      const nextInput = document.getElementById(`web-otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`web-otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length < 4) {
      setErrorMessage("Please enter the verification code sent to your email.");
      return;
    }
    setMode("ONBOARDING");
  };

  const handleCompleteOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMessage("Please enter your name or nickname for the counter pickup callout.");
      return;
    }

    completeLogin({
      name: displayName.trim(),
      email: email.trim() || "student@nu.edu.pk",
      phone: phone.startsWith("+92") ? phone : `+92 ${phone.replace(/^0/, "")}`,
      affiliation: affiliation === "None" ? "" : affiliation,
      badge: affiliation !== "None" ? "Student" : "Diner",
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

          {/* Top Bar with Brand & Close */}
          <div className="px-5 py-2.5 flex items-center justify-between border-b border-neutral-100 shrink-0">
            {mode !== "WELCOME" ? (
              <button
                type="button"
                onClick={() => {
                  setErrorMessage("");
                  if (mode === "VERIFY_EMAIL") setMode("REGISTER");
                  else if (mode === "ONBOARDING") setMode("VERIFY_EMAIL");
                  else if (mode === "FORGOT_PASSWORD") setMode("LOGIN");
                  else setMode("WELCOME");
                }}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-8" />
            )}

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#EF5A30] flex items-center justify-center text-white shadow-xs">
                <Zap className="w-3.5 h-3.5 fill-white" />
              </div>
              <span className="font-extrabold text-sm text-neutral-900 tracking-tight">
                Queue<span className="text-[#EF5A30]">Less</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-5 overflow-y-auto no-scrollbar space-y-4 flex-1">
            {/* 1. WELCOME MODE */}
            {mode === "WELCOME" && (
              <div className="space-y-4">
                <div className="text-center pt-3 pb-2 space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6B42] to-[#EF5A30] text-white flex items-center justify-center mx-auto shadow-md shadow-orange-950/20">
                    <Zap className="w-7 h-7 fill-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-neutral-900 tracking-tight">
                      Welcome to Queue<span className="text-[#EF5A30]">Less</span>
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 max-w-[280px] mx-auto leading-relaxed">
                      Pre-order meals, skip counter lines, and pick up fresh at your scheduled slot.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full py-3.5 px-4 rounded-2xl bg-white border border-neutral-200/90 hover:bg-neutral-50 text-neutral-800 font-bold text-xs flex items-center justify-center gap-3 shadow-xs transition-all active:scale-[0.98]"
                  >
                    <GoogleIcon className="w-4 h-4 shrink-0" />
                    <span>Continue with Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFacebookSignIn}
                    className="w-full py-3.5 px-4 rounded-2xl bg-white border border-neutral-200/90 hover:bg-neutral-50 text-neutral-800 font-bold text-xs flex items-center justify-center gap-3 shadow-xs transition-all active:scale-[0.98]"
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
                    onClick={() => {
                      setErrorMessage("");
                      setMode("REGISTER");
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#EF5A30] hover:bg-[#DE4920] text-white font-extrabold text-xs shadow-soft transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <span>Create an Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage("");
                      setMode("LOGIN");
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs transition-all active:scale-[0.98]"
                  >
                    Sign In to Existing Account
                  </button>
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-xs text-neutral-400 hover:text-neutral-700 font-semibold transition-colors"
                  >
                    Continue as Guest (Browse Menu)
                  </button>
                </div>
              </div>
            )}

            {/* 2. LOGIN MODE */}
            {mode === "LOGIN" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <h3 className="font-black text-lg text-neutral-900 tracking-tight">Welcome back</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Please sign in to your QueueLess account</p>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full py-3 px-4 rounded-2xl bg-white border border-neutral-200/90 hover:bg-neutral-50 text-neutral-800 font-bold text-xs flex items-center justify-center gap-3 shadow-xs transition-all active:scale-[0.98]"
                  >
                    <GoogleIcon className="w-4 h-4 shrink-0" />
                    <span>Continue with Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFacebookSignIn}
                    className="w-full py-3 px-4 rounded-2xl bg-white border border-neutral-200/90 hover:bg-neutral-50 text-neutral-800 font-bold text-xs flex items-center justify-center gap-3 shadow-xs transition-all active:scale-[0.98]"
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
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700"
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
                    onClick={() => {
                      setErrorMessage("");
                      setMode("FORGOT_PASSWORD");
                    }}
                    className="text-[#EF5A30] hover:underline font-bold"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#EF5A30] hover:bg-[#DE4920] text-white font-extrabold text-xs shadow-soft transition-all active:scale-[0.98] mt-2"
                >
                  Sign In
                </button>

                <p className="text-center text-xs text-neutral-500 pt-1">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage("");
                      setMode("REGISTER");
                    }}
                    className="text-[#EF5A30] font-extrabold hover:underline"
                  >
                    Create one
                  </button>
                </p>
              </form>
            )}

            {/* 3. REGISTER MODE */}
            {mode === "REGISTER" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
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
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700"
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
                  className="w-full py-3.5 rounded-2xl bg-[#EF5A30] hover:bg-[#DE4920] text-white font-extrabold text-xs shadow-soft transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
                >
                  <span>Continue to Verification</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <p className="text-center text-xs text-neutral-500 pt-1">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage("");
                      setMode("LOGIN");
                    }}
                    className="text-[#EF5A30] font-extrabold hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            )}

            {/* 4. VERIFY EMAIL (6-Digit OTP) */}
            {mode === "VERIFY_EMAIL" && (
              <form onSubmit={handleVerifyEmail} className="space-y-4 text-center">
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

                <div className="w-14 h-14 rounded-2xl bg-orange-100 text-[#EF5A30] flex items-center justify-center mx-auto shadow-xs">
                  <Shield className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="font-black text-lg text-neutral-900 tracking-tight">Enter 6-Digit Code</h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-[280px] mx-auto">
                    We sent an email verification code to{" "}
                    <span className="font-bold text-neutral-800">{email || "your email"}</span>
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center justify-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 py-2">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      id={`web-otp-input-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`w-11 h-14 text-center text-lg font-black rounded-2xl border transition-all outline-none ${
                        digit
                          ? "bg-white border-[#EF5A30] text-[#EF5A30] shadow-sm"
                          : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:bg-white focus:border-[#EF5A30] focus:ring-2 focus:ring-[#EF5A30]/20"
                      }`}
                    />
                  ))}
                </div>

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
                      onClick={() => {
                        setResendTimer(59);
                      }}
                      className="text-[#EF5A30] font-bold hover:underline"
                    >
                      Resend Code Now
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#EF5A30] hover:bg-[#DE4920] text-white font-extrabold text-xs shadow-soft transition-all active:scale-[0.98]"
                >
                  Verify & Continue
                </button>

                <p className="text-[11px] text-neutral-400">
                  Code expires in 10 minutes. Check spam if not received.
                </p>
              </form>
            )}

            {/* 5. ONBOARDING MODE (Display Name & Affiliation) */}
            {mode === "ONBOARDING" && (
              <form onSubmit={handleCompleteOnboarding} className="space-y-4">
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
                    {["FAST-NUCES", "LUMS", "IBA", "NUST", "SZABIST", "None"].map((aff) => (
                      <button
                        key={aff}
                        type="button"
                        onClick={() => setAffiliation(aff)}
                        className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition-all ${
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
                  className="w-full py-3.5 rounded-2xl bg-[#EF5A30] hover:bg-[#DE4920] text-white font-extrabold text-xs shadow-soft transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
                >
                  <span>Complete Setup & Start Ordering</span>
                </button>
              </form>
            )}

            {/* 6. FORGOT PASSWORD */}
            {mode === "FORGOT_PASSWORD" && (
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
                  onClick={() => {
                    if (!email || !email.includes("@")) {
                      setErrorMessage("Please enter a valid email address.");
                      return;
                    }
                    setResendTimer(59);
                    setMode("VERIFY_EMAIL");
                  }}
                  className="w-full py-3.5 rounded-2xl bg-[#EF5A30] hover:bg-[#DE4920] text-white font-extrabold text-xs shadow-soft transition-all active:scale-[0.98]"
                >
                  Send Recovery Code
                </button>
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
