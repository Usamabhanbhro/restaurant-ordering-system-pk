import { LegalPageShell } from "@/components/legal/LegalPageShell";

export const metadata = {
  title: "Terms of Service | QueueLess",
  description: "Customer Terms and Conditions for QueueLess digital ordering platform in Pakistan.",
};

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Terms of Service"
      effectiveDate="Effective Date: October 2026 • Version 1.0 Draft"
      otherDocTitle="Privacy Policy"
      otherDocHref="/privacy"
    >
      <div className="space-y-4 text-xs text-neutral-700 leading-relaxed">
        <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/70 space-y-1">
          <p className="font-bold text-neutral-900">Notice for Diners & Students</p>
          <p className="text-[11px] text-neutral-500">
            These terms govern remote pre-orders and in-venue table orders placed through QueueLess.
          </p>
        </div>

        <ol className="list-decimal list-inside space-y-3 font-medium">
          <li className="pl-1">
            <strong className="text-neutral-900">Same-Day Pickup:</strong> Orders are prepared for same-day counter pickup at the scheduled time slot within venue operating hours.
          </li>
          <li className="pl-1">
            <strong className="text-neutral-900">Direct Venue Settlement:</strong> Customers pay the venue directly through designated rail methods (Easypaisa, SadaPay, Raast, or cash). Venue staff verifies payment before order acceptance.
          </li>
          <li className="pl-1">
            <strong className="text-neutral-900">Pricing & Taxes:</strong> Menu prices are established directly by the venue. Applicable local taxes are the responsibility of the merchant.
          </li>
          <li className="pl-1">
            <strong className="text-neutral-900">Cancellation Policy:</strong> Orders can be cancelled up until the kitchen preparation start time indicated on the order ticket.
          </li>
          <li className="pl-1">
            <strong className="text-neutral-900">30-Minute Hold & No-Show:</strong> Counter pickup orders are held for a maximum of 30 minutes following the pickup slot. Orders unclaimed past 30 minutes are marked as no-show and are non-refundable.
          </li>
          <li className="pl-1">
            <strong className="text-neutral-900">Payment Verification:</strong> If payment proof cannot be matched or verified, orders will not be dispatched. Repeated unconfirmed payments may lead to account ordering restrictions.
          </li>
          <li className="pl-1">
            <strong className="text-neutral-900">Order Issues:</strong> Food preparation quality, order modifications, and physical refunds are handled directly by the venue staff.
          </li>
        </ol>
      </div>
    </LegalPageShell>
  );
}
