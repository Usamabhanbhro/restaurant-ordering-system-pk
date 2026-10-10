"use client";

import { use } from "react";
import { CustomerOrderingView } from "@/components/customer/CustomerOrderingView";

interface TableOrderPageProps {
  params: Promise<{
    tenantSlug: string;
    zoneSlug: string;
    tableNumber: string;
  }>;
}

export default function TableOrderPage({ params }: TableOrderPageProps) {
  // Unwrap Next.js 15 params Promise using React 19 `use` hook
  const { tenantSlug, zoneSlug, tableNumber } = use(params);

  // Format zone slug into human-readable label, e.g. "indoor-main" -> "Indoor Main"
  const formattedZoneName = zoneSlug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <CustomerOrderingView
      tenantSlug={tenantSlug}
      initialMode="IN_VENUE"
      tableContext={{
        zoneSlug,
        tableNumber,
        zoneName: formattedZoneName,
      }}
    />
  );
}
