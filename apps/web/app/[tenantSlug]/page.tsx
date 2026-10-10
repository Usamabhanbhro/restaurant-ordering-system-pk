"use client";

import { use } from "react";
import { CustomerOrderingView } from "@/components/customer/CustomerOrderingView";

interface CustomerPageProps {
  params: Promise<{ tenantSlug: string }>;
  searchParams?: Promise<{ mode?: string; zone?: string; table?: string }>;
}

export default function CustomerPage({ params, searchParams }: CustomerPageProps) {
  // Unwrap Next.js 15 params using React 19 `use` hook
  const { tenantSlug } = use(params);
  const resolvedSearchParams = searchParams ? use(searchParams) : undefined;

  const isVenueMode = resolvedSearchParams?.mode === "in_venue" || Boolean(resolvedSearchParams?.table);
  const tableNumber = resolvedSearchParams?.table || "04";
  const zoneSlug = resolvedSearchParams?.zone || "indoor-main";

  return (
    <CustomerOrderingView
      tenantSlug={tenantSlug}
      initialMode={isVenueMode ? "IN_VENUE" : "REMOTE"}
      tableContext={
        isVenueMode
          ? {
              zoneSlug,
              tableNumber,
              zoneName: zoneSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            }
          : null
      }
    />
  );
}
