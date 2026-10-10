"use client";

import { Home, Gift, Clock, User, ArrowRight } from "lucide-react";

export type NavTabId = "menu" | "perks" | "status" | "profile";

interface FloatingBottomDockProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  cartItemCount: number;
  cartSubtotal: number;
  onOpenCart: () => void;
  isFloatingNav: boolean;
  hasActiveOrder: boolean;
}

export function FloatingBottomDock({
  activeTab,
  onSelectTab,
  cartItemCount,
  cartSubtotal,
  onOpenCart,
  isFloatingNav,
  hasActiveOrder,
}: FloatingBottomDockProps) {
  const navItems = [
    { id: "menu" as const, label: "Menu", icon: Home },
    { id: "perks" as const, label: "Perks", icon: Gift },
    { id: "status" as const, label: "Tracker", icon: Clock },
    { id: "profile" as const, label: "Profile", icon: User },
  ];

  return (
    <>
      {/* Sticky Floating Cart Capsule */}
      {cartItemCount > 0 && activeTab === "menu" && (
        <div
          className={`fixed left-4 right-4 max-w-md mx-auto z-40 animate-slide-up transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isFloatingNav ? "bottom-[84px]" : "bottom-[74px]"
          }`}
        >
          <button
            type="button"
            onClick={onOpenCart}
            className="w-full py-3.5 px-5 rounded-full bg-neutral-900 active:bg-[#fd8535] hover:bg-[#fd8535] focus:bg-[#fd8535] text-white flex items-center justify-between transition-colors duration-150 active:scale-[0.98] shadow-2xl border border-white/10"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white/20 text-xs font-bold flex items-center justify-center">
                {cartItemCount}
              </span>
              <span className="text-xs font-bold">View Cart & Checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold">Rs. {cartSubtotal}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Ambient Progressive Gradient Blur (Apple iOS 26 Specification) */}
      <div
        className={`fixed bottom-0 inset-x-0 max-w-md mx-auto liquid-progressive-backdrop pointer-events-none transition-all duration-300 z-30 ${
          isFloatingNav ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="lpb-layer-1" />
        <div className="lpb-layer-2" />
        <div className="lpb-layer-3" />
        <div className="lpb-layer-4" />
        <div className="lpb-layer-5" />
        <div className="lpb-layer-6" />
      </div>

      {/* Dynamic Bottom Navigation Bar: Floating Pill vs Docked Bar */}
      <nav
        className={`fixed z-40 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isFloatingNav
            ? "bottom-5 left-1/2 -translate-x-1/2 w-fit"
            : "bottom-0 inset-x-0 max-w-md mx-auto h-16 rounded-none bg-white/95 backdrop-blur-md border-t border-neutral-200/90 shadow-none px-6 flex items-center justify-around"
        }`}
      >
        {isFloatingNav ? (
          <div className="w-fit inline-flex items-center gap-1.5 p-1.5 rounded-full liquid-glass-pill shadow-xl">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  title={item.label}
                  className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 ${
                    isActive ? "liquid-glass-btn-active" : "liquid-glass-btn-inactive"
                  }`}
                >
                  <IconComp className="w-5 h-5" />
                  {item.id === "status" && hasActiveOrder && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#EF5A30] ring-2 ring-white animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-around w-full">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`flex flex-col items-center gap-1 text-[10px] font-bold relative transition-colors ${
                    isActive ? "text-[#EF5A30]" : "text-neutral-400 hover:text-neutral-700"
                  }`}
                >
                  <IconComp className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.id === "status" && hasActiveOrder && (
                    <span className="absolute -top-0.5 right-1 w-2 h-2 rounded-full bg-[#EF5A30] animate-ping" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </nav>
    </>
  );
}
