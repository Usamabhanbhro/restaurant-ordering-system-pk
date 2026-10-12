"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  ChevronDown,
  Sparkles,
  Utensils,
  QrCode,
  Clock,
  RotateCcw,
  Store,
  ShieldCheck,
} from "lucide-react";
import { VENUE_REGISTRY, type VenueRegistryItem } from "@/lib/domain/venue/venueRegistry";
import { CUISINE_SHORTCUTS } from "@/lib/mockData";
import { VenueRegistryCard } from "@/components/customer/VenueRegistryCard";
import type { OrderingMode } from "@/lib/mockData";

const DINING_HUBS = [
  "Gulberg III, Lahore",
  "DHA Phase 5, Lahore",
  "Mall Road, Lahore",
  "Shadman, Lahore",
  "FAST-NUCES Campus, Lahore",
  "LUMS Campus, Lahore",
];

export function PlatformHomeView() {
  const [selectedHub, setSelectedHub] = useState("Gulberg III, Lahore");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModeFilter, setSelectedModeFilter] = useState<"ALL" | OrderingMode>("ALL");
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);

  // Filter venues dynamically based on search, mode, open state, and cuisine
  const filteredVenues = useMemo(() => {
    return VENUE_REGISTRY.filter((venue) => {
      // 1. Text Search query (match venue name, tagline, address, cuisines, or featured dishes)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = venue.name.toLowerCase().includes(q);
        const matchesTagline = venue.tagline.toLowerCase().includes(q);
        const matchesAddress = venue.address.toLowerCase().includes(q);
        const matchesCuisine = venue.cuisines.some((c) => c.toLowerCase().includes(q));
        const matchesDishes = venue.featuredDishes.some((d) => d.toLowerCase().includes(q));

        if (!matchesName && !matchesTagline && !matchesAddress && !matchesCuisine && !matchesDishes) {
          return false;
        }
      }

      // 2. Service Mode filter
      if (selectedModeFilter !== "ALL") {
        if (!venue.supportedModes.includes(selectedModeFilter)) {
          return false;
        }
      }

      // 3. Open Now filter
      if (onlyOpenNow && !venue.isOpen) {
        return false;
      }

      // 4. Cuisine category filter
      if (selectedCuisine) {
        const matchesCuisine = venue.cuisines.some(
          (c) => c.toLowerCase() === selectedCuisine.toLowerCase()
        );
        if (!matchesCuisine) return false;
      }

      return true;
    });
  }, [searchQuery, selectedModeFilter, onlyOpenNow, selectedCuisine]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedModeFilter("ALL");
    setOnlyOpenNow(false);
    setSelectedCuisine(null);
  };

  return (
    <div className="min-h-screen bg-[#FFFBF8] text-neutral-900 flex justify-center">
      {/* Mobile Shell constrained to max-w-md with smooth scroll */}
      <main className="w-full max-w-md bg-[#FFFBF8] flex flex-col min-h-screen shadow-2xl relative pb-16">
        {/* 1. Platform Brand Header & Location Selector */}
        <header className="px-4 pt-6 pb-3 space-y-3 bg-white border-b border-neutral-100 sticky top-0 z-30 shadow-xs">
          {/* Top row: Brand Identity + Location Hub Pill */}
          <div className="flex items-center justify-between gap-2">
            {/* QueueLess Brand Logo & Typography */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#fd8535] to-[#e0681c] p-1.5 shadow-md shadow-orange-950/20 shrink-0 flex items-center justify-center border border-orange-200">
                <svg viewBox="0 0 800 800" className="w-full h-full fill-white" aria-hidden="true">
                  <g fill="#FFFFFF" fillRule="evenodd">
                    <path d="M 235 285 C 310 290, 410 265, 545 220 L 495 265 C 415 275, 320 295, 235 285 Z" />
                    <path d="M 195 348 C 285 352, 420 325, 595 272 L 535 325 C 425 338, 305 362, 195 348 Z" />
                    <path d="M 205 435 C 275 425, 470 380, 615 330 C 570 470, 470 545, 345 545 C 260 545, 215 500, 205 435 Z M 245 448 C 255 485, 290 512, 350 512 C 435 512, 515 460, 560 365 C 445 405, 300 440, 245 448 Z" />
                  </g>
                </svg>
              </div>

              <div>
                <span className="font-black text-base tracking-tight text-neutral-900 leading-none block">
                  Queue<span className="text-[#fd8535]">Less</span>
                </span>
                <span className="text-[10px] font-bold text-neutral-400 block mt-0.5">
                  Platform Hub
                </span>
              </div>
            </div>

            {/* Location Selector Button */}
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(!isLocationModalOpen)}
              className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 text-xs font-bold transition-all flex items-center gap-1.5 border border-neutral-200/80 active:scale-95 cursor-pointer max-w-[190px]"
            >
              <MapPin className="w-3.5 h-3.5 text-[#fd8535] shrink-0" />
              <span className="truncate">{selectedHub}</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            </button>
          </div>

          {/* Location Dropdown Modal */}
          {isLocationModalOpen && (
            <div className="p-3 rounded-2xl bg-white border border-neutral-200 shadow-xl space-y-1 animate-fade-in text-xs font-medium">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 px-2 py-1">
                Select Your Campus or Neighborhood
              </p>
              {DINING_HUBS.map((hub) => (
                <button
                  key={hub}
                  type="button"
                  onClick={() => {
                    setSelectedHub(hub);
                    setIsLocationModalOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-colors flex items-center justify-between cursor-pointer ${
                    selectedHub === hub
                      ? "bg-orange-50 text-[#fd8535] font-bold"
                      : "hover:bg-neutral-50 text-neutral-700"
                  }`}
                >
                  <span>{hub}</span>
                  {selectedHub === hub && (
                    <span className="w-2 h-2 rounded-full bg-[#fd8535]" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Search Bar Pill */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search partner cafes, burgers, biryani, coffee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-neutral-100/90 border border-neutral-200/80 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#fd8535] shadow-xs placeholder-neutral-400"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
          </div>

          {/* Mode & Availability Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <button
              type="button"
              onClick={() => setSelectedModeFilter("ALL")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedModeFilter === "ALL"
                  ? "bg-neutral-950 text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              All Modes
            </button>

            <button
              type="button"
              onClick={() =>
                setSelectedModeFilter(
                  selectedModeFilter === "REMOTE" ? "ALL" : "REMOTE"
                )
              }
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-1 cursor-pointer ${
                selectedModeFilter === "REMOTE"
                  ? "bg-[#fd8535] text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              <Utensils className="w-3 h-3" />
              <span>Counter Pickup</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setSelectedModeFilter(
                  selectedModeFilter === "IN_VENUE" ? "ALL" : "IN_VENUE"
                )
              }
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-1 cursor-pointer ${
                selectedModeFilter === "IN_VENUE"
                  ? "bg-[#1546d9] text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              <QrCode className="w-3 h-3" />
              <span>Table QR</span>
            </button>

            <button
              type="button"
              onClick={() => setOnlyOpenNow(!onlyOpenNow)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-1 cursor-pointer ${
                onlyOpenNow
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Open Now</span>
            </button>
          </div>
        </header>

        {/* 2. Scrollable Platform Discovery Body */}
        <div className="flex-1 space-y-4 pt-3 pb-8">
          {/* Cuisine Shortcuts Row (3D Claymorphic Icon Track) */}
          <section className="px-4 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-xs uppercase tracking-wider text-neutral-400">
                Explore by Cuisine
              </h2>
              {selectedCuisine && (
                <button
                  type="button"
                  onClick={() => setSelectedCuisine(null)}
                  className="text-[11px] font-bold text-[#fd8535] hover:underline cursor-pointer"
                >
                  Clear cuisine
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
              {CUISINE_SHORTCUTS.map((cat) => {
                const isSelected = selectedCuisine === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      setSelectedCuisine(isSelected ? null : cat.name)
                    }
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl shrink-0 transition-all duration-200 active:scale-95 cursor-pointer ${
                      isSelected
                        ? "bg-orange-50 border-2 border-[#fd8535] shadow-xs"
                        : "bg-white border border-neutral-200/80 shadow-2xs hover:border-neutral-300"
                    }`}
                  >
                    <div className="w-13 h-13 rounded-xl flex items-center justify-center p-1 bg-neutral-50/80">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-11 h-11 object-contain drop-shadow-sm"
                      />
                    </div>
                    <span
                      className={`text-[11px] tracking-tight text-center whitespace-nowrap px-1 ${
                        isSelected
                          ? "font-extrabold text-[#fd8535]"
                          : "font-semibold text-neutral-700"
                      }`}
                    >
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Platform Value Proposition Hero Banner */}
          {!searchQuery.trim() && !selectedCuisine && (
            <section className="px-4">
              <div className="p-4 rounded-3xl bg-gradient-to-br from-[#171717] via-[#262626] to-[#171717] text-white shadow-md relative overflow-hidden space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-[#f9b318] text-neutral-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-neutral-950" />
                    <span>Direct Ordering</span>
                  </span>
                  <span className="text-[11px] font-semibold text-neutral-300">
                    Zero line waiting
                  </span>
                </div>

                <div className="space-y-0.5">
                  <h3 className="text-base font-black tracking-tight text-white">
                    Skip the Counter Lines
                  </h3>
                  <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                    Pre-order for instant pickup or table dining across Lahore cafes with 0% platform markup.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* 3. Venue Registry Section */}
          <section className="px-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-xs uppercase tracking-wider text-neutral-400">
                  Venue Registry
                </h2>
                <p className="text-sm font-black text-neutral-900 tracking-tight">
                  Partner Cafes & Venues
                </p>
              </div>

              <span className="text-xs font-bold text-neutral-400">
                {filteredVenues.length} {filteredVenues.length === 1 ? "venue" : "venues"}
              </span>
            </div>

            {/* List of Venue Cards */}
            <div className="space-y-4">
              {filteredVenues.map((venue) => (
                <VenueRegistryCard
                  key={venue.id}
                  venue={venue}
                  preferredMode={selectedModeFilter}
                />
              ))}

              {/* Honest Empty State */}
              {filteredVenues.length === 0 && (
                <div className="p-8 text-center bg-white rounded-3xl border border-neutral-200/80 shadow-soft space-y-3">
                  <Store className="w-8 h-8 text-neutral-400 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-neutral-900">
                      No partner venues found
                    </h4>
                    <p className="text-xs text-neutral-500">
                      Try adjusting your mode, cuisine, or search filters.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-[#fd8535] text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset all filters</span>
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* 4. Platform Trust & Compliance Footer */}
          <footer className="pt-6 pb-4 px-4 text-center space-y-2 border-t border-neutral-200/60 mx-4">
            <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Direct kitchen settlement • Official partner network</span>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs font-bold text-neutral-400">
              <Link href="/terms" className="hover:text-neutral-700 transition-colors">
                Terms
              </Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-neutral-700 transition-colors">
                Privacy
              </Link>
            </div>
            <p className="text-[10px] text-neutral-400 font-medium">
              QueueLess Platform v1.2.0 • Lahore, Pakistan
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
