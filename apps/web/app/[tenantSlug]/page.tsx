"use client";

import { useState } from "react";
import { SplashScreen } from "@/components/splash/SplashScreen";
import { Flame, Utensils, Coffee, Plus, Sparkles } from "lucide-react";

interface CustomerPageProps {
  params: Promise<{ tenantSlug: string }>;
}

export default function CustomerPage({ params }: CustomerPageProps) {
  const [showSplash, setShowSplash] = useState(true);
  const [splashExiting, setSplashExiting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("cat-popular");

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

  return (
    <main className="min-h-screen max-w-md mx-auto bg-[#FFFBF8] flex flex-col relative pb-24 shadow-2xl">
      {/* Opening Splash Screen */}
      {showSplash && (
        <SplashScreen
          isExiting={splashExiting}
          onDismiss={handleDismissSplash}
        />
      )}

      {/* Sticky Top Venue Header */}
      <header className="sticky top-0 z-30 liquid-glass border-b border-neutral-200/60 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#fc683f] flex items-center justify-center text-white font-black text-sm">
            Q
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-neutral-900 leading-tight">
              Brewery Cafe Gulberg
            </h1>
            <p className="text-[10px] text-neutral-500 font-semibold">
              10-15m Scheduled Pickup • Lahore
            </p>
          </div>
        </div>

        <button
          onClick={handleReplaySplash}
          className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors"
          title="Replay Opening Splash"
        >
          <Sparkles className="w-4 h-4 text-[#fc683f]" />
        </button>
      </header>

      {/* Category Navigation Pills */}
      <section className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedCategory("cat-popular")}
            className={`px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
              selectedCategory === "cat-popular"
                ? "bg-[#18181B] text-white shadow-sm"
                : "bg-white text-neutral-600 border border-neutral-200/80"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-[#fc683f]" />
            <span>Popular</span>
          </button>

          <button
            onClick={() => setSelectedCategory("cat-burgers")}
            className={`px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
              selectedCategory === "cat-burgers"
                ? "bg-[#18181B] text-white shadow-sm"
                : "bg-white text-neutral-600 border border-neutral-200/80"
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Burgers</span>
          </button>

          <button
            onClick={() => setSelectedCategory("cat-coffee")}
            className={`px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
              selectedCategory === "cat-coffee"
                ? "bg-[#18181B] text-white shadow-sm"
                : "bg-white text-neutral-600 border border-neutral-200/80"
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Specialty Coffee</span>
          </button>
        </div>
      </section>

      {/* Catalog Food Cards */}
      <section className="px-4 py-2 space-y-3">
        <div className="bg-white rounded-3xl p-4 border border-neutral-200/70 shadow-sm flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="inline-block px-2 py-0.5 rounded-full bg-orange-100 text-[#fc683f] font-bold text-[10px] uppercase">
              Popular
            </span>
            <h2 className="font-extrabold text-sm text-neutral-900">Double Smash Burger</h2>
            <p className="text-xs text-neutral-500 font-medium">
              Double Smash Burger • Ziada Cheese
            </p>
            <p className="text-xs font-bold text-neutral-400">240g</p>
            <p className="text-sm font-black text-neutral-900 pt-1">Rs. 890</p>
          </div>

          <button className="w-10 h-10 rounded-2xl bg-[#18181B] text-white flex items-center justify-center shrink-0 active:scale-95 transition-transform">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-neutral-200/70 shadow-sm flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="inline-block px-2 py-0.5 rounded-full bg-orange-100 text-[#fc683f] font-bold text-[10px] uppercase">
              Signature
            </span>
            <h2 className="font-extrabold text-sm text-neutral-900">Spanish Iced Latte</h2>
            <p className="text-xs text-neutral-500 font-medium">
              Fresh espresso with condensed milk
            </p>
            <p className="text-xs font-bold text-neutral-400">350ml</p>
            <p className="text-sm font-black text-neutral-900 pt-1">Rs. 580</p>
          </div>

          <button className="w-10 h-10 rounded-2xl bg-[#18181B] text-white flex items-center justify-center shrink-0 active:scale-95 transition-transform">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Floating Bottom Navigation Pill */}
      <div className="fixed bottom-4 inset-x-0 max-w-md mx-auto px-4 z-40 pointer-events-none">
        <div className="liquid-glass rounded-full px-6 py-3.5 flex items-center justify-between shadow-2xl pointer-events-auto border border-white/60">
          <span className="text-xs font-extrabold text-neutral-900">
            Cart (0 items)
          </span>
          <span className="px-3 py-1 rounded-full bg-[#fc683f] text-white font-black text-xs">
            Rs. 0
          </span>
        </div>
      </div>
    </main>
  );
}
