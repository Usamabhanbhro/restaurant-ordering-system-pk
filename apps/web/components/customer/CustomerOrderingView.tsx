"use client";

import { useState, useRef, useEffect, useMemo, type UIEvent } from "react";
import Link from "next/link";
// Imports without Lucide icons
import { SplashScreen } from "@/components/splash/SplashScreen";
import { HeroHeader } from "@/components/customer/HeroHeader";
import { JellyRadio } from "@/components/customer/JellyRadio";
import { TableQrScannerSheet } from "@/components/customer/TableQrScannerSheet";
import { FeaturedSpotlightCard } from "@/components/customer/FeaturedSpotlightCard";
import { PopularHorizontalShelf } from "@/components/customer/PopularHorizontalShelf";
import { CategoryCarousel } from "@/components/customer/CategoryCarousel";
import { FoodCard } from "@/components/customer/FoodCard";
import { ItemCustomizerSheet } from "@/components/customer/ItemCustomizerSheet";
import { CartDrawer } from "@/components/customer/CartDrawer";
import { CustomerAuthSheet } from "@/components/customer/CustomerAuthSheet";
import { OrderProgressTracker } from "@/components/customer/OrderProgressTracker";
import { PerksTab } from "@/components/customer/PerksTab";
import { ProfileTab } from "@/components/customer/ProfileTab";
import { FloatingBottomDock, type NavTabId } from "@/components/customer/FloatingBottomDock";

import {
  MOCK_CATEGORIES,
  MOCK_ITEMS,
  type MenuItemData,
  type OrderingMode,
  type TableContext,
} from "@/lib/mockData";
import { useTenantCart } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";
import { useTenantOrders, useOrderStore } from "@/lib/store/orderStore";
import { useTenant } from "@/lib/tenant/TenantContext";
import { toVenueViewModel } from "@/lib/domain/venue/venueViewModel";
import { OrderingModeProvider } from "@/lib/domain/ordering/OrderingModeContext";
import { useMenu } from "@/lib/hooks/useMenu";
import { toMenuItemViewModel, toCategoryViewModel } from "@/lib/domain/menu/menuViewModel";
import { getRegistryVenueBySlug, VENUE_REGISTRY } from "@/lib/domain/venue/venueRegistry";

export interface CustomerOrderingViewProps {
  tenantSlug: string;
  initialMode?: OrderingMode;
  tableContext?: TableContext | null;
}

export function CustomerOrderingView({
  tenantSlug,
  initialMode = "REMOTE",
  tableContext: defaultTableContext,
}: CustomerOrderingViewProps) {
  // Registry info for multi-tenant awareness
  const registryVenue = useMemo(
    () => getRegistryVenueBySlug(tenantSlug),
    [tenantSlug]
  );
  const supportedModes = registryVenue?.supportedModes ?? ["REMOTE", "IN_VENUE"];
  const isMultiMode = supportedModes.length > 1;
  const isVenueOpen = registryVenue?.isOpen ?? true;

  // Resolve initial mode against supported modes
  const resolvedInitialMode = supportedModes.includes(initialMode)
    ? initialMode
    : supportedModes[0] || "REMOTE";

  // Mode state: Remote vs In-Venue (Table QR)
  const [mode, setMode] = useState<OrderingMode>(resolvedInitialMode);
  const [tableContext, setTableContext] = useState<TableContext | null>(
    resolvedInitialMode === "IN_VENUE"
      ? (defaultTableContext || { zoneSlug: "indoor-main", tableNumber: "04", zoneName: "Indoor Main" })
      : null
  );

  // Splash Screen State (shown once per session; will not replay on back navigation)
  const [showSplash, setShowSplash] = useState(false);
  const [splashExiting, setSplashExiting] = useState(false);

  useEffect(() => {
    try {
      const hasSeen = sessionStorage.getItem("queueless_splash_shown");
      if (!hasSeen) {
        setShowSplash(true);
      }
    } catch {
      // In private browsing or storage-restricted contexts
    }
  }, []);

  // Navigation & Category Filtering
  const [activeTab, setActiveTab] = useState<NavTabId>("menu");
  const [selectedCategory, setSelectedCategory] = useState("cat-popular");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Sheets
  const [customizingItem, setCustomizingItem] = useState<MenuItemData | null>(null);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

  // Stores & Tenant Context
  const { venue } = useTenant();
  const venueVm = toVenueViewModel(venue);
  const { itemCount: cartItemCount, subtotal: cartSubtotal } = useTenantCart();
  const { currentUser, pendingPostAuthAction, setPendingPostAuthAction } = useAuthStore();
  const { placeOrder, cancelOrder, getActiveOrder } = useTenantOrders();
  const ordersByTenant = useOrderStore((s) => s.ordersByTenant);
  const [selectedTrackedOrderId, setSelectedTrackedOrderId] = useState<string | null>(null);

  // Cross-Venue Shared Order Tracker Store
  const allCrossVenueOrders = useMemo(() => {
    return Object.entries(ordersByTenant).flatMap(([slug, orders]) => {
      const v = VENUE_REGISTRY.find((venue) => venue.slug === slug);
      return orders.map((o) => ({
        ...o,
        tenantSlug: slug,
        venueName: v?.name ?? (slug === tenantSlug ? venueVm.name : slug),
      }));
    });
  }, [ordersByTenant, tenantSlug, venueVm.name]);

  const activeCrossVenueOrders = useMemo(() => {
    return allCrossVenueOrders.filter((o) => {
      const isActive = o.state !== "SERVED" && o.state !== "VOIDED";
      if (currentUser?.email) {
        return isActive && o.customerEmail === currentUser.email;
      }
      return isActive;
    });
  }, [allCrossVenueOrders, currentUser?.email]);

  // Venue Status / 86 State
  const [venue86List] = useState<Record<string, boolean>>({});
  const remoteOrdersPaused = !isVenueOpen || Boolean(venue.isOrderingPaused);

  // Scroll Direction Awareness for Bottom Dock (Floating Pill vs Docked Bar)
  const [isFloatingNav, setIsFloatingNav] = useState(true);
  const lastScrollTop = useRef(0);

  // Active Order lookup: In-Venue orders resolve by table/session, Remote orders resolve by account email
  const activeOrder = getActiveOrder(
    currentUser?.email,
    mode === "IN_VENUE" ? tableContext : null
  );

  const displayedTrackedOrder = useMemo(() => {
    if (selectedTrackedOrderId) {
      const found = allCrossVenueOrders.find((o) => o.id === selectedTrackedOrderId);
      if (found) return found;
    }
    if (activeOrder) {
      const found = allCrossVenueOrders.find((o) => o.id === activeOrder.id);
      if (found) return found;
      return {
        ...activeOrder,
        tenantSlug,
        venueName: venueVm.name,
      };
    }
    return activeCrossVenueOrders[0] ?? null;
  }, [selectedTrackedOrderId, allCrossVenueOrders, activeOrder, activeCrossVenueOrders, tenantSlug, venueVm.name]);

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

  const handleDismissSplash = () => {
    if (splashExiting) return;
    setSplashExiting(true);
    try {
      sessionStorage.setItem("queueless_splash_shown", "true");
    } catch {
      // Ignore storage errors
    }
    setTimeout(() => {
      setShowSplash(false);
      setSplashExiting(false);
    }, 360);
  };

  const handleReplaySplash = () => {
    setSplashExiting(false);
    setShowSplash(true);
  };

  const handleToggleMode = (newMode: OrderingMode) => {
    if (!supportedModes.includes(newMode)) return;
    if (newMode === "IN_VENUE" && !tableContext) {
      setIsQrScannerOpen(true);
      return;
    }
    setMode(newMode);
    if (newMode === "REMOTE" && !defaultTableContext) {
      setTableContext(null);
    }
  };

  // Domain Menu Data
  const { categories: apiCategories, items: apiItems } = useMenu();

  const allCategories = useMemo(
    () => (apiCategories.length > 0 ? apiCategories.map(toCategoryViewModel) : MOCK_CATEGORIES),
    [apiCategories]
  );

  const allMenuItems = useMemo(
    () => (apiItems.length > 0 ? apiItems.map(toMenuItemViewModel) : MOCK_ITEMS),
    [apiItems]
  );

  // Scoped menu items: filtered to venue itemIds (or all items if unspecified)
  const menuItems = useMemo(() => {
    if (registryVenue?.itemIds && registryVenue.itemIds.length > 0) {
      const idSet = new Set(registryVenue.itemIds);
      return allMenuItems.filter((it) => idSet.has(it.id));
    }
    return allMenuItems;
  }, [allMenuItems, registryVenue]);

  // Scoped categories: filtered to categories present in menu items + Popular & All
  const categories = useMemo(() => {
    const presentCategoryIds = new Set(menuItems.map((it) => it.categoryId));
    return allCategories.filter(
      (cat) =>
        cat.id === "cat-popular" ||
        cat.id === "cat-all" ||
        cat.id === "all" ||
        presentCategoryIds.has(cat.id)
    );
  }, [allCategories, menuItems]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((it) => {
      if (searchQuery.trim()) {
        return (
          it.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          it.nameRomanUrdu.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      if (selectedCategory === "cat-popular") return it.popular;
      if (selectedCategory === "cat-all" || selectedCategory === "all") return true;
      return it.categoryId === selectedCategory;
    });
  }, [menuItems, searchQuery, selectedCategory]);

  // Featured Signature Dish & Popular favorites for home discovery
  const featuredItem = useMemo(() => {
    if (registryVenue?.signatureItemId) {
      const match = menuItems.find((it) => it.id === registryVenue.signatureItemId);
      if (match) return match;
    }
    return menuItems.find((it) => it.popular) || menuItems[0];
  }, [menuItems, registryVenue]);

  const popularItems = useMemo(() => {
    return menuItems.filter((it) => it.popular);
  }, [menuItems]);

  return (
    <OrderingModeProvider mode={mode} tableContext={tableContext}>
      <div className="min-h-screen bg-[#FFFBF8] text-neutral-900 flex justify-center">
        {/* Mobile Shell constrained to max-w-md */}
        <main className="w-full max-w-md bg-[#FFFBF8] flex flex-col relative h-screen shadow-2xl overflow-hidden">
          {/* 1. Opening Splash Screen */}
          {showSplash && (
            <SplashScreen isExiting={splashExiting} onDismiss={handleDismissSplash} />
          )}

          {/* 2. Scrollable Body Container */}
          <div
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto no-scrollbar pb-36 relative"
          >
            {/* Top Hero Banner (Hidden on Profile view per feedback) */}
            {activeTab !== "profile" ? (
              <HeroHeader
                venue={venueVm}
              remoteOrdersPaused={remoteOrdersPaused}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectTab={setActiveTab}
              onOpenCart={() => setShowCartDrawer(true)}
              showSearch={activeTab === "menu"}
              showCart={activeTab === "menu"}
              mode={mode}
              tableContext={tableContext}
            />
          ) : (
            <header className="px-5 pt-8 pb-1">
              <h1 className="text-xl font-black text-neutral-900 tracking-tight">Profile</h1>
              <p className="text-xs text-neutral-500 font-medium">Manage your personal account and preferences</p>
            </header>
          )}

          {/* Architecture Mode Selector Bar */}
          {activeTab === "menu" && !defaultTableContext && (
            <div className="px-4 pt-1.5 pb-1 flex items-center justify-center gap-2">
              {isMultiMode ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleToggleMode("REMOTE")}
                    className={`h-8 px-4 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                      mode === "REMOTE"
                        ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                        : "bg-white text-neutral-600 border-neutral-200/90 hover:border-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    <span>Counter Pickup</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleMode("IN_VENUE")}
                    className={`h-8 px-4 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                      mode === "IN_VENUE"
                        ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                        : "bg-white text-neutral-600 border-neutral-200/90 hover:border-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    <span>Table QR Dine-In</span>
                  </button>
                </>
              ) : (
                <div className="h-7 px-3.5 rounded-full bg-neutral-100 text-center text-xs font-semibold text-neutral-600 flex items-center">
                  {mode === "REMOTE" ? "Counter Pickup Only" : "Table QR Only"}
                </div>
              )}
            </div>
          )}

          {/* Active In-Venue Table Status Bar */}
          {activeTab === "menu" && mode === "IN_VENUE" && tableContext && (
            <div className="mx-4 mt-2 p-3 rounded-2xl bg-blue-50/90 border border-blue-200/90 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1546d9] animate-pulse shrink-0" />
                <div>
                  <h4 className="text-xs font-black text-[#1546d9]">
                    Table {tableContext.tableNumber} • {tableContext.zoneName || "Indoor Main"} Active
                  </h4>
                  <p className="text-[10px] text-neutral-500 font-medium">
                    Orders delivered directly to your table. No queueing required.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQrScannerOpen(true)}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-blue-100 text-[#1546d9] text-[11px] font-bold border border-blue-200 cursor-pointer transition-colors shrink-0"
              >
                Change
              </button>
            </div>
          )}

          {/* Honest Closed State Notice Banner */}
          {activeTab === "menu" && !isVenueOpen && (
            <div className="mx-4 mt-2 p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 shadow-xs space-y-2">
              <div className="flex items-start gap-2.5">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-black text-amber-900 tracking-tight">
                    Kitchen Currently Closed • {registryVenue?.openStatusText || "Closed"}
                  </h3>
                  <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                    Operating hours: {registryVenue?.operatingHours || "Closed"}. Menu is available for preview. Direct ordering and checkout will resume when the kitchen opens.
                  </p>
                </div>
              </div>
              <div className="pt-1 flex items-center justify-end">
                <Link
                  href="/"
                  className="px-3 py-1.5 rounded-xl bg-amber-900 hover:bg-amber-950 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
                >
                  <span>Explore Open Partner Venues</span>
                </Link>
              </div>
            </div>
          )}

          {/* TAB 1: MENU CATALOG / DISCOVERY HOME SCREEN */}
          {activeTab === "menu" && (
            <div className="space-y-4 pt-1">
              {/* Discovery Home Shelf & Spotlight (Visible on Popular/All views when not searching) */}
              {!searchQuery.trim() && (selectedCategory === "cat-popular" || selectedCategory === "cat-all") && (
                <>
                  {featuredItem && (
                    <FeaturedSpotlightCard
                      item={featuredItem}
                      onCustomize={setCustomizingItem}
                    />
                  )}

                  {popularItems.length > 0 && (
                    <PopularHorizontalShelf
                      items={popularItems}
                      venue86List={venue86List}
                      onCustomize={setCustomizingItem}
                      onSeeAllPopular={() => setSelectedCategory("cat-popular")}
                    />
                  )}
                </>
              )}

              {/* 3. Category Filter Carousel Pills & Section Heading */}
              <div className="space-y-2">
                <div className="px-4 flex items-center justify-between">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">
                    {searchQuery.trim()
                      ? `Search Results`
                      : selectedCategory === "cat-popular"
                      ? "Explore All Popular"
                      : selectedCategory === "cat-all"
                      ? "Full Menu"
                      : (categories.find((c) => c.id === selectedCategory)?.name || "Menu")}
                  </h2>
                  <span className="text-[11px] font-bold text-neutral-400">
                    {filteredItems.length} {filteredItems.length === 1 ? "dish" : "dishes"}
                  </span>
                </div>

                <CategoryCarousel
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              </div>

              {/* 4. Food Item Cards List */}
              <section className="px-4 space-y-3">
                {filteredItems.map((item) => (
                  <FoodCard
                    key={item.id}
                    item={item}
                    is86ed={Boolean(venue86List[item.id])}
                    onCustomize={setCustomizingItem}
                  />
                ))}

                {filteredItems.length === 0 && (
                  <div className="p-8 text-center bg-white rounded-3xl border border-neutral-200/80 shadow-soft">
                    <p className="text-xs font-bold text-neutral-500">
                      No menu items found for &quot;{searchQuery}&quot;
                    </p>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TAB 2: PERKS & REWARDS */}
          {activeTab === "perks" && <PerksTab />}

          {/* TAB 3: ORDER PROGRESS TRACKER (Shared Multi-Venue with Order Tabs) */}
          {activeTab === "status" && (
            <OrderProgressTracker
              activeOrder={displayedTrackedOrder}
              onCancelOrder={cancelOrder}
              onBrowseMenu={() => setActiveTab("menu")}
              allOrders={activeCrossVenueOrders.length > 0 ? activeCrossVenueOrders : allCrossVenueOrders.slice(0, 5)}
              selectedOrderId={displayedTrackedOrder?.id}
              onSelectOrder={setSelectedTrackedOrderId}
              historyOrders={allCrossVenueOrders}
            />
          )}

          {/* TAB 4: USER PROFILE & HISTORY */}
          {activeTab === "profile" && (
            <ProfileTab
              onReplaySplash={handleReplaySplash}
              mode={mode}
              tableContext={tableContext}
            />
          )}
        </div>

        {/* 3. Dynamic Bottom Navigation Dock & Floating Cart Capsule */}
        <FloatingBottomDock
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          cartItemCount={cartItemCount}
          cartSubtotal={cartSubtotal}
          onOpenCart={() => setShowCartDrawer(true)}
          isFloatingNav={isFloatingNav}
          hasActiveOrder={Boolean(activeOrder || activeCrossVenueOrders.length > 0)}
        />

        {/* 4. Bottom Sheets & Modals */}
        {/* Table QR Scanner Sheet */}
        <TableQrScannerSheet
          isOpen={isQrScannerOpen}
          onClose={() => setIsQrScannerOpen(false)}
          tenantSlug={tenantSlug}
          venueName={venueVm.name}
          onTableSelected={(table) => {
            setTableContext(table);
            setMode("IN_VENUE");
            setIsQrScannerOpen(false);
          }}
        />

        {/* Item Customizer Sheet */}
        <ItemCustomizerSheet
          item={customizingItem}
          isOpen={Boolean(customizingItem)}
          onClose={() => setCustomizingItem(null)}
        />

        {/* Cart & Checkout Drawer */}
        <CartDrawer
          venue={venueVm}
          isOpen={showCartDrawer}
          onClose={() => setShowCartDrawer(false)}
          onSelectTab={setActiveTab}
          mode={mode}
          tableContext={tableContext}
        />

        {/* Customer Auth & Onboarding Sheet (Only triggered in Remote Mode) */}
        <CustomerAuthSheet
          onAuthSuccess={() => {
            if (pendingPostAuthAction === "CHECKOUT") {
              setPendingPostAuthAction(null);
              setShowCartDrawer(true);
            }
          }}
        />
      </main>
    </div>
  </OrderingModeProvider>
);
}
