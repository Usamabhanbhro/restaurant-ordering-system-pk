"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronRight, ChevronLeft, LayoutGrid } from "lucide-react";
import type { CategoryData } from "@/lib/mockData";

interface CategoryCarouselProps {
  categories: CategoryData[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export function CategoryCarousel({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isWrapped, setIsWrapped] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isWrapped) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    // Check with a 2px tolerance for fractional subpixels
    const hasLeft = el.scrollLeft > 2;
    const hasRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 4;
    setCanScrollLeft(hasLeft);
    setCanScrollRight(hasRight);
  }, [isWrapped]);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll, categories]);

  const scrollBy = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const handleSelect = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    onSelectCategory(id);
    if (!isWrapped) {
      e.currentTarget.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  return (
    <div className="px-4 py-2">
      <div className="relative">
        {/* Left Scroll Gradient Affordance & Button */}
        {!isWrapped && canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-r from-[#FFFBF8] via-[#FFFBF8]/90 to-transparent pr-4 pl-0.5 pointer-events-auto">
            <button
              type="button"
              onClick={() => scrollBy(-140)}
              aria-label="Scroll categories left"
              className="w-6 h-6 rounded-full bg-white shadow-md border border-neutral-200/80 flex items-center justify-center text-neutral-700 hover:bg-neutral-50 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Scrollable Track / Wrapped Container */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className={`flex items-center gap-1.5 sm:gap-2 py-1 ${
            isWrapped
              ? "flex-wrap"
              : "overflow-x-auto no-scrollbar scroll-smooth"
          }`}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const isPopular = cat.id === "cat-popular" || cat.name.toLowerCase() === "popular";
            return (
              <button
                key={cat.id}
                type="button"
                onClick={(e) => handleSelect(cat.id, e)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                  isSelected
                    ? "bg-[#fd8535] text-white shadow-pill border border-[#fd8535]"
                    : isPopular
                    ? "bg-[#f9b318] text-neutral-950 border border-[#f9b318] shadow-xs hover:brightness-105"
                    : "bg-white text-neutral-600 border border-neutral-200/80 hover:bg-neutral-50"
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}

          {/* Wrap / Expand Grid Toggle Button */}
          <button
            type="button"
            onClick={() => setIsWrapped(!isWrapped)}
            aria-label={isWrapped ? "Collapse to single row carousel" : "Expand all categories"}
            title={isWrapped ? "Single Row Carousel" : "Show All in Grid"}
            className={`p-1.5 rounded-full text-xs font-medium shrink-0 transition-all border flex items-center justify-center ${
              isWrapped
                ? "bg-neutral-900 text-white border-neutral-900 shadow-pill"
                : "bg-white text-neutral-400 border-neutral-200/80 hover:text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Scroll Gradient Affordance & Button */}
        {!isWrapped && canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-l from-[#FFFBF8] via-[#FFFBF8]/90 to-transparent pl-4 pr-0.5 pointer-events-auto">
            <button
              type="button"
              onClick={() => scrollBy(140)}
              aria-label="Scroll categories right"
              className="w-6 h-6 rounded-full bg-white shadow-md border border-neutral-200/80 flex items-center justify-center text-neutral-700 hover:bg-neutral-50 active:scale-95 transition-all"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
