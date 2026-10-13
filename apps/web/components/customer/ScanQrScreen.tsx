"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Sparkles,
  Wifi,
  Battery,
  Signal,
  Layers,
  Store,
  RefreshCw,
  Camera,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

export interface ScanQrScreenProps {
  onClose?: (() => void) | undefined;
  tenantSlug?: string | undefined;
  venueName?: string | undefined;
  onTableSelected?:
    | ((tableContext: {
        zoneSlug: string;
        tableNumber: string;
        zoneName: string;
      }) => void)
    | undefined;
}

const DEMO_TABLES = [
  { tableNumber: "4", zoneSlug: "indoor-main", zoneName: "Indoor Main" },
  { tableNumber: "7", zoneSlug: "terrace-lounge", zoneName: "Terrace Lounge" },
  { tableNumber: "12", zoneSlug: "courtyard-garden", zoneName: "Courtyard Garden" },
  { tableNumber: "15", zoneSlug: "mezzanine", zoneName: "Mezzanine Floor" },
];

const AVAILABLE_ZONES = [
  { slug: "indoor-main", name: "Indoor Main Hall" },
  { slug: "terrace-lounge", name: "Terrace Lounge" },
  { slug: "courtyard-garden", name: "Courtyard Garden" },
  { slug: "mezzanine", name: "Mezzanine Floor" },
];

export function ScanQrScreen({
  onClose,
  tenantSlug = "brewery-gulberg",
  venueName = "Brewery Cafe Gulberg",
  onTableSelected,
}: ScanQrScreenProps) {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"scan" | "your_code">("scan");
  const [selectedZone, setSelectedZone] = useState("indoor-main");
  const [customTableNumber, setCustomTableNumber] = useState("4");
  const [isScanning, setIsScanning] = useState(false);
  const [scannedSuccess, setScannedSuccess] = useState<string | null>(null);
  const [showManualModal, setShowManualModal] = useState(false);

  // Live Camera Video Stream Support
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [hasCameraStream, setHasCameraStream] = useState(false);

  React.useEffect(() => {
    let stream: MediaStream | null = null;
    if (activeTab === "scan" && typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            setHasCameraStream(true);
          }
        })
        .catch(() => {
          setHasCameraStream(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [activeTab]);

  const handleApplyTable = (zoneSlug: string, tableNumber: string, zoneName: string) => {
    setIsScanning(true);
    setScannedSuccess(`Table ${tableNumber} • ${zoneName}`);

    // Immediately notify consumer so tableContext and mode update without latency
    if (onTableSelected) {
      onTableSelected({ zoneSlug, tableNumber, zoneName });
    }

    setTimeout(() => {
      setIsScanning(false);
      if (onClose) {
        onClose();
      }
      router.push(`/${tenantSlug}/t/${zoneSlug}/${tableNumber}`);
    }, 450);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTableNumber.trim()) return;
    const zoneObj = AVAILABLE_ZONES.find((z) => z.slug === selectedZone);
    handleApplyTable(selectedZone, customTableNumber.trim(), zoneObj?.name || "Indoor Main");
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#F2F4F7] flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {/* 1. Mock iOS Status Bar */}
      <div className="pt-2 px-6 flex items-center justify-between text-neutral-900 text-[13px] font-semibold shrink-0">
        <span className="tracking-tight font-bold">9:41</span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-0.5" />
          <Signal className="w-3.5 h-3.5 fill-current" />
          <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
          <Battery className="w-4 h-4 stroke-[2.5]" />
        </div>
      </div>

      {/* 2. Top Header Navigation */}
      <header className="px-4 pt-2 pb-2 flex items-center justify-between relative shrink-0">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-900 hover:bg-black/5 active:scale-95 transition-all cursor-pointer z-10"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
        </button>

        <h1 className="absolute inset-x-0 text-center font-bold text-base text-neutral-900 tracking-tight pointer-events-none">
          QR Code
        </h1>

        <div className="w-10 h-10" />
      </header>

      {/* 3. Segmented Pill Tab Selector */}
      <div className="px-6 pb-4 pt-1 flex justify-center shrink-0">
        <div className="bg-white/90 backdrop-blur-md rounded-full p-1 flex items-center shadow-xs border border-neutral-200/70 w-full max-w-[340px]">
          <button
            type="button"
            onClick={() => setActiveTab("scan")}
            className={`flex-1 py-2 px-6 rounded-full text-xs font-bold transition-all duration-200 text-center cursor-pointer ${
              activeTab === "scan"
                ? "bg-neutral-950 text-white shadow-xs"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            Scan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("your_code")}
            className={`flex-1 py-2 px-6 rounded-full text-xs font-bold transition-all duration-200 text-center cursor-pointer ${
              activeTab === "your_code"
                ? "bg-neutral-950 text-white shadow-xs"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            Your code
          </button>
        </div>
      </div>

      {/* 4. Main Body Content (Scan vs Your Code) */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {activeTab === "scan" ? (
          /* --- SCAN CAMERA VIEWPORT --- */
          <div className="flex-1 bg-[#232429] flex flex-col items-center justify-center relative p-6 overflow-hidden">
            {/* Live Camera Video Stream */}
            {hasCameraStream && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
            )}

            {/* Subtle camera ambient grid */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none z-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
                backgroundSize: "20px 20px",
              }}
            />

            {/* Circular Ambient Aperture Disc (From Reference Image) */}
            <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-[#34363F]/70 shadow-2xl flex items-center justify-center relative my-auto">
              {/* Outer Viewfinder Reticle Frame */}
              <div className="relative w-56 h-56 sm:w-60 sm:h-60 flex items-center justify-center">
                {/* 4 Crisp White Rounded Corner Brackets (Exact Match to Reference) */}
                <div className="absolute top-0 left-0 w-9 h-9 border-t-[3.5px] border-l-[3.5px] border-white rounded-tl-2xl" />
                <div className="absolute top-0 right-0 w-9 h-9 border-t-[3.5px] border-r-[3.5px] border-white rounded-tr-2xl" />
                <div className="absolute bottom-0 left-0 w-9 h-9 border-b-[3.5px] border-l-[3.5px] border-white rounded-bl-2xl" />
                <div className="absolute bottom-0 right-0 w-9 h-9 border-b-[3.5px] border-r-[3.5px] border-white rounded-br-2xl" />

                {/* Sweeping Laser Scanline Beam */}
                <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-[#1546d9] to-transparent shadow-[0_0_12px_#1546d9] animate-[bounce_2.8s_infinite] pointer-events-none z-10" />

                {/* Center QR Code Card (Clickable to Simulate Real Scan) */}
                <button
                  type="button"
                  onClick={() => handleApplyTable("indoor-main", "4", "Indoor Main")}
                  className="w-44 h-44 sm:w-48 sm:h-48 rounded-2xl bg-white p-3.5 shadow-2xl flex items-center justify-center relative overflow-hidden transition-transform active:scale-95 cursor-pointer group"
                  title="Click to simulate scanning table QR"
                >
                  {/* High Fidelity SVG QR Code with Electric Cobalt Corner Finders & Triad Monogram */}
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full drop-shadow-xs"
                    aria-hidden="true"
                  >
                    {/* Top-Left Finder Eye (Cobalt Blue per Reference) */}
                    <rect x="5" y="5" width="26" height="26" rx="5" fill="#1546d9" />
                    <rect x="9" y="9" width="18" height="18" rx="3" fill="#FFFFFF" />
                    <rect x="13" y="13" width="10" height="10" rx="2" fill="#1546d9" />

                    {/* Top-Right Finder Eye */}
                    <rect x="69" y="5" width="26" height="26" rx="5" fill="#1546d9" />
                    <rect x="73" y="9" width="18" height="18" rx="3" fill="#FFFFFF" />
                    <rect x="77" y="13" width="10" height="10" rx="2" fill="#1546d9" />

                    {/* Bottom-Left Finder Eye */}
                    <rect x="5" y="69" width="26" height="26" rx="5" fill="#1546d9" />
                    <rect x="9" y="73" width="18" height="18" rx="3" fill="#FFFFFF" />
                    <rect x="13" y="77" width="10" height="10" rx="2" fill="#1546d9" />

                    {/* QR Code Matrix Dots & Alignment Squares */}
                    <g fill="#1F242F">
                      {/* Top horizontal timing */}
                      <rect x="35" y="9" width="3.5" height="3.5" rx="1" />
                      <rect x="42" y="9" width="3.5" height="3.5" rx="1" />
                      <rect x="49" y="9" width="3.5" height="3.5" rx="1" />
                      <rect x="56" y="9" width="3.5" height="3.5" rx="1" />
                      <rect x="63" y="9" width="3.5" height="3.5" rx="1" />

                      {/* Left vertical timing */}
                      <rect x="9" y="35" width="3.5" height="3.5" rx="1" />
                      <rect x="9" y="42" width="3.5" height="3.5" rx="1" />
                      <rect x="9" y="49" width="3.5" height="3.5" rx="1" />
                      <rect x="9" y="56" width="3.5" height="3.5" rx="1" />
                      <rect x="9" y="63" width="3.5" height="3.5" rx="1" />

                      {/* Cluster dots Top Area */}
                      <rect x="35" y="16" width="3.5" height="3.5" rx="1" />
                      <rect x="42" y="23" width="3.5" height="3.5" rx="1" />
                      <rect x="49" y="16" width="3.5" height="3.5" rx="1" />
                      <rect x="56" y="23" width="3.5" height="3.5" rx="1" />
                      <rect x="63" y="16" width="3.5" height="3.5" rx="1" />

                      {/* Cluster dots Left Area */}
                      <rect x="16" y="35" width="3.5" height="3.5" rx="1" />
                      <rect x="23" y="42" width="3.5" height="3.5" rx="1" />
                      <rect x="16" y="49" width="3.5" height="3.5" rx="1" />
                      <rect x="23" y="56" width="3.5" height="3.5" rx="1" />
                      <rect x="16" y="63" width="3.5" height="3.5" rx="1" />

                      {/* Cluster dots Right Area */}
                      <rect x="73" y="35" width="3.5" height="3.5" rx="1" />
                      <rect x="80" y="42" width="3.5" height="3.5" rx="1" />
                      <rect x="87" y="35" width="3.5" height="3.5" rx="1" />
                      <rect x="73" y="49" width="3.5" height="3.5" rx="1" />
                      <rect x="87" y="56" width="3.5" height="3.5" rx="1" />
                      <rect x="80" y="63" width="3.5" height="3.5" rx="1" />

                      {/* Cluster dots Bottom-Right Area */}
                      <rect x="69" y="69" width="3.5" height="3.5" rx="1" />
                      <rect x="76" y="69" width="3.5" height="3.5" rx="1" />
                      <rect x="83" y="69" width="3.5" height="3.5" rx="1" />
                      <rect x="90" y="76" width="3.5" height="3.5" rx="1" />
                      <rect x="76" y="83" width="3.5" height="3.5" rx="1" />
                      <rect x="83" y="90" width="3.5" height="3.5" rx="1" />
                      <rect x="69" y="83" width="3.5" height="3.5" rx="1" />
                      <rect x="90" y="90" width="3.5" height="3.5" rx="1" />

                      {/* Bottom alignment pattern */}
                      <rect x="35" y="73" width="3.5" height="3.5" rx="1" />
                      <rect x="42" y="80" width="3.5" height="3.5" rx="1" />
                      <rect x="49" y="73" width="3.5" height="3.5" rx="1" />
                      <rect x="56" y="80" width="3.5" height="3.5" rx="1" />
                      <rect x="35" y="87" width="3.5" height="3.5" rx="1" />
                      <rect x="49" y="87" width="3.5" height="3.5" rx="1" />
                    </g>

                    {/* Central QueueLess Brand Emblem (Matching PayPal Logo Position in Reference) */}
                    <rect x="36" y="36" width="28" height="28" rx="8" fill="#FFFFFF" />
                    <circle cx="50" cy="50" r="11" fill="#1546d9" />
                    <path
                      d="M 46 44 L 54 44 C 56 44 57 45.5 57 47.5 C 57 49.5 56 51 54 51 L 48.5 51 L 48.5 56 L 46 56 Z M 48.5 46.5 L 48.5 48.5 L 53.5 48.5 C 54.5 48.5 55 48 55 47.5 C 55 47 54.5 46.5 53.5 46.5 Z"
                      fill="#FFFFFF"
                    />
                    <circle cx="54" cy="54" r="2.5" fill="#fd8535" />
                  </svg>
                </button>
              </div>
            </div>

            {/* "Align QR code in frame" Text (Exact Label from Reference Image) */}
            <p className="text-white text-sm font-medium tracking-normal text-center mt-6">
              Align QR code in frame
            </p>

            {/* Fast Demo Table Allotment Pill Selector */}
            <div className="mt-6 w-full max-w-sm space-y-2 z-10">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                  Tap Table to Test Allotment
                </span>
                <button
                  type="button"
                  onClick={() => setShowManualModal(!showManualModal)}
                  className="text-[10px] font-bold text-[#f9b318] hover:underline cursor-pointer"
                >
                  Manual input
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {DEMO_TABLES.map((table) => (
                  <button
                    key={table.tableNumber}
                    type="button"
                    disabled={isScanning}
                    onClick={() =>
                      handleApplyTable(table.zoneSlug, table.tableNumber, table.zoneName)
                    }
                    className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/10 text-left transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span className="text-xs font-bold text-white">
                      Table {table.tableNumber}
                    </span>
                    <span className="text-[10px] text-neutral-400 truncate ml-1">
                      {table.zoneName.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Scanned Success Feedback Animation */}
            {scannedSuccess && (
              <div className="absolute inset-0 bg-[#1546d9]/95 backdrop-blur-md flex flex-col items-center justify-center gap-3 animate-fade-in z-30">
                <div className="w-14 h-14 rounded-full bg-white text-[#1546d9] flex items-center justify-center shadow-xl">
                  <Check className="w-7 h-7 stroke-[3]" />
                </div>
                <div className="text-center space-y-1">
                  <h4 className="font-black text-lg text-white tracking-tight">
                    {scannedSuccess}
                  </h4>
                  <p className="text-xs text-white/80 font-medium">
                    Connecting live table session at {venueName}...
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* --- YOUR CODE VIEWPORT --- */
          <div className="flex-1 bg-[#F2F4F7] p-6 flex flex-col items-center justify-center overflow-y-auto no-scrollbar">
            <div className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-xl border border-neutral-200/80 text-center space-y-4">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-[#fd8535] text-[10px] font-extrabold uppercase tracking-wider border border-orange-200/60 inline-block">
                  Member Fast Pass
                </span>
                <h3 className="font-extrabold text-base text-neutral-900">
                  {currentUser?.name || "Ahmed Khan"}
                </h3>
                <p className="text-xs text-neutral-500 font-medium">
                  {currentUser?.email || "customer@queueless.pk"} • #QL-8492
                </p>
              </div>

              {/* Customer Generated QR Code */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-48 h-48 drop-shadow-xs" aria-hidden="true">
                  <rect x="5" y="5" width="26" height="26" rx="5" fill="#18181B" />
                  <rect x="9" y="9" width="18" height="18" rx="3" fill="#FFFFFF" />
                  <rect x="13" y="13" width="10" height="10" rx="2" fill="#18181B" />

                  <rect x="69" y="5" width="26" height="26" rx="5" fill="#18181B" />
                  <rect x="73" y="9" width="18" height="18" rx="3" fill="#FFFFFF" />
                  <rect x="77" y="13" width="10" height="10" rx="2" fill="#18181B" />

                  <rect x="5" y="69" width="26" height="26" rx="5" fill="#18181B" />
                  <rect x="9" y="73" width="18" height="18" rx="3" fill="#FFFFFF" />
                  <rect x="13" y="77" width="10" height="10" rx="2" fill="#18181B" />

                  <g fill="#27272A">
                    <rect x="35" y="12" width="4" height="4" rx="1" />
                    <rect x="44" y="12" width="4" height="4" rx="1" />
                    <rect x="53" y="12" width="4" height="4" rx="1" />
                    <rect x="62" y="12" width="4" height="4" rx="1" />

                    <rect x="12" y="35" width="4" height="4" rx="1" />
                    <rect x="12" y="44" width="4" height="4" rx="1" />
                    <rect x="12" y="53" width="4" height="4" rx="1" />
                    <rect x="12" y="62" width="4" height="4" rx="1" />

                    <rect x="40" y="40" width="20" height="20" rx="4" fill="#fd8535" />
                    <circle cx="50" cy="50" r="5" fill="#FFFFFF" />

                    <rect x="69" y="69" width="4" height="4" rx="1" />
                    <rect x="78" y="69" width="4" height="4" rx="1" />
                    <rect x="87" y="78" width="4" height="4" rx="1" />
                    <rect x="78" y="87" width="4" height="4" rx="1" />
                    <rect x="69" y="87" width="4" height="4" rx="1" />
                  </g>
                </svg>
              </div>

              <p className="text-[11px] text-neutral-500 font-medium leading-relaxed">
                Present this code to the pickup counter cashier or scan at table to verify your live order.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 5. Manual Entry Modal Drawer */}
      {showManualModal && (
        <div className="absolute inset-x-0 bottom-0 z-40 bg-white p-5 rounded-t-3xl shadow-2xl border-t border-neutral-200 space-y-3 animate-slide-up">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-neutral-900">
              Manual Table Number
            </h4>
            <button
              type="button"
              onClick={() => setShowManualModal(false)}
              className="text-xs font-bold text-neutral-400 hover:text-neutral-700"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">
                Zone / Section
              </label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-semibold text-neutral-900"
              >
                {AVAILABLE_ZONES.map((z) => (
                  <option key={z.slug} value={z.slug}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">
                Table Number (from standee)
              </label>
              <input
                type="text"
                placeholder="e.g. 4, 7, 12"
                value={customTableNumber}
                onChange={(e) => setCustomTableNumber(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-neutral-950 text-white font-bold text-xs hover:bg-[#1546d9] transition-colors"
            >
              Confirm Table
            </button>
          </form>
        </div>
      )}

      {/* 6. iOS Home Indicator Bar */}
      <div className="py-2 shrink-0 bg-transparent">
        <div
          className={`w-32 h-1 rounded-full mx-auto transition-colors ${
            activeTab === "scan" ? "bg-white/40" : "bg-neutral-900/40"
          }`}
        />
      </div>
    </div>
  );
}
export default ScanQrScreen;
