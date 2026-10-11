"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface LegalPageShellProps {
  title: string;
  effectiveDate?: string;
  otherDocTitle: string;
  otherDocHref: string;
  children: ReactNode;
}

export function LegalPageShell({
  title,
  effectiveDate = "Effective Date: October 2026 • Version 1.0 Draft",
  otherDocTitle,
  otherDocHref,
  children,
}: LegalPageShellProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/brewery-gulberg");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF8] text-neutral-900 flex justify-center py-6 px-4">
      <main className="w-full max-w-lg bg-white rounded-3xl border border-neutral-200/80 shadow-soft p-6 sm:p-8 space-y-6 self-start">
        {/* Header with back arrow only and brand mark */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Back"
            className="w-9 h-9 rounded-full border border-neutral-200/80 bg-white hover:bg-neutral-50 active:scale-95 flex items-center justify-center text-neutral-700 transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-extrabold tracking-tight text-neutral-900">
            Queue<span className="text-[#fd8535]">Less</span>
          </span>
        </div>

        {/* Title area (extra notice block dropped per feedback) */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-neutral-950 tracking-tight">
            {title}
          </h1>
          <p className="text-xs text-neutral-500">{effectiveDate}</p>
        </div>

        {/* Document Body */}
        {children}

        {/* Footer */}
        <div className="border-t border-neutral-100 pt-4 flex items-center justify-between text-[11px] text-neutral-400 font-medium">
          <span>QueueLess Pakistan</span>
          <Link href={otherDocHref} className="text-[#fd8535] hover:underline font-semibold">
            {otherDocTitle}
          </Link>
        </div>
      </main>
    </div>
  );
}
