"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, MapPin, Clock, ArrowRight, Utensils, QrCode, Heart, Sparkles } from "lucide-react";
import type { VenueRegistryItem } from "@/lib/domain/venue/venueRegistry";
import type { OrderingMode } from "@/lib/mockData";
import { TableQrScannerSheet } from "@/components/customer/TableQrScannerSheet";
import { useVenueFavoriteStore } from "@/lib/store/venueFavoriteStore";

interface VenueRegistryCardProps {
  venue: VenueRegistryItem;
  preferredMode?: OrderingMode | "ALL";
  variant?: "standard" | "compact" | "carousel";
}

export function VenueRegistryCard({
  venue,
  preferredMode = "ALL",
  variant = "compact",
}: VenueRegistryCardProps) {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const isFavorite = useVenueFavoriteStore((s) => s.isFavorite(venue.id));
  const toggleFavorite = useVenueFavoriteStore((s) => s.toggleFavorite);

  // Determine target entry mode based on what the venue actually supports
  const resolvedMode: OrderingMode =
    preferredMode === "IN_VENUE" && venue.supportedModes.includes("IN_VENUE")
      ? "IN_VENUE"
      : venue.supportedModes.includes("REMOTE")
      ? "REMOTE"
      : venue.supportedModes[0] || "REMOTE";

  const targetHref = `/${venue.slug}?mode=${resolvedMode === "IN_VENUE" ? "in_venue" : "remote"}`;

  if (variant === "carousel") {
    return (
      <article className="group rounded-2xl bg-white border border-neutral-200/80 shadow-xs hover:border-[#fd8535]/50 hover:shadow-md transition-all duration-200 overflow-hidden w-[265px] sm:w-[285px] shrink-0 snap-start flex flex-col justify-between select-none">
        {/* Top: 16:10 Cover Photo with floating status, favorite toggle, and price pill */}
        <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-neutral-900 block">
          <Link href={targetHref} className="block w-full h-full">
            <img
              src={venue.coverImageUrl}
              alt={venue.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          </Link>

          {/* Top-Left: Availability cue */}
          <div className="absolute top-2 left-2 pointer-events-none">
            {venue.isOpen ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>Open Now</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-neutral-900/90 backdrop-blur-md text-amber-300 border border-amber-400/30 text-[9px] font-black uppercase tracking-wider shadow-xs">
                Closed
              </span>
            )}
          </div>

          {/* Top-Right: Favorite Heart Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(venue.id);
            }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-all active:scale-90 cursor-pointer shadow-xs border border-white/10"
            title={isFavorite ? "Remove from favorites" : "Save to favorites"}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                isFavorite ? "fill-[#fd8535] text-[#fd8535]" : "text-white"
              }`}
            />
          </button>

          {/* Bottom-Left: Price Range Badge */}
          <div className="absolute bottom-2 left-2 pointer-events-none">
            <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[9px] font-bold border border-white/10">
              {venue.priceRange}
            </span>
          </div>

          {/* Bottom-Right: Prep Lead Time */}
          <div className="absolute bottom-2 right-2 pointer-events-none">
            <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[9px] font-bold border border-white/10 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-neutral-300" />
              <span>{venue.prepLeadMinutes}m</span>
            </span>
          </div>
        </div>

        {/* Card Body: Information, Rating, Perks & Actions */}
        <div className="p-3 flex-1 flex flex-col justify-between gap-2.5">
          <div className="space-y-1">
            {/* Title & Star Rating Badge */}
            <div className="flex items-start justify-between gap-1.5">
              <Link href={targetHref} className="hover:underline flex-1 min-w-0">
                <h4 className="font-extrabold text-sm text-neutral-900 truncate group-hover:text-[#fd8535] transition-colors leading-snug">
                  {venue.name}
                </h4>
              </Link>
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#f9b318] text-white text-[10px] font-black shrink-0 shadow-2xs">
                <Star className="w-2.5 h-2.5 fill-white text-white" />
                <span>{venue.rating}</span>
              </div>
            </div>

            {/* Direct Kitchen Perk Tag (matches Uber One benefits style from screenshot) */}
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#fd8535]">
              <Sparkles className="w-3 h-3 text-[#fd8535] shrink-0" />
              <span className="truncate">Direct Kitchen • 0% Markup</span>
            </div>

            {/* Distance & Area */}
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium">
              <span>{venue.distance}</span>
              <span>•</span>
              <span className="truncate">{venue.neighborhood.split(",")[0]}</span>
            </div>
          </div>

          {/* Modes & Action Row */}
          <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-neutral-100">
            <div className="flex items-center gap-1">
              {venue.supportedModes.includes("REMOTE") && (
                <span className="px-1.5 py-0.5 rounded-md bg-orange-50 text-[#fd8535] text-[9px] font-bold border border-orange-200/50">
                  Pickup
                </span>
              )}
              {venue.supportedModes.includes("IN_VENUE") && (
                <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-[#1546d9] text-[9px] font-bold border border-blue-200/50">
                  Table QR
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {venue.supportedModes.includes("IN_VENUE") && venue.isOpen && (
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="p-1 rounded-lg text-[#1546d9] hover:bg-blue-50 transition-colors cursor-pointer"
                  title="Scan Table QR"
                >
                  <QrCode className="w-3.5 h-3.5" />
                </button>
              )}
              <Link
                href={targetHref}
                className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-[#fd8535] text-white text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs active:scale-95"
              >
                <span>{venue.isOpen ? "Order" : "Menu"}</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>
          </div>
        </div>

        <TableQrScannerSheet
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          tenantSlug={venue.slug}
          venueName={venue.name}
        />
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="group rounded-2xl bg-white border border-neutral-200/80 shadow-xs hover:border-[#fd8535]/50 hover:shadow-md transition-all duration-200 overflow-hidden p-3 flex gap-3 items-center">
        {/* Left: Compact Cover Image */}
        <Link href={targetHref} className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-neutral-900 block">
          <img
            src={venue.coverImageUrl}
            alt={venue.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Open/Closed indicator */}
          <div className="absolute top-1.5 left-1.5">
            {venue.isOpen ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white/80 block animate-pulse" title="Open Now" />
            ) : (
              <span className="px-1.5 py-0.5 rounded bg-neutral-900/90 text-amber-300 text-[8px] font-black uppercase tracking-wider block">
                Closed
              </span>
            )}
          </div>

          {/* Price Range */}
          <div className="absolute bottom-1.5 left-1.5">
            <span className="px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[9px] font-bold border border-white/10">
              {venue.priceRange}
            </span>
          </div>
        </Link>

        {/* Right: Venue Information & CTAs */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 self-stretch">
          <div>
            {/* Title & Rating */}
            <div className="flex items-start justify-between gap-1.5">
              <Link href={targetHref} className="hover:underline flex-1 min-w-0">
                <h4 className="font-extrabold text-sm text-neutral-900 truncate group-hover:text-[#fd8535] transition-colors leading-snug">
                  {venue.name}
                </h4>
              </Link>
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#f9b318] text-white text-[10px] font-black shrink-0 shadow-2xs">
                <Star className="w-2.5 h-2.5 text-white fill-white" />
                <span>{venue.rating}</span>
              </div>
            </div>

            {/* Distance • Prep Lead */}
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium mt-1">
              <span>{venue.distance}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5 text-neutral-400" />
                <span>{venue.prepLeadMinutes}m</span>
              </span>
            </div>

            {/* Cuisine tags */}
            <p className="text-[11px] text-neutral-400 truncate mt-0.5 font-normal">
              {venue.cuisines.join(" • ")}
            </p>
          </div>

          {/* Modes & Action Row */}
          <div className="flex items-center justify-between gap-1.5 mt-2 pt-1.5 border-t border-neutral-100">
            <div className="flex items-center gap-1">
              {venue.supportedModes.includes("REMOTE") && (
                <span className="px-1.5 py-0.5 rounded-md bg-orange-50 text-[#fd8535] text-[9px] font-bold border border-orange-200/50">
                  Pickup
                </span>
              )}
              {venue.supportedModes.includes("IN_VENUE") && (
                <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-[#1546d9] text-[9px] font-bold border border-blue-200/50">
                  Table QR
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {venue.supportedModes.includes("IN_VENUE") && venue.isOpen && (
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="p-1 rounded-lg text-[#1546d9] hover:bg-blue-50 transition-colors cursor-pointer"
                  title="Scan Table QR"
                >
                  <QrCode className="w-3.5 h-3.5" />
                </button>
              )}
              <Link
                href={targetHref}
                className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-[#fd8535] text-white text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs active:scale-95"
              >
                <span>Order</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>
          </div>
        </div>

        <TableQrScannerSheet
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          tenantSlug={venue.slug}
          venueName={venue.name}
        />
      </article>
    );
  }

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
                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1546d9] text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Dine-In</span>
                  </button>
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

      <TableQrScannerSheet
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        tenantSlug={venue.slug}
        venueName={venue.name}
      />
    </article>
  );
}
