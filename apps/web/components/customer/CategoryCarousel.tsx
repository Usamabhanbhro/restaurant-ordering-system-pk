"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
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

  // Ensure "All" pill exists immediately after "Popular" if not already present
  const resolvedCategories = useMemo(() => {
    const hasAll = categories.some((c) => c.id === "cat-all" || c.name.toLowerCase() === "all");
    if (hasAll) return categories;

    const popIdx = categories.findIndex(
      (c) => c.id === "cat-popular" || c.name.toLowerCase() === "popular"
    );
    if (popIdx !== -1) {
      const copy = [...categories];
      copy.splice(popIdx + 1, 0, { id: "cat-all", name: "All", icon: "Utensils" });
      return copy;
    }
    return [{ id: "cat-all", name: "All", icon: "Utensils" }, ...categories];
  }, [categories]);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    const hasLeft = el.scrollLeft > 4;
    const hasRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 6;
    setCanScrollLeft(hasLeft);
    setCanScrollRight(hasRight);
  }, []);

  useEffect(() => {
    checkScroll();
    const timeout = setTimeout(checkScroll, 120);
    window.addEventListener("resize", checkScroll);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, resolvedCategories]);

  const slideByPage = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const pageDistance = Math.max(scrollRef.current.clientWidth * 0.75, 160);
      const offset = direction === "left" ? -pageDistance : pageDistance;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const handleSelect = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    onSelectCategory(id);
    e.currentTarget.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  return (
    <div className="px-4 py-2">
      <div className="relative">
        {/* Left Scroll Sliding Affordance & Button */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-r from-[#FFFBF8] via-[#FFFBF8]/95 to-transparent pr-5 pl-0.5 pointer-events-auto">
            <button
              type="button"
              onClick={() => slideByPage("left")}
              aria-label="Slide categories left"
              className="w-6 h-6 rounded-full bg-white shadow-md border border-neutral-200/80 flex items-center justify-center text-neutral-700 hover:bg-neutral-50 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Scrollable / Slidable Track */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex items-center gap-1.5 sm:gap-2 py-1 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {resolvedCategories.map((cat) => {
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
        </div>

        {/* Right Scroll Sliding Affordance & Button */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-l from-[#FFFBF8] via-[#FFFBF8]/95 to-transparent pl-5 pr-0.5 pointer-events-auto">
            <button
              type="button"
              onClick={() => slideByPage("right")}
              aria-label="Slide categories right"
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
