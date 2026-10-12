"use client";

import { ScanQrScreen } from "@/components/customer/ScanQrScreen";

export default function PlatformScanPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF8] flex justify-center">
      <main className="w-full max-w-md bg-[#F2F4F7] flex flex-col min-h-screen shadow-2xl relative">
        <ScanQrScreen tenantSlug="brewery-gulberg" venueName="QueueLess Partner Venues" />
      </main>
    </div>
  );
}
