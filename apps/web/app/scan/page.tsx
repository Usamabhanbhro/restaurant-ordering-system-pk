"use client";

import { ScanQrScreen } from "@/components/customer/ScanQrScreen";

export default function PlatformScanPage() {
  return (
    <div className="min-h-screen bg-[#0C0F17] flex justify-center">
      <main className="w-full max-w-md bg-[#0C0F17] flex flex-col min-h-screen shadow-2xl relative">
        <ScanQrScreen tenantSlug="burns-road-cafe" venueName="QueueLess Partner Venues" />
      </main>
    </div>
  );
}
