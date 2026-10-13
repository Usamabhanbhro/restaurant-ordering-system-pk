"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  Zap,
  RotateCcw,
  Upload,
  Utensils,
  Check,
  QrCode,
  AlertCircle,
  Hash,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { playChime } from "@/lib/audio";

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

export interface DiningZone {
  slug: string;
  name: string;
  tables: string[];
}

export const VENUE_ZONES: DiningZone[] = [
  {
    slug: "indoor-main",
    name: "Indoor Main Hall",
    tables: ["01", "02", "03", "04", "05", "06", "07", "08"],
  },
  {
    slug: "terrace-lounge",
    name: "Terrace Lounge",
    tables: ["09", "10", "11", "12", "14"],
  },
  {
    slug: "courtyard-garden",
    name: "Courtyard Garden",
    tables: ["15", "16", "17", "18"],
  },
  {
    slug: "mezzanine",
    name: "Mezzanine Floor",
    tables: ["19", "20", "21", "22"],
  },
];

/**
 * Parses raw QR code payload strings into structured table routing parameters.
 * Supports absolute URLs, relative URLs, JSON payloads, and plain standee numbers.
 */
export function parseTableQrPayload(
  rawText: string,
  fallbackTenantSlug: string
): {
  tenantSlug: string;
  zoneSlug: string;
  tableNumber: string;
  zoneName: string;
} | null {
  const text = rawText.trim();
  if (!text) return null;

  // 1. URL pattern: .../[tenantSlug]/t/[zoneSlug]/[tableNumber]
  const urlMatch = text.match(/(?:https?:\/\/[^/]+)?(?:\/([^/]+))?\/t\/([^/]+)\/([^/?#]+)/);
  if (urlMatch) {
    const matchedSlug = urlMatch[1] && urlMatch[1] !== "t" ? urlMatch[1] : fallbackTenantSlug;
    const matchedZone = urlMatch[2] || "indoor-main";
    const matchedTable = urlMatch[3] || "1";
    const formattedZoneName = matchedZone
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      tenantSlug: matchedSlug,
      zoneSlug: matchedZone,
      tableNumber: matchedTable,
      zoneName: formattedZoneName,
    };
  }

  // 2. Structured JSON pattern
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object") {
      const tNum = String(parsed.table || parsed.tableNumber || "");
      if (tNum) {
        const zSlug = String(parsed.zone || parsed.zoneSlug || "indoor-main");
        const tSlug = String(parsed.venue || parsed.tenantSlug || fallbackTenantSlug);
        const zName = String(
          parsed.zoneName ||
            zSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        );
        return {
          tenantSlug: tSlug,
          zoneSlug: zSlug,
          tableNumber: tNum,
          zoneName: zName,
        };
      }
    }
  } catch {
    // Non-JSON payload
  }

  // 3. Simple table string, e.g. "Table 4", "T-04", "04", "12"
  const numMatch = text.match(/^(?:table[-_\s]*)?([0-9]+[a-z]?)$/i);
  if (numMatch && numMatch[1]) {
    return {
      tenantSlug: fallbackTenantSlug,
      zoneSlug: "indoor-main",
      tableNumber: numMatch[1],
      zoneName: "Indoor Main Hall",
    };
  }

  return null;
}

export function ScanQrScreen({
  onClose,
  tenantSlug = "burns-road-cafe",
  venueName = "Partner Venue",
  onTableSelected,
}: ScanQrScreenProps) {
  const router = useRouter();

  // Active UI View: "camera" (live reticle scanner) or "manual" (table standee picker)
  const [activeTab, setActiveTab] = useState<"camera" | "manual">("camera");

  // Camera Stream & Device State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [hasCameraStream, setHasCameraStream] = useState(false);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);

  // Scanning & Navigation Status
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedSuccess, setScannedSuccess] = useState<string | null>(null);
  const [scanNotice, setScanNotice] = useState<string | null>(null);

  // Manual Table Picker State
  const [selectedZoneSlug, setSelectedZoneSlug] = useState("indoor-main");
  const [selectedTableNumber, setSelectedTableNumber] = useState("04");
  const [manualInputVal, setManualInputVal] = useState("");

  const activeZone = useMemo(() => {
    return (
      VENUE_ZONES.find((z) => z.slug === selectedZoneSlug) ||
      VENUE_ZONES[0] || {
        slug: "indoor-main",
        name: "Indoor Main Hall",
        tables: ["01", "02", "03", "04"],
      }
    );
  }, [selectedZoneSlug]);

  // Native BarcodeDetector instance when supported
  const barcodeDetector = useMemo(() => {
    if (typeof window !== "undefined" && "BarcodeDetector" in window) {
      try {
        return new (window as any).BarcodeDetector({ formats: ["qr_code"] });
      } catch {
        return null;
      }
    }
    return null;
  }, []);

  // Handle successful table resolution
  const handleApplyTable = useCallback(
    (targetSlug: string, zoneSlug: string, tableNumber: string, zoneName: string) => {
      if (isProcessing) return;
      setIsProcessing(true);
      setScannedSuccess(`Table ${tableNumber} • ${zoneName}`);

      // Play audio chime and trigger device haptic feedback
      playChime();
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([40, 50, 40]);
      }

      // Propagate table context to consumer
      if (onTableSelected) {
        onTableSelected({ zoneSlug, tableNumber, zoneName });
      }

      // Smooth transition to live table view
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
        router.push(`/${targetSlug}/t/${zoneSlug}/${tableNumber}`);
      }, 550);
    },
    [isProcessing, onTableSelected, onClose, router]
  );

  // Process raw QR string detection
  const handleCodeDetected = useCallback(
    (rawCode: string) => {
      const parsed = parseTableQrPayload(rawCode, tenantSlug);
      if (parsed) {
        handleApplyTable(
          parsed.tenantSlug,
          parsed.zoneSlug,
          parsed.tableNumber,
          parsed.zoneName
        );
      } else {
        setScanNotice("Unrecognized QR code format. Please check your table standee.");
        setTimeout(() => setScanNotice(null), 3500);
      }
    },
    [tenantSlug, handleApplyTable]
  );

  // Initialize and tear down camera stream
  const startCamera = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraPermissionDenied(true);
      return;
    }

    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setHasCameraStream(true);
      setCameraPermissionDenied(false);

      // Check for torch / flashlight capability on video track
      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities = (track.getCapabilities && (track.getCapabilities() as any)) || {};
        setTorchAvailable(Boolean(capabilities.torch));
      }
    } catch {
      setHasCameraStream(false);
      setCameraPermissionDenied(true);
    }
  }, [facingMode]);

  useEffect(() => {
    if (activeTab === "camera") {
      startCamera();
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      setHasCameraStream(false);
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [activeTab, startCamera]);

  // Continuous frame detection loop when BarcodeDetector is available
  useEffect(() => {
    if (!hasCameraStream || !barcodeDetector || activeTab !== "camera" || isProcessing) {
      return;
    }

    let active = true;
    const interval = setInterval(async () => {
      if (!active || !videoRef.current || isProcessing) return;
      if (videoRef.current.readyState < 2) return;

      try {
        const barcodes = await barcodeDetector.detect(videoRef.current);
        const first = barcodes[0];
        if (first?.rawValue) {
          handleCodeDetected(first.rawValue);
        }
      } catch {
        // Ignored frame detection miss
      }
    }, 220);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [hasCameraStream, barcodeDetector, activeTab, isProcessing, handleCodeDetected]);

  // Flashlight / Torch toggle
  const toggleTorch = async () => {
    if (!mediaStreamRef.current) return;
    const track = mediaStreamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextState = !isTorchOn;
      await track.applyConstraints({
        advanced: [{ torch: nextState } as any],
      });
      setIsTorchOn(nextState);
    } catch {
      // Torch constraint failed
    }
  };

  // Flip Camera between environment and front
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Upload image from photo gallery
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (barcodeDetector) {
      try {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const barcodes = await barcodeDetector.detect(img);
        const first = barcodes[0];
        if (first?.rawValue) {
          handleCodeDetected(first.rawValue);
          return;
        }
      } catch {
        // Fallback below
      }
    }

    setScanNotice("Could not find table QR in photo. Please select your table number below.");
    setActiveTab("manual");
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#0C0F17] text-white flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {/* 1. Liquid Glass Top Navigation Bar */}
      <header className="px-4 py-3.5 flex items-center justify-between border-b border-white/10 bg-neutral-900/80 backdrop-blur-xl shrink-0 z-20">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
        </button>

        <div className="text-center px-2">
          <h1 className="font-extrabold text-sm text-white tracking-tight flex items-center justify-center gap-1.5">
            <span>Table QR Connect</span>
          </h1>
          <p className="text-[11px] text-neutral-400 font-medium truncate max-w-[210px]">
            {venueName}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab(activeTab === "camera" ? "manual" : "camera")}
          aria-label="Toggle input mode"
          className="h-10 px-3 rounded-full flex items-center gap-1.5 text-xs font-bold text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 transition-all cursor-pointer"
        >
          {activeTab === "camera" ? (
            <>
              <Hash className="w-3.5 h-3.5 text-[#f9b318]" />
              <span className="hidden sm:inline">Table #</span>
            </>
          ) : (
            <>
              <Camera className="w-3.5 h-3.5 text-[#fd8535]" />
              <span className="hidden sm:inline">Camera</span>
            </>
          )}
        </button>
      </header>

      {/* 2. Functional Segmented Pill Mode Switcher */}
      <div className="px-4 py-2.5 flex justify-center shrink-0 z-20 bg-neutral-950/60 backdrop-blur-md border-b border-white/5">
        <div className="bg-white/10 backdrop-blur-xl p-1 rounded-full flex items-center border border-white/10 w-full max-w-[340px] shadow-glass">
          <button
            type="button"
            onClick={() => setActiveTab("camera")}
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "camera"
                ? "bg-gradient-to-r from-[#fd8535] to-[#f9b318] text-white shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Scan Standee</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "manual"
                ? "bg-gradient-to-r from-[#fd8535] to-[#f9b318] text-white shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Utensils className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Enter Table #</span>
          </button>
        </div>
      </div>

      {/* 3. Main Viewport Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {activeTab === "camera" ? (
          /* ================= CAMERA VIEWPORT ================= */
          <div className="flex-1 flex flex-col items-center justify-between relative bg-black overflow-hidden p-6">
            {/* Live Camera Stream */}
            {hasCameraStream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-0 bg-[#0C0F17]">
                <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-[#fd8535] shadow-xl">
                  <Camera className="w-8 h-8 stroke-[1.8]" />
                </div>
                <h3 className="font-extrabold text-base text-white mb-1.5">
                  Camera Access Required
                </h3>
                <p className="text-xs text-neutral-400 max-w-xs leading-relaxed mb-6">
                  QueueLess uses your camera to scan table standee QR codes. Allow camera access or enter your table number directly.
                </p>
                <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-xs">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="w-full py-2.5 px-4 rounded-xl bg-white text-neutral-950 font-extrabold text-xs hover:bg-neutral-200 active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    Grant Camera Access
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("manual")}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/15 active:scale-95 transition-all border border-white/10 cursor-pointer"
                  >
                    Enter Table Number
                  </button>
                </div>
              </div>
            )}

            {/* Dark Scrim / Vignette around Reticle */}
            <div className="absolute inset-0 bg-black/45 pointer-events-none z-10" />

            {/* Scanning Reticle Frame */}
            <div className="relative my-auto z-10 flex flex-col items-center">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl flex items-center justify-center overflow-hidden">
                {/* 4 Precision Corner Brackets (Triad Electric Cobalt & Saffron Accents) */}
                <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-2xl shadow-sm" />
                <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-2xl shadow-sm" />
                <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-2xl shadow-sm" />
                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-2xl shadow-sm" />

                {/* Animated Sweeping Laser Scanline */}
                <div className="absolute inset-x-3 h-0.5 bg-gradient-to-r from-transparent via-[#1546d9] to-transparent shadow-[0_0_16px_#1546d9] animate-[bounce_2.4s_infinite] pointer-events-none z-10" />

                {/* Reticle Interior Hint */}
                <div className="text-center p-4 rounded-2xl bg-black/20 backdrop-blur-xs border border-white/5 space-y-1.5 pointer-events-none">
                  <QrCode className="w-8 h-8 text-white/50 mx-auto" />
                  <p className="text-xs font-bold text-white/80 tracking-tight">
                    Align Table QR in Frame
                  </p>
                </div>
              </div>

              {/* Status Notice or Help Text */}
              {scanNotice ? (
                <div className="mt-4 px-4 py-2 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-lg">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{scanNotice}</span>
                </div>
              ) : (
                <p className="mt-4 text-xs font-medium text-white/70 text-center tracking-normal">
                  Point camera at the acrylic table standee
                </p>
              )}
            </div>

            {/* Floating Camera Tools & Quick Simulator */}
            <div className="w-full max-w-sm flex items-center justify-between gap-3 relative z-20 pt-2 pb-1">
              {/* Torch Toggle */}
              <button
                type="button"
                onClick={toggleTorch}
                disabled={!hasCameraStream || !torchAvailable}
                aria-label="Toggle Torch"
                className={`flex-1 py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                  isTorchOn
                    ? "bg-[#f9b318] text-neutral-950 border-[#f9b318] shadow-lg shadow-amber-500/30 font-extrabold"
                    : "bg-neutral-900/80 backdrop-blur-xl border-white/10 text-white hover:bg-neutral-800 disabled:opacity-40"
                }`}
              >
                <Zap className="w-4 h-4 stroke-[2.2]" />
                <span>Torch</span>
              </button>

              {/* Flip Camera */}
              <button
                type="button"
                onClick={toggleFacingMode}
                disabled={!hasCameraStream}
                aria-label="Flip Camera"
                className="flex-1 py-2.5 px-3 rounded-2xl bg-neutral-900/80 backdrop-blur-xl border border-white/10 text-white hover:bg-neutral-800 disabled:opacity-40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4 stroke-[2.2]" />
                <span>Flip</span>
              </button>

              {/* Gallery Image Upload */}
              <label
                className="flex-1 py-2.5 px-3 rounded-2xl bg-neutral-900/80 backdrop-blur-xl border border-white/10 text-white hover:bg-neutral-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer text-center"
              >
                <Upload className="w-4 h-4 stroke-[2.2]" />
                <span>Photo</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Discreet Instant Test Allotment (for testing environments) */}
              <button
                type="button"
                onClick={() => handleApplyTable(tenantSlug, "indoor-main", "04", "Indoor Main Hall")}
                className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white shrink-0 active:scale-95 transition-all cursor-pointer"
                title="Instant Test Simulation: Connect Table 04"
              >
                <Sparkles className="w-4 h-4 text-[#fd8535]" />
              </button>
            </div>
          </div>
        ) : (
          /* ================= MANUAL TABLE PICKER VIEWPORT ================= */
          <div className="flex-1 bg-[#0C0F17] p-5 flex flex-col justify-between overflow-y-auto no-scrollbar relative">
            <div className="space-y-5 max-w-sm mx-auto w-full">
              {/* Standee Guidance Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-neutral-900/90 to-neutral-900/40 border border-white/10 shadow-glass space-y-1.5">
                <div className="flex items-center gap-2 text-[#fd8535]">
                  <Utensils className="w-4 h-4 stroke-[2.5]" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider">
                    Acrylic Standee Allotment
                  </span>
                </div>
                <p className="text-xs text-neutral-300 font-medium leading-relaxed">
                  Select your dining zone and table number matching the printed number on your table standee.
                </p>
              </div>

              {/* Zone Filter Chips */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  1. Select Dining Zone
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {VENUE_ZONES.map((zone) => {
                    const isSelected = zone.slug === selectedZoneSlug;
                    return (
                      <button
                        key={zone.slug}
                        type="button"
                        onClick={() => {
                          setSelectedZoneSlug(zone.slug);
                          const firstTable = zone.tables[0];
                          if (firstTable) {
                            setSelectedTableNumber(firstTable);
                          }
                        }}
                        className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between h-16 ${
                          isSelected
                            ? "bg-white/10 border-[#fd8535] text-white shadow-md shadow-orange-950/20"
                            : "bg-neutral-900/60 border-white/10 text-neutral-400 hover:text-white hover:bg-neutral-800/80"
                        }`}
                      >
                        <span className="text-xs font-extrabold line-clamp-1">{zone.name}</span>
                        <span className="text-[10px] text-neutral-500 font-medium">
                          {zone.tables.length} Tables
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Table Number Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    2. Table Number ({activeZone.name})
                  </label>
                  <span className="text-[10px] font-bold text-[#f9b318]">
                    Selected: Table {selectedTableNumber}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {activeZone.tables.map((tNum) => {
                    const isSelected = tNum === selectedTableNumber;
                    return (
                      <button
                        key={tNum}
                        type="button"
                        onClick={() => {
                          setSelectedTableNumber(tNum);
                          setManualInputVal("");
                        }}
                        className={`h-12 rounded-xl text-sm font-extrabold border transition-all cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? "bg-gradient-to-br from-[#fd8535] to-[#e0681c] text-white border-transparent shadow-md shadow-orange-950/30 scale-102"
                            : "bg-neutral-900/60 border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {tNum}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Number Input (if standee has unusual numbering) */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Or enter specific standee code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 24, T-09, VIP-1"
                    value={manualInputVal}
                    onChange={(e) => {
                      setManualInputVal(e.target.value);
                      if (e.target.value.trim()) {
                        setSelectedTableNumber(e.target.value.trim());
                      }
                    }}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-neutral-900/80 border border-white/10 text-xs font-bold text-white placeholder-neutral-500 focus:outline-none focus:border-[#fd8535]"
                  />
                  {manualInputVal && (
                    <button
                      type="button"
                      onClick={() => setManualInputVal("")}
                      className="px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-neutral-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Direct Connect CTA */}
            <div className="pt-4 max-w-sm mx-auto w-full">
              <button
                type="button"
                disabled={isProcessing || !selectedTableNumber}
                onClick={() =>
                  handleApplyTable(
                    tenantSlug,
                    selectedZoneSlug,
                    selectedTableNumber,
                    activeZone.name
                  )
                }
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#fd8535] via-[#f9b318] to-[#fd8535] text-white font-extrabold text-sm shadow-xl shadow-orange-950/40 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Confirm Table {selectedTableNumber} • Start Ordering</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Scanned Success Overlay Animation */}
      {scannedSuccess && (
        <div className="absolute inset-0 bg-[#0C0F17]/95 backdrop-blur-xl flex flex-col items-center justify-center gap-4 animate-fade-in z-50 p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1546d9] to-[#0e35ab] text-white flex items-center justify-center shadow-2xl shadow-blue-950/60 animate-scale-up">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
          <div className="space-y-1.5">
            <h4 className="font-black text-xl text-white tracking-tight">
              {scannedSuccess}
            </h4>
            <p className="text-xs text-neutral-300 font-medium">
              Connecting live dine-in session at {venueName}...
            </p>
          </div>
          <div className="w-40 h-1.5 rounded-full bg-neutral-800 overflow-hidden mt-2">
            <div className="h-full bg-gradient-to-r from-[#fd8535] to-[#f9b318] animate-pulse rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
}

export default ScanQrScreen;
