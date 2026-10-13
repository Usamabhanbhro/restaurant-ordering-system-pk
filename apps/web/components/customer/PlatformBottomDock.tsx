"use client";

import React from "react";
import { Store, QrCode, Gift, User } from "lucide-react";

export type HomeDockTabId = "venues" | "scan" | "perks" | "profile";

interface PlatformBottomDockProps {
  activeTab: HomeDockTabId;
  onSelectTab: (tab: HomeDockTabId) => void;
  isFloatingNav: boolean;
}

export function PlatformBottomDock({
  activeTab,
  onSelectTab,
  isFloatingNav,
}: PlatformBottomDockProps) {
  const navItems = [
    { id: "venues" as const, label: "Venues", icon: Store },
    { id: "scan" as const, label: "Scan QR", icon: QrCode },
    { id: "perks" as const, label: "Perks", icon: Gift },
    { id: "profile" as const, label: "Profile", icon: User },
  ];

  return (
    <>
      {/* Ambient Progressive Gradient Blur (Continuous Optical Mask) */}
      <div
        className={`fixed bottom-0 inset-x-0 max-w-md mx-auto liquid-progressive-backdrop pointer-events-none transition-all duration-300 z-30 ${
          isFloatingNav ? "opacity-100" : "opacity-0"
        }`}
      />

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
                  className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer ${
                    isActive ? "liquid-glass-btn-active" : "liquid-glass-btn-inactive"
                  }`}
                >
                  <IconComp className="w-5 h-5" />
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
                  className={`flex flex-col items-center gap-1 text-[10px] font-bold relative transition-colors cursor-pointer ${
                    isActive ? "text-[#EF5A30]" : "text-neutral-400 hover:text-neutral-700"
                  }`}
                >
                  <IconComp className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </nav>
    </>
  );
}
