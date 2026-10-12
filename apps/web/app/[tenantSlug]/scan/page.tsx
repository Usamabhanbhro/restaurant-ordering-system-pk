"use client";

import { use } from "react";
import { ScanQrScreen } from "@/components/customer/ScanQrScreen";
import { getRegistryVenueBySlug } from "@/lib/domain/venue/venueRegistry";

interface TenantScanPageProps {
  params: Promise<{ tenantSlug: string }>;
}

export default function TenantScanPage({ params }: TenantScanPageProps) {
  const { tenantSlug } = use(params);
  const venue = getRegistryVenueBySlug(tenantSlug);

  return (
    <div className="min-h-screen bg-[#FFFBF8] flex justify-center">
      <main className="w-full max-w-md bg-[#F2F4F7] flex flex-col min-h-screen shadow-2xl relative">
        <ScanQrScreen
          tenantSlug={tenantSlug}
          venueName={venue?.name || "Partner Venue"}
        />
      </main>
    </div>
  );
}
