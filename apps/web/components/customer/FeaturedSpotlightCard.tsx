"use client";

import { Clock, Plus } from "lucide-react";
import type { MenuItemData } from "@/lib/mockData";

interface FeaturedSpotlightCardProps {
  item: MenuItemData;
  onCustomize: (item: MenuItemData) => void;
}

export function FeaturedSpotlightCard({ item, onCustomize }: FeaturedSpotlightCardProps) {
  return (
    <section className="px-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-neutral-400">
          Signature Spotlight
        </h3>
      </div>

      <div
        onClick={() => onCustomize(item)}
        className="group relative rounded-3xl bg-white border border-neutral-200/80 shadow-soft overflow-hidden transition-all duration-200 hover:border-[#fd8535]/40 hover:shadow-md cursor-pointer active:scale-[0.99]"
      >
        {/* Large Food Image Container */}
        <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-neutral-900">
          <img
            src={item.image}
            alt={item.nameEn}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Top Gradient & Pill Badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Top Right: Fast Prep Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 border border-white/10 shadow-sm">
              <Clock className="w-3 h-3 text-white/90" />
              <span>10m Counter Pickup</span>
            </span>
          </div>

          {/* Overlay Info at bottom of image */}
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <h4 className="text-base sm:text-lg font-black tracking-tight leading-snug drop-shadow-sm">
              {item.nameEn}
            </h4>
            {item.nameRomanUrdu && (
              <p className="text-xs font-semibold text-[#f9b318] drop-shadow-sm">
                {item.nameRomanUrdu}
              </p>
            )}
          </div>
        </div>

        {/* Card Details & Action Footer */}
        <div className="p-3.5 sm:p-4 bg-white flex flex-col justify-between gap-3">
          <p className="text-xs text-neutral-500 font-medium leading-relaxed line-clamp-2">
            {item.description}
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-neutral-400 font-bold">Rs.</span>
              <span className="text-lg font-black text-neutral-950 tracking-tight">
                {item.price}
              </span>
              {item.weight && (
                <span className="text-[11px] text-neutral-400 font-medium ml-1">
                  ({item.weight})
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCustomize(item);
              }}
              className="px-4 py-2 rounded-full bg-neutral-950 hover:bg-[#fd8535] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Order</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
