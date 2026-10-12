"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CUISINE_SHORTCUTS, type CuisineShortcut } from "@/lib/mockData";

interface CuisineShortcutRowProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export function CuisineShortcutRow({
  selectedCategory,
  onSelectCategory,
}: CuisineShortcutRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    const hasLeft = el.scrollLeft > 6;
    const hasRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 8;
    setCanScrollLeft(hasLeft);
    setCanScrollRight(hasRight);
  }, []);

  useEffect(() => {
    checkScroll();
    const timer = setTimeout(checkScroll, 150);
    window.addEventListener("resize", checkScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const slideBy = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const handleTileClick = (cat: CuisineShortcut, e: React.MouseEvent<HTMLButtonElement>) => {
    onSelectCategory(cat.id);
    e.currentTarget.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  return (
    <section className="px-4 py-2 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-neutral-400">
          Cuisine Shortcuts
        </h3>
        {selectedCategory !== "cat-popular" && selectedCategory !== "cat-all" && (
          <button
            type="button"
            onClick={() => onSelectCategory("cat-popular")}
            className="text-[11px] font-bold text-[#fd8535] hover:underline cursor-pointer"
          >
            Reset filter
          </button>
        )}
      </div>

      <div className="relative">
        {/* Left Scroll Sliding Affordance */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-r from-[#FFFBF8] via-[#FFFBF8]/95 to-transparent pr-4 pl-0.5 pointer-events-auto">
            <button
              type="button"
              onClick={() => slideBy(-160)}
              aria-label="Scroll cuisines left"
              className="w-6 h-6 rounded-full bg-white shadow-md border border-neutral-200/80 flex items-center justify-center text-neutral-700 hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Scrollable Track of 3D Cuisine Category Tiles */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex items-center gap-2.5 py-1 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {CUISINE_SHORTCUTS.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={(e) => handleTileClick(cat, e)}
                className={`w-[78px] sm:w-[84px] shrink-0 p-2 rounded-2xl border transition-all text-center flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 ${
                  isSelected
                    ? "bg-white border-[#fd8535] ring-2 ring-[#fd8535]/30 shadow-soft"
                    : "bg-white border-neutral-200/80 hover:border-neutral-300 shadow-2xs hover:shadow-soft"
                }`}
              >
                {/* 3D Cohesive Illustration Frame */}
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center p-0.5 overflow-hidden transition-transform ${
                    isSelected ? "bg-orange-50 scale-105" : "bg-neutral-50/80"
                  }`}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-contain drop-shadow-xs"
                    loading="lazy"
                  />
                </div>

                {/* Plain Text Label (Rendered as UI text in Plus Jakarta Sans) */}
                <span
                  className={`text-[11px] font-extrabold tracking-tight leading-tight truncate w-full block ${
                    isSelected ? "text-[#fd8535]" : "text-neutral-800"
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Sliding Affordance */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-l from-[#FFFBF8] via-[#FFFBF8]/95 to-transparent pl-4 pr-0.5 pointer-events-auto">
            <button
              type="button"
              onClick={() => slideBy(160)}
              aria-label="Scroll cuisines right"
              className="w-6 h-6 rounded-full bg-white shadow-md border border-neutral-200/80 flex items-center justify-center text-neutral-700 hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
