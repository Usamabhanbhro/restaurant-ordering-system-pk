"use client";

import { use, useState, useRef, type UIEvent } from "react";
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

import { MOCK_VENUE, MOCK_CATEGORIES, MOCK_ITEMS, type MenuItemData } from "@/lib/mockData";
import { useCartStore } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";
import { useOrderStore } from "@/lib/store/orderStore";

interface CustomerPageProps {
  params: Promise<{ tenantSlug: string }>;
}

export default function CustomerPage({ params }: CustomerPageProps) {
  // Unwrap Next.js 15 params Promise using React 19 `use` hook
  const { tenantSlug } = use(params);

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
  const activeOrder = getActiveOrder(currentUser?.email);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const currentScrollTop = e.currentTarget.scrollTop;
    const delta = currentScrollTop - lastScrollTop.current;

    // Threshold to prevent jitter on tiny sub-pixel scrolls
    if (Math.abs(delta) > 6) {
      if (delta > 0 && currentScrollTop > 30) {
        // Scrolled down -> attach flush to bottom edge
        setIsFloatingNav(false);
      } else if (delta < 0) {
        // Scrolled up -> float elevated as detached pill
        setIsFloatingNav(true);
      }
    }

    // Always float when resting near the top
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
          {/* Top Hero Banner */}
          <HeroHeader
            venue={MOCK_VENUE}
            remoteOrdersPaused={remoteOrdersPaused}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectTab={setActiveTab}
          />

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
          {activeTab === "profile" && <ProfileTab onReplaySplash={handleReplaySplash} />}
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
        />

        {/* Customer Auth & Onboarding Sheet */}
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
