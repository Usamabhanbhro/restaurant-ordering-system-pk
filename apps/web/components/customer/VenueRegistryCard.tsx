"use client";

import Link from "next/link";
import { Star, MapPin, Clock, ArrowRight, Utensils, QrCode } from "lucide-react";
import type { VenueRegistryItem } from "@/lib/domain/venue/venueRegistry";
import type { OrderingMode } from "@/lib/mockData";

interface VenueRegistryCardProps {
  venue: VenueRegistryItem;
  preferredMode?: OrderingMode | "ALL";
}

export function VenueRegistryCard({
  venue,
  preferredMode = "ALL",
}: VenueRegistryCardProps) {
  // Determine target entry mode based on what the venue actually supports
  const resolvedMode: OrderingMode =
    preferredMode === "IN_VENUE" && venue.supportedModes.includes("IN_VENUE")
      ? "IN_VENUE"
      : venue.supportedModes.includes("REMOTE")
      ? "REMOTE"
      : venue.supportedModes[0] || "REMOTE";

  const targetHref = `/${venue.slug}?mode=${resolvedMode === "IN_VENUE" ? "in_venue" : "remote"}`;

  return (
    <article className="group rounded-3xl bg-white border border-neutral-200/80 shadow-soft overflow-hidden transition-all duration-200 hover:border-[#fd8535]/50 hover:shadow-md flex flex-col justify-between">
      {/* 1. Cover Image with Dynamic Badges */}
      <Link href={targetHref} className="block relative h-44 sm:h-48 w-full overflow-hidden bg-neutral-900">
        <img
          src={venue.coverImageUrl}
          alt={venue.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Ambient Gradient Mask */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

        {/* Top Left: Open / Closed Availability Cue */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {venue.isOpen ? (
            <span className="px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>{venue.openStatusText}</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-neutral-900/90 backdrop-blur-md text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <span>{venue.openStatusText}</span>
            </span>
          )}
        </div>

        {/* Top Right: Distance & Prep Lead */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 border border-white/10 shadow-sm">
            <Clock className="w-3 h-3 text-white/90" />
            <span>{venue.distance} • {venue.prepLeadMinutes}m</span>
          </span>
        </div>

        {/* Bottom Overlay: Price Range Pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-extrabold border border-white/20">
            {venue.priceRange}
          </span>
          {venue.cuisines.map((c) => (
            <span
              key={c}
              className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-neutral-200 text-[10px] font-semibold hidden sm:inline-block"
            >
              {c}
            </span>
          ))}
        </div>
      </Link>

      {/* 2. Venue Metadata & Supported Service Modes */}
      <div className="p-4 flex flex-col justify-between flex-1 gap-3">
        <div>
          {/* Title and Rating Row */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link href={targetHref} className="hover:underline">
                <h3 className="font-black text-base sm:text-lg text-neutral-900 tracking-tight leading-snug">
                  {venue.name}
                </h3>
              </Link>
              <p className="text-xs text-neutral-500 font-medium line-clamp-1 mt-0.5">
                {venue.tagline}
              </p>
            </div>

            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f9b318] text-white text-xs font-black shrink-0 shadow-xs">
              <Star className="w-3 h-3 text-white fill-white" />
              <span>{venue.rating}</span>
            </div>
          </div>

          {/* Neighborhood & Address */}
          <div className="flex items-center gap-1 text-xs text-neutral-500 font-medium mt-2">
            <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span className="truncate">{venue.address}</span>
          </div>

          {/* Supported Modes Badges (Only what the venue genuinely supports) */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            {venue.supportedModes.includes("REMOTE") && (
              <span className="px-2.5 py-1 rounded-full bg-orange-50 text-[#fd8535] text-[10px] font-extrabold border border-orange-200/60 flex items-center gap-1">
                <Utensils className="w-3 h-3 text-[#fd8535]" />
                <span>Counter Pickup</span>
              </span>
            )}
            {venue.supportedModes.includes("IN_VENUE") && (
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#1546d9] text-[10px] font-extrabold border border-blue-200/60 flex items-center gap-1">
                <QrCode className="w-3 h-3 text-[#1546d9]" />
                <span>Table QR Dine-In</span>
              </span>
            )}
          </div>

          {/* Actual Menu Items Preview */}
          <div className="mt-3 pt-3 border-t border-neutral-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              Popular Specialties
            </p>
            <div className="flex flex-wrap gap-1.5">
              {venue.featuredDishes.map((dish) => (
                <span
                  key={dish}
                  className="px-2 py-1 rounded-xl bg-neutral-50 text-neutral-700 text-[11px] font-semibold border border-neutral-200/60"
                >
                  {dish}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Action CTAs (Honest availability handling) */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
          {venue.isOpen ? (
            <>
              <div className="text-[11px] text-neutral-400 font-medium">
                {venue.reviewsCount} reviews
              </div>

              <div className="flex items-center gap-2">
                {venue.supportedModes.includes("IN_VENUE") && (
                  <Link
                    href={`/${venue.slug}?mode=in_venue`}
                    className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1546d9] text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <span>Dine-In</span>
                  </Link>
                )}
                <Link
                  href={targetHref}
                  className="px-4 py-2 rounded-xl bg-neutral-950 hover:bg-[#fd8535] text-white text-xs font-extrabold transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
                >
                  <span>Order Pickup</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </>
          ) : (
            <>
              <span className="text-[11px] font-bold text-neutral-400">
                Kitchen currently closed
              </span>
              <Link
                href={targetHref}
                className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <span>Preview Menu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
