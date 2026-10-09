"use client";

import { Star, User, Search, AlertTriangle } from "lucide-react";
import type { VenueData } from "@/lib/mockData";
import { useAuthStore } from "@/lib/store/authStore";

interface HeroHeaderProps {
  venue: VenueData;
  remoteOrdersPaused?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectTab: (tab: "menu" | "perks" | "status" | "profile") => void;
}

export function HeroHeader({
  venue,
  remoteOrdersPaused = false,
  searchQuery,
  onSearchChange,
  onSelectTab,
}: HeroHeaderProps) {
  const { currentUser, setAuthModal, setPendingPostAuthAction } = useAuthStore();

  return (
    <header className="relative w-full">
      {/* Top Hero Banner */}
      <div className="relative h-44 w-full overflow-hidden bg-neutral-900">
        <img
          src={venue.coverImage}
          alt={venue.name}
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FFFBF8] via-black/40 to-black/20" />

        {/* Floating Top Elements */}
        <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-white z-10">
          <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[11px] font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>
              {venue.openTime} - {venue.closeTime}
            </span>
          </span>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[#EF5A30] text-white text-[11px] font-bold shadow-md flex items-center gap-1">
              <Star className="w-3 h-3 text-white fill-white" />
              <span>{venue.rating}</span>
            </span>

            {currentUser ? (
              <button
                type="button"
                onClick={() => onSelectTab("profile")}
                className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold shadow-md hover:bg-black/80 flex items-center gap-1.5 transition-all"
                title="View Profile"
              >
                <User className="w-3 h-3 text-white" />
                <span>{currentUser.name ? currentUser.name.split(" ")[0] : "Account"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthModal("WELCOME");
                  setPendingPostAuthAction(null);
                }}
                className="px-2.5 py-1 rounded-full bg-white text-neutral-900 text-[11px] font-bold shadow-md hover:bg-neutral-100 flex items-center gap-1 transition-all"
              >
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Venue Profile Pill Card (Overlapping Hero) */}
        <div className="absolute -bottom-1 left-4 right-4 flex items-center gap-3 z-10">
          <div className="w-14 h-14 rounded-2xl bg-[#EF5A30] p-2.5 shadow-lg shadow-orange-950/20 shrink-0 flex items-center justify-center border-2 border-white">
            {/* Speed Cup 'Q' Emblem Vector */}
            <svg viewBox="0 0 512 512" className="w-full h-full fill-white" aria-hidden="true">
              <path d="M 235 125 L 140 285 L 210 285 L 145 395 L 295 240 L 225 240 Z" />
              <path d="M 230 150 C 310 150 370 205 370 285 C 370 335 345 375 305 395 L 340 435 L 285 435 L 255 400 C 247 401 238 402 230 402 C 215 402 200 398 185 392 L 210 355 C 217 358 223 359 230 359 C 285 359 325 325 325 285 C 325 245 285 193 230 193 C 218 193 205 197 195 203 L 195 158 C 206 153 218 150 230 150 Z" />
              <path d="M 370 230 C 400 230 415 250 415 280 C 415 310 400 330 370 330 L 370 295 C 382 295 387 290 387 280 C 387 270 382 265 370 265 Z" />
            </svg>
          </div>
          <div>
            <h2 className="font-extrabold text-base text-neutral-900 tracking-tight leading-tight">
              {venue.name}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold text-[#EF5A30] bg-orange-100/70 px-2 py-0.5 rounded-full">
                10–15m Counter Pickup
              </span>
              <span className="text-[10px] text-neutral-500">• Lahore F&B</span>
            </div>
          </div>
        </div>
      </div>

      {/* Venue Status Banner (If Paused) */}
      {remoteOrdersPaused && (
        <div className="mx-4 mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="font-semibold">
            Remote orders are paused right now by cafe staff. Please order at counter.
          </p>
        </div>
      )}

      {/* Search Bar Pill */}
      <div className="px-4 pt-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search burgers, iced latte, fries..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-neutral-200/80 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#EF5A30] shadow-soft placeholder-neutral-400"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
        </div>
      </div>
    </header>
  );
}
