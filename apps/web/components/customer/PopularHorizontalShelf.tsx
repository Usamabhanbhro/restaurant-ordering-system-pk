"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Flame, Clock, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import type { MenuItemData } from "@/lib/mockData";

interface PopularHorizontalShelfProps {
  items: MenuItemData[];
  venue86List?: Record<string, boolean>;
  onCustomize: (item: MenuItemData) => void;
  onSeeAllPopular?: () => void;
}

export function PopularHorizontalShelf({
  items,
  venue86List = {},
  onCustomize,
  onSeeAllPopular,
}: PopularHorizontalShelfProps) {
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
  }, [checkScroll, items]);

  const slideBy = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="space-y-2 py-1">
      {/* Section Header */}
      <div className="px-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-black text-neutral-900 tracking-tight">
            Popular at Brewery
          </p>
        </div>
        {onSeeAllPopular && (
          <button
            type="button"
            onClick={onSeeAllPopular}
            className="text-[11px] font-bold text-[#fd8535] hover:underline cursor-pointer"
          >
            See all ({items.length})
          </button>
        )}
      </div>

      {/* Horizontal Carousel Track */}
      <div className="relative">
        {/* Left Scroll Sliding Affordance */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-r from-[#FFFBF8] via-[#FFFBF8]/95 to-transparent pr-4 pl-1 pointer-events-auto">
            <button
              type="button"
              onClick={() => slideBy(-180)}
              aria-label="Scroll popular items left"
              className="w-6 h-6 rounded-full bg-white shadow-md border border-neutral-200/80 flex items-center justify-center text-neutral-700 hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Scrollable Horizontal Cards Track */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex items-stretch gap-3 px-4 py-1 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {items.map((item) => {
            const is86ed = Boolean(venue86List[item.id]);
            return (
              <div
                key={item.id}
                onClick={() => {
                  if (!is86ed) onCustomize(item);
                }}
                className={`w-44 shrink-0 rounded-2xl bg-white border border-neutral-200/80 shadow-soft overflow-hidden flex flex-col justify-between transition-all duration-200 ${
                  is86ed
                    ? "opacity-50 grayscale cursor-not-allowed"
                    : "hover:border-[#fd8535]/40 hover:shadow-md cursor-pointer active:scale-[0.98]"
                }`}
              >
                {/* Item Thumbnail & Badges */}
                <div className="relative h-28 w-full overflow-hidden bg-neutral-100">
                  <img
                    src={item.image}
                    alt={item.nameEn}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

                  {/* Top Left: Popular Badge */}
                  <div className="absolute top-2 left-2 flex items-center">
                    <span className="px-1.5 py-0.5 rounded-full bg-[#f9b318] text-neutral-950 text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-xs">
                      <Flame className="w-2.5 h-2.5 text-neutral-950 fill-neutral-950" />
                      <span>Popular</span>
                    </span>
                  </div>

                  {/* Top Right: Pickup Lead Time */}
                  <div className="absolute top-2 right-2 flex items-center">
                    <span className="px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5 text-white/90" />
                      <span>10m</span>
                    </span>
                  </div>

                  {/* 86 State Overlay */}
                  {is86ed && (
                    <div className="absolute inset-0 bg-neutral-900/70 backdrop-blur-[1px] flex items-center justify-center text-white text-[10px] font-black uppercase tracking-wider">
                      Sold Out
                    </div>
                  )}
                </div>

                {/* Item Details & Price Footer */}
                <div className="p-2.5 flex flex-col justify-between flex-1 gap-2 bg-white">
                  <div>
                    <h4 className="font-extrabold text-xs text-neutral-900 leading-snug line-clamp-1">
                      {item.nameEn}
                    </h4>
                    {item.nameRomanUrdu && (
                      <p className="text-[10px] font-semibold text-[#fd8535] line-clamp-1 mt-0.5">
                        {item.nameRomanUrdu}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                    <span className="text-xs font-black text-neutral-950">
                      Rs. {item.price}
                    </span>

                    {!is86ed && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCustomize(item);
                        }}
                        aria-label={`Customize ${item.nameEn}`}
                        className="w-6 h-6 rounded-full bg-neutral-900 hover:bg-[#fd8535] text-white flex items-center justify-center transition-colors shadow-xs active:scale-90 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Scroll Sliding Affordance */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-l from-[#FFFBF8] via-[#FFFBF8]/95 to-transparent pl-4 pr-1 pointer-events-auto">
            <button
              type="button"
              onClick={() => slideBy(180)}
              aria-label="Scroll popular items right"
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
