"use client";

import { useState, useRef, useEffect, useMemo, type UIEvent } from "react";
import Link from "next/link";
import {
  MapPin,
  ChevronDown,
  Sparkles,
  Utensils,
  QrCode,
  RotateCcw,
  Store,
  ShieldCheck,
  Check,
  Flame,
} from "lucide-react";
import {
  VENUE_REGISTRY,
  CITY_REGISTRY,
  type CityName,
  type VenueRegistryItem,
} from "@/lib/domain/venue/venueRegistry";
import { useFilteredVenues } from "@/lib/domain/venue/useFilteredVenues";
import { VenueRegistryCard } from "@/components/customer/VenueRegistryCard";
import { PlatformBottomDock, type HomeDockTabId } from "@/components/customer/PlatformBottomDock";
import { OrderProgressTracker } from "@/components/customer/OrderProgressTracker";
import { ProfileTab } from "@/components/customer/ProfileTab";
import { CustomerAuthSheet } from "@/components/customer/CustomerAuthSheet";
import { TableQrScannerSheet } from "@/components/customer/TableQrScannerSheet";
import { SplashScreen } from "@/components/splash/SplashScreen";
import { useOrderStore } from "@/lib/store/orderStore";
import { useAuthStore } from "@/lib/store/authStore";
import { CUISINE_SHORTCUTS } from "@/lib/mockData";
import type { OrderingMode } from "@/lib/mockData";

export function PlatformHomeView() {
  const [selectedCity, setSelectedCity] = useState<CityName | "ALL">("Karachi");
  const [selectedHub, setSelectedHub] = useState<string | "ALL">("ALL");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModeFilter, setSelectedModeFilter] = useState<"ALL" | OrderingMode>("ALL");
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);

  // Discovery Dock navigation state
  const [activeHomeTab, setActiveHomeTab] = useState<HomeDockTabId>("venues");
  const [isFloatingNav, setIsFloatingNav] = useState(true);
  const [isPlatformScannerOpen, setIsPlatformScannerOpen] = useState(false);
  const lastScrollTop = useRef(0);

  // Extensible composable filter pipeline
  const filteredVenues = useFilteredVenues(VENUE_REGISTRY, {
    city: selectedCity,
    hub: selectedHub,
    searchQuery,
    modeFilter: selectedModeFilter,
    onlyOpenNow,
    cuisine: selectedCuisine,
  });

  // Splash Screen State (shown once per session on platform home)
  const [showSplash, setShowSplash] = useState(false);
  const [splashExiting, setSplashExiting] = useState(false);

  useEffect(() => {
    try {
      const hasSeen = sessionStorage.getItem("queueless_platform_splash_shown");
      if (!hasSeen) {
        setShowSplash(true);
      }
    } catch {
      // In private browsing or storage-restricted contexts
    }
  }, []);

  const handleDismissSplash = () => {
    if (splashExiting) return;
    setSplashExiting(true);
    try {
      sessionStorage.setItem("queueless_platform_splash_shown", "true");
    } catch {
      // Storage restricted
    }
    setTimeout(() => {
      setShowSplash(false);
      setSplashExiting(false);
    }, 400);
  };

  // Multi-venue order tracking
  const ordersByTenant = useOrderStore((s) => s.ordersByTenant);
  const cancelOrder = useOrderStore((s) => s.cancelOrder);
  const currentUser = useAuthStore((s) => s.currentUser);
  const [selectedActiveOrderId, setSelectedActiveOrderId] = useState<string | null>(null);

  const allVenueOrders = useMemo(() => {
    return Object.entries(ordersByTenant).flatMap(([tenantSlug, orders]) => {
      const v = VENUE_REGISTRY.find((venue) => venue.slug === tenantSlug);
      return orders.map((o) => ({
        ...o,
        tenantSlug,
        venueName: v?.name ?? tenantSlug,
      }));
    });
  }, [ordersByTenant]);

  const activeVenueOrders = useMemo(() => {
    return allVenueOrders.filter((o) => {
      const isActiveState =
        o.state !== "SERVED" && o.state !== "VOIDED";
      if (currentUser?.email) {
        return isActiveState && o.customerEmail === currentUser.email;
      }
      return isActiveState;
    });
  }, [allVenueOrders, currentUser?.email]);

  const currentTrackedOrder = useMemo(() => {
    if (activeVenueOrders.length === 0) return null;
    if (selectedActiveOrderId) {
      const found = activeVenueOrders.find((o) => o.id === selectedActiveOrderId);
      if (found) return found;
    }
    return activeVenueOrders[0] ?? null;
  }, [activeVenueOrders, selectedActiveOrderId]);

  // Group venues by cuisine type for vertical sliding layout
  const cuisineGroups = useMemo(() => {
    if (selectedCuisine) {
      return [{ cuisine: selectedCuisine, venues: filteredVenues }];
    }
    const map = new Map<string, VenueRegistryItem[]>();
    filteredVenues.forEach((venue) => {
      const primaryCuisine = venue.cuisines[0] || "Featured Cafes";
      const list = map.get(primaryCuisine) || [];
      list.push(venue);
      map.set(primaryCuisine, list);
    });
    return Array.from(map.entries()).map(([cuisine, venues]) => ({
      cuisine,
      venues,
    }));
  }, [filteredVenues, selectedCuisine]);

  const handleResetFilters = () => {
    setSelectedCity("ALL");
    setSelectedHub("ALL");
    setSearchQuery("");
    setSelectedModeFilter("ALL");
    setOnlyOpenNow(false);
    setSelectedCuisine(null);
  };

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const currentScrollTop = e.currentTarget.scrollTop;
    const delta = currentScrollTop - lastScrollTop.current;

    // Threshold to prevent jitter on tiny sub-pixel scrolls
    if (Math.abs(delta) > 6) {
      if (delta > 0 && currentScrollTop > 30) {
        setIsFloatingNav(false);
      } else if (delta < 0) {
        setIsFloatingNav(true);
      }
    }

    if (currentScrollTop <= 25) {
      setIsFloatingNav(true);
    }

    lastScrollTop.current = currentScrollTop;
  };

  // Determine current active city details
  const activeCityConfig = CITY_REGISTRY.find((c) => c.name === selectedCity);

  // Formatted location display label for top pill
  const locationPillLabel =
    selectedCity === "ALL"
      ? "All Pakistan"
      : selectedHub === "ALL"
      ? `${selectedCity} • All Areas`
      : `${selectedHub}, ${selectedCity}`;

  return (
    <div className="min-h-screen bg-[#FFFBF8] text-neutral-900 flex justify-center">
      {/* Mobile Shell constrained to max-w-md */}
      <main className="w-full max-w-md bg-[#FFFBF8] flex flex-col relative h-screen shadow-2xl overflow-hidden">
        {/* 1. Opening Splash Screen */}
        {showSplash && (
          <SplashScreen isExiting={splashExiting} onDismiss={handleDismissSplash} />
        )}

        {/* Scrollable Container */}
        <div
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto no-scrollbar pb-32 relative"
        >
          {/* 1. Platform Brand Header & Location Selector (Rendered on Venues tab) */}
          {activeHomeTab === "venues" && (
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
                  className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 text-xs font-bold transition-all flex items-center gap-1.5 border border-neutral-200/80 active:scale-95 cursor-pointer max-w-[200px]"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#fd8535] shrink-0" />
                  <span className="truncate">{locationPillLabel}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                </button>
              </div>

              {/* Location Dropdown Modal (Multi-City Selector) */}
              {isLocationModalOpen && (
                <div className="p-3.5 rounded-2xl bg-white border border-neutral-200 shadow-xl space-y-3 animate-fade-in text-xs font-medium">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">
                      Select Your Dining City & Area
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCity("ALL");
                        setSelectedHub("ALL");
                        setIsLocationModalOpen(false);
                      }}
                      className="text-[11px] font-bold text-[#fd8535] hover:underline cursor-pointer"
                    >
                      All Pakistan
                    </button>
                  </div>

                  {/* City Selection Pills (Karachi, Hyderabad, Lahore, Peshawar) */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">
                      Cities
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {CITY_REGISTRY.map((c) => {
                        const isCityActive = selectedCity === c.name;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setSelectedCity(c.name);
                              setSelectedHub("ALL");
                            }}
                            className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                              isCityActive
                                ? "bg-orange-50 text-[#fd8535] border-orange-200 shadow-xs"
                                : "bg-neutral-50 text-neutral-700 border-neutral-200/80 hover:bg-neutral-100"
                            }`}
                          >
                            <span>{c.displayName}</span>
                            {isCityActive && <Check className="w-3.5 h-3.5 text-[#fd8535]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Neighborhood / Campus Drilldown for Active City */}
                  {activeCityConfig && (
                    <div className="space-y-1 pt-1 border-t border-neutral-100">
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">
                          {activeCityConfig.displayName} Dining Hubs
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedHub("ALL");
                            setIsLocationModalOpen(false);
                          }}
                          className={`text-[11px] font-bold cursor-pointer ${
                            selectedHub === "ALL" ? "text-[#fd8535]" : "text-neutral-500 hover:text-neutral-900"
                          }`}
                        >
                          All in {activeCityConfig.displayName}
                        </button>
                      </div>

                      <div className="space-y-1 max-h-48 overflow-y-auto no-scrollbar">
                        {activeCityConfig.hubs.map((hub) => {
                          const isHubActive = selectedHub === hub;
                          return (
                            <button
                              key={hub}
                              type="button"
                              onClick={() => {
                                setSelectedHub(hub);
                                setIsLocationModalOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl transition-colors flex items-center justify-between cursor-pointer ${
                                isHubActive
                                  ? "bg-orange-50 text-[#fd8535] font-bold"
                                  : "hover:bg-neutral-50 text-neutral-700"
                              }`}
                            >
                              <span>{hub}</span>
                              {isHubActive && <span className="w-2 h-2 rounded-full bg-[#fd8535]" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Search Bar Pill */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search partner cafes, burgers, biryani, coffee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-neutral-100/90 border border-neutral-200/80 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#fd8535] shadow-xs placeholder-neutral-400"
                />
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
                  className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all flex items-center cursor-pointer ${
                    selectedModeFilter === "REMOTE"
                      ? "bg-[#fd8535] text-white shadow-xs"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  <span>Counter Pickup</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedModeFilter(
                      selectedModeFilter === "IN_VENUE" ? "ALL" : "IN_VENUE"
                    )
                  }
                  className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all flex items-center cursor-pointer ${
                    selectedModeFilter === "IN_VENUE"
                      ? "bg-[#1546d9] text-white shadow-xs"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  <span>Table QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOnlyOpenNow(!onlyOpenNow)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all flex items-center cursor-pointer ${
                    onlyOpenNow
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  <span>Open Now</span>
                </button>
              </div>
            </header>
          )}

          {/* TAB 1: VENUES DISCOVERY FEED */}
          {activeHomeTab === "venues" && (
            <div className="space-y-4 pt-3 pb-8">
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

              {/* City-Agnostic Hero Banner with Triad Palette & Liquid Glass Styling */}
              {!searchQuery.trim() && !selectedCuisine && (
                <section className="px-4">
                  <div className="relative p-5 rounded-3xl bg-gradient-to-br from-[#18181B] via-[#121215] to-[#09090B] text-white shadow-xl overflow-hidden border border-white/10">
                    {/* Ambient Triad Glow Orbs */}
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#fd8535]/25 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-[#1546d9]/20 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10 space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#f9b318] to-[#fd8535] text-neutral-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                          <Sparkles className="w-3 h-3 fill-neutral-950" />
                          <span>Direct Prep Platform</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold text-neutral-200 border border-white/10">
                          0% Platform Markup
                        </span>
                      </div>

                      {/* Main Value Headline */}
                      <div className="space-y-1">
                        <h3 className="text-lg font-black tracking-tight text-white leading-tight">
                          Skip Counter Lines.{" "}
                          <span className="bg-gradient-to-r from-[#fd8535] via-[#f9b318] to-[#fd8535] bg-clip-text text-transparent">
                            Taste First.
                          </span>
                        </h3>
                        <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                          Pre-order for instant walk-in pickup or scan your table QR for direct dining across partner cafes, artisanal roasteries, and campus dining halls in Pakistan.
                        </p>
                      </div>

                      {/* Triad Feature Chips */}
                      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/10">
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center text-center gap-1">
                          <Utensils className="w-3.5 h-3.5 text-[#fd8535]" />
                          <span className="text-[10px] font-bold text-neutral-200">Express Pickup</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center text-center gap-1">
                          <QrCode className="w-3.5 h-3.5 text-[#1546d9]" />
                          <span className="text-[10px] font-bold text-neutral-200">Table QR Dine-In</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center text-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#f9b318]" />
                          <span className="text-[10px] font-bold text-neutral-200">Direct Kitchen</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Vertically sliding compact venue cards grouped by cuisine */}
              <section className="px-4 space-y-5">
                {cuisineGroups.map(({ cuisine, venues }) => (
                  <div key={cuisine} className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-xs uppercase tracking-wider text-neutral-500">
                        {cuisine}
                      </h3>
                    </div>

                    <div className="space-y-2.5">
                      {venues.map((venue) => (
                        <VenueRegistryCard
                          key={venue.id}
                          venue={venue}
                          preferredMode={selectedModeFilter}
                          variant="compact"
                        />
                      ))}
                    </div>
                  </div>
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
                        Try adjusting your city, mode, cuisine, or search filters.
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
              </section>

              {/* Platform Trust & Compliance Footer */}
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
                  QueueLess Platform v1.2.0 • Karachi, Pakistan
                </p>
              </footer>
            </div>
          )}

          {/* TAB 2: MULTI-VENUE ORDERS TRACKER */}
          {activeHomeTab === "tracker" && (
            <div className="space-y-4 pb-12">
              <header className="px-5 pt-8 pb-1">
                <h1 className="text-xl font-black text-neutral-900 tracking-tight">Active Orders</h1>
                <p className="text-xs text-neutral-500 font-medium">Track your pre-orders and dine-in orders across partner cafes</p>
              </header>

              {/* Multi-venue order switcher pills if more than 1 active order */}
              {activeVenueOrders.length > 1 && (
                <div className="px-4 pt-1 flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {activeVenueOrders.map((ord) => {
                    const isSelected = ord.id === currentTrackedOrder?.id;
                    return (
                      <button
                        key={ord.id}
                        type="button"
                        onClick={() => setSelectedActiveOrderId(ord.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#fd8535] text-white shadow-xs"
                            : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
                        }`}
                      >
                        <span>{ord.venueName} • {ord.code}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Active venue context indicator if order active */}
              {currentTrackedOrder && (
                <div className="px-5 pt-1 flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-500">
                    Venue: <strong className="text-neutral-900">{currentTrackedOrder.venueName}</strong>
                  </span>
                  <Link
                    href={`/${currentTrackedOrder.tenantSlug}`}
                    className="font-bold text-[#fd8535] hover:underline"
                  >
                    View Cafe
                  </Link>
                </div>
              )}

              <OrderProgressTracker
                activeOrder={currentTrackedOrder}
                onCancelOrder={(id) => {
                  if (currentTrackedOrder) {
                    cancelOrder(id, currentTrackedOrder.tenantSlug);
                  }
                }}
                onBrowseMenu={() => setActiveHomeTab("venues")}
              />
            </div>
          )}

          {/* TAB 3: CUSTOMER PROFILE */}
          {activeHomeTab === "profile" && (
            <div className="pb-12">
              <header className="px-5 pt-8 pb-1">
                <h1 className="text-xl font-black text-neutral-900 tracking-tight">Profile</h1>
                <p className="text-xs text-neutral-500 font-medium">Manage your personal account and preferences</p>
              </header>
              <div className="p-4 pt-2">
                <ProfileTab
                  mode="REMOTE"
                  onReplaySplash={() => {
                    setShowSplash(true);
                    setSplashExiting(false);
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Discovery Bottom Dock */}
        <PlatformBottomDock
          activeTab={activeHomeTab}
          onSelectTab={(tab) => {
            if (tab === "scan") {
              setIsPlatformScannerOpen(true);
              return;
            }
            setActiveHomeTab(tab);
          }}
          isFloatingNav={isFloatingNav}
        />

        {/* Platform Table QR Scanner Sheet */}
        <TableQrScannerSheet
          isOpen={isPlatformScannerOpen}
          onClose={() => setIsPlatformScannerOpen(false)}
          tenantSlug={filteredVenues[0]?.slug ?? "burns-road-cafe"}
          venueName={filteredVenues[0]?.name ?? "Partner Cafe"}
        />

        {/* Customer Auth Sheet for Profile sign-in */}
        <CustomerAuthSheet
          onAuthSuccess={() => {}}
        />
      </main>
    </div>
  );
}
