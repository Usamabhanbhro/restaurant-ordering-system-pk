import { LegalPageShell } from "@/components/legal/LegalPageShell";

export const metadata = {
  title: "Privacy Policy | QueueLess",
  description: "Privacy Policy and Data Protection Notice for QueueLess in Pakistan.",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="Privacy Policy"
      effectiveDate="Effective Date: October 2026 • Version 1.0 Draft"
      otherDocTitle="Terms of Service"
      otherDocHref="/terms"
    >
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
          <h2 className="font-bold text-sm text-neutral-900">2. What We Never Collect</h2>
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
    </LegalPageShell>
  );
}
