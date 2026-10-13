"use client";

import Link from "next/link";
import type { VenueData, OrderingMode, TableContext } from "@/lib/mockData";
import { useCartStore } from "@/lib/store/cartStore";

interface HeroHeaderProps {
  venue: VenueData;
  remoteOrdersPaused?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectTab: (tab: "menu" | "perks" | "status" | "profile") => void;
  onOpenCart?: () => void;
  showSearch?: boolean;
  showCart?: boolean;
  mode?: OrderingMode;
  tableContext?: TableContext | null;
}

export function HeroHeader({
  venue,
  remoteOrdersPaused = false,
  searchQuery,
  onSearchChange,
  onOpenCart,
  showSearch = true,
  showCart = true,
  mode = "REMOTE",
  tableContext,
}: HeroHeaderProps) {
  const { getItemCount } = useCartStore();
  const cartItemCount = getItemCount();

  return (
    <header className="relative w-full">
      {/* Top Hero Banner */}
      <div className="relative h-40 sm:h-44 w-full overflow-hidden bg-neutral-900">
        <img
          src={venue.coverImage}
          alt={venue.name}
          className="w-full h-full object-cover opacity-85"
        />
        {/* Restored warm cream bottom gradient overlay for maximum contrast and seamless text grounding */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#FFFBF8] via-black/40 to-black/20" />

        {/* Floating Top Elements: Back to all venues + Cart button */}
        <div className="absolute top-3 left-4 right-4 flex items-center justify-between z-10">
          <Link
            href="/"
            aria-label="Back to all venues"
            className="h-8 px-3 rounded-full bg-white/95 backdrop-blur-md text-neutral-800 shadow-md hover:bg-white active:scale-95 flex items-center transition-all border border-neutral-200/60 text-xs font-bold cursor-pointer"
          >
            <span>All Venues</span>
          </Link>

          {showCart && (
            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`Shopping Cart (${cartItemCount} items)`}
              className="relative h-8 px-3 rounded-full bg-white text-neutral-900 shadow-md hover:bg-neutral-100 active:scale-95 flex items-center justify-center gap-1.5 transition-all border border-neutral-100 cursor-pointer text-xs font-bold"
            >
              <span>Cart</span>
              {cartItemCount > 0 && (
                <span className="px-1.5 py-0.2 min-w-4.5 h-4.5 rounded-full bg-[#fd8535] text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Venue Profile Section (Positioned outside overflow-hidden with negative margin to ensure zero logo clipping) */}
      <div className="px-4 -mt-7 relative z-10 flex items-end gap-3.5">
        {/* Official QueueLess Brand Emblem from brand folder (The Velocity Platter) */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#fd8535] to-[#e0681c] p-2.5 shadow-xl shadow-orange-950/20 shrink-0 flex items-center justify-center border-2 border-white ring-1 ring-black/5">
          <svg viewBox="0 0 800 800" className="w-full h-full fill-white" aria-hidden="true">
            <g fill="#FFFFFF" fillRule="evenodd">
              {/* Plume 01: Top Aerodynamic Streak */}
              <path d="M 235 285 C 310 290, 410 265, 545 220 L 495 265 C 415 275, 320 295, 235 285 Z" />
              {/* Plume 02: Mid Velocity Flow */}
              <path d="M 195 348 C 285 352, 420 325, 595 272 L 535 325 C 425 338, 305 362, 195 348 Z" />
              {/* Plume 03: The Kinetic Serving Vessel */}
              <path d="M 205 435 C 275 425, 470 380, 615 330 C 570 470, 470 545, 345 545 C 260 545, 215 500, 205 435 Z M 245 448 C 255 485, 290 512, 350 512 C 435 512, 515 460, 560 365 C 445 405, 300 440, 245 448 Z" />
            </g>
          </svg>
        </div>

        <div className="pb-0.5">
          <h1 className="font-extrabold text-base sm:text-lg text-neutral-900 tracking-tight leading-tight">
            {venue.name}
          </h1>
          {/* Rating & Dining Mode Context */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <span className="px-2 py-0.5 rounded-full bg-[#f9b318] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs">
              <span>{venue.rating}</span>
            </span>
            {mode === "IN_VENUE" && tableContext ? (
              <span className="px-2 py-0.5 rounded-full bg-[#1546d9] text-white text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
                <span>Table {tableContext.tableNumber} • {tableContext.zoneName || "Indoor Main"}</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[10px] font-bold flex items-center gap-1">
                <span>{venue.neighborhood || "Dining Hub"} • Counter Pickup</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Venue Status Banner (If Paused) */}
      {remoteOrdersPaused && (
        <div className="mx-4 mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs flex items-center gap-2.5">
          <p className="font-semibold">
            Remote orders are paused right now by cafe staff. Please order at counter.
          </p>
        </div>
      )}

      {/* Search Bar Pill (Displayed when browsing menu, hidden in Order Tracker) */}
      {showSearch && (
        <div className="px-4 pt-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search burgers, iced latte, fries..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-full bg-white border border-neutral-200/80 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#fd8535] shadow-soft placeholder-neutral-400"
            />
          </div>
        </div>
      )}
    </header>
  );
}
