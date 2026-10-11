import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | QueueLess",
  description: "Privacy Policy and Data Protection Notice for QueueLess in Pakistan.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF8] text-neutral-900 flex justify-center py-6 px-4">
      <main className="w-full max-w-lg bg-white rounded-3xl border border-neutral-200/80 shadow-soft p-6 sm:p-8 space-y-6 self-start">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <Link
            href="/brewery-gulberg"
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-neutral-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Venue</span>
          </Link>
          <span className="text-xs font-extrabold tracking-tight text-neutral-900">
            Queue<span className="text-[#fd8535]">Less</span>
          </span>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-[#1546d9] text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Data Protection Notice</span>
          </div>
          <h1 className="text-2xl font-black text-neutral-950 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-neutral-500">
            Effective Date: October 2026 • Version 1.0 Draft
          </p>
        </div>

        <div className="space-y-4 text-xs text-neutral-700 leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/70 space-y-1">
            <p className="font-bold text-neutral-900">Customer Data Safeguards</p>
            <p className="text-[11px] text-neutral-500">
              QueueLess collects only operational data required for processing meal orders and maintaining account security under Pakistani legal compliance (PECA 2016).
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-bold text-sm text-neutral-900">1. Information We Collect</h2>
            <ul className="list-disc list-inside space-y-1.5 font-medium pl-1">
              <li>
                <strong className="text-neutral-900">Verified Email:</strong> Used for order receipts, password recovery, and student affiliation validation.
              </li>
              <li>
                <strong className="text-neutral-900">Pakistani Mobile Number:</strong> Required for account verification and counter callouts (+923XXXXXXXXX format).
              </li>
              <li>
                <strong className="text-neutral-900">Display Name:</strong> Stored to identify orders on the venue kitchen display (KDS).
              </li>
              <li>
                <strong className="text-neutral-900">Transaction Identification:</strong> Transaction IDs and optional payment screenshot proof for remote order verification. Payment screenshots are automatically purged after 30 days.
              </li>
              <li>
                <strong className="text-neutral-900">Dietary & Kitchen Notes:</strong> Customer-provided preferences for meal customization.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-bold text-sm text-neutral-900">2. What We Do Not Collect</h2>
            <ul className="list-disc list-inside space-y-1.5 font-medium pl-1">
              <li>No banking passwords, card PINs, or wallet OTPs are ever requested or stored.</li>
              <li>Customer passwords are stored only as irreversible cryptographic hashes (Argon2id).</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-bold text-sm text-neutral-900">3. Data Retention</h2>
            <p className="font-medium">
              Order history and audit event logs are retained securely per venue partner requirements. Payment verification screenshots are permanently deleted 30 days following pickup.
            </p>
          </div>
        </div>

        <div className="border-t border-neutral-100 pt-4 flex items-center justify-between text-[11px] text-neutral-400 font-medium">
          <span>QueueLess Pakistan</span>
          <Link href="/terms" className="text-[#fd8535] hover:underline font-semibold">
            Terms of Service
          </Link>
        </div>
      </main>
    </div>
  );
}
