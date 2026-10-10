"use client";

import { useState, useRef, type UIEvent } from "react";
import { MapPin } from "lucide-react";
import { SplashScreen } from "@/components/splash/SplashScreen";
import { HeroHeader } from "@/components/customer/HeroHeader";
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
  MOCK_VENUE,
  MOCK_CATEGORIES,
  MOCK_ITEMS,
  type MenuItemData,
  type OrderingMode,
  type TableContext,
} from "@/lib/mockData";
import { useCartStore } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";
import { useOrderStore } from "@/lib/store/orderStore";

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
  // Mode state: Remote vs In-Venue (Table QR)
  const [mode, setMode] = useState<OrderingMode>(initialMode);
  const [tableContext, setTableContext] = useState<TableContext | null>(
    defaultTableContext ||
      (initialMode === "IN_VENUE"
        ? { zoneSlug: "indoor-main", tableNumber: "04", zoneName: "Indoor Main" }
        : null)
  );

  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);
  const [splashExiting, setSplashExiting] = useState(false);

  // Navigation & Category Filtering
  const [activeTab, setActiveTab] = useState<NavTabId>("menu");
  const [selectedCategory, setSelectedCategory] = useState("cat-popular");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Sheets
  const [customizingItem, setCustomizingItem] = useState<MenuItemData | null>(null);
  const [showCartDrawer, setShowCartDrawer] = useState(false);

  // Venue Status / 86 State
  const [venue86List] = useState<Record<string, boolean>>({});
  const [remoteOrdersPaused] = useState(false);

  // Scroll Direction Awareness for Bottom Dock (Floating Pill vs Docked Bar)
  const [isFloatingNav, setIsFloatingNav] = useState(true);
  const lastScrollTop = useRef(0);

  // Stores
  const { getItemCount, getSubtotal } = useCartStore();
  const { currentUser, pendingPostAuthAction, setPendingPostAuthAction } = useAuthStore();
  const { placeOrder, cancelOrder, getActiveOrder } = useOrderStore();

  const cartItemCount = getItemCount();
  const cartSubtotal = getSubtotal();

  // Active Order lookup: In-Venue orders resolve by table/session, Remote orders resolve by account email
  const activeOrder = getActiveOrder(
    currentUser?.email,
    mode === "IN_VENUE" ? tableContext : null
  );

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
    setMode(newMode);
    if (newMode === "IN_VENUE" && !tableContext) {
      setTableContext({
        zoneSlug: "indoor-main",
        tableNumber: "04",
        zoneName: "Indoor Main",
      });
    }
  };

  const filteredItems = MOCK_ITEMS.filter((it) => {
    if (searchQuery.trim()) {
      return (
        it.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        it.nameRomanUrdu.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedCategory === "cat-popular") return it.popular;
    return it.categoryId === selectedCategory;
  });

  return (
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
              venue={MOCK_VENUE}
              remoteOrdersPaused={remoteOrdersPaused}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectTab={setActiveTab}
              onOpenCart={() => setShowCartDrawer(true)}
              showSearch={activeTab === "menu"}
              showCart={activeTab !== "status"}
              mode={mode}
              tableContext={tableContext}
            />
          ) : (
            <header className="px-5 pt-8 pb-1">
              <h1 className="text-xl font-black text-neutral-900 tracking-tight">Profile</h1>
              <p className="text-xs text-neutral-500 font-medium">Manage your personal account and preferences</p>
            </header>
          )}

          {/* Architecture Mode Selector Bar (Enables effortless switching on entry/ordering screen) */}
          {activeTab === "menu" && (
            <>
              <div className="px-4 pt-2">
                <div className="p-1 rounded-2xl bg-neutral-100/90 border border-neutral-200/60 flex items-center gap-1 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => handleToggleMode("REMOTE")}
                    className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                      mode === "REMOTE"
                        ? "bg-white text-neutral-900 shadow-sm"
                        : "text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    <span>Remote Mode</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleMode("IN_VENUE")}
                    className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                      mode === "IN_VENUE"
                        ? "bg-[#1546d9] text-white shadow-sm"
                        : "text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    <span>In-Venue (Table #{tableContext?.tableNumber || "04"})</span>
                  </button>
                </div>
              </div>

              {/* In-Venue Table Context Header */}
              {mode === "IN_VENUE" && (
                <div className="mx-4 mt-2 p-2.5 rounded-2xl bg-blue-50/90 border border-blue-200/80 flex items-center gap-2 text-[11px] text-blue-950 font-bold">
                  <MapPin className="w-3.5 h-3.5 text-[#1546d9]" />
                  <span>Ordering to Table {tableContext?.tableNumber || "04"} ({tableContext?.zoneName || "Indoor Main"})</span>
                </div>
              )}
            </>
          )}

          {/* TAB 1: MENU CATALOG */}
          {activeTab === "menu" && (
            <div className="space-y-3 pt-2">
              {/* Category Carousel Pills */}
              <CategoryCarousel
                categories={MOCK_CATEGORIES}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />

              {/* Food Item Cards List */}
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

          {/* TAB 3: ORDER PROGRESS TRACKER */}
          {activeTab === "status" && (
            <OrderProgressTracker
              activeOrder={activeOrder}
              onCancelOrder={cancelOrder}
              onBrowseMenu={() => setActiveTab("menu")}
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
          hasActiveOrder={Boolean(activeOrder)}
        />

        {/* 4. Bottom Sheets & Modals */}
        {/* Item Customizer Sheet */}
        <ItemCustomizerSheet
          item={customizingItem}
          isOpen={Boolean(customizingItem)}
          onClose={() => setCustomizingItem(null)}
        />

        {/* Cart & Checkout Drawer */}
        <CartDrawer
          venue={MOCK_VENUE}
          isOpen={showCartDrawer}
          onClose={() => setShowCartDrawer(false)}
          onOrderPlaced={placeOrder}
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
  );
}
