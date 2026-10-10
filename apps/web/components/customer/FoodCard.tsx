"use client";

import type { MenuItemData } from "@/lib/mockData";
import { Plus } from "lucide-react";

interface FoodCardProps {
  item: MenuItemData;
  is86ed?: boolean;
  onCustomize: (item: MenuItemData) => void;
}

export function FoodCard({ item, is86ed = false, onCustomize }: FoodCardProps) {
  const handleClick = () => {
    if (!is86ed) {
      onCustomize(item);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-3.5 rounded-3xl bg-white border border-neutral-200/70 shadow-soft flex items-center justify-between gap-3 transition-all cursor-pointer ${
        is86ed
          ? "opacity-40 grayscale cursor-not-allowed"
          : "hover:border-[#EF5A30]/40 active:scale-[0.99]"
      }`}
    >
      {/* Left Side: Information */}
      <div className="flex-1 pr-2">
        <div className="flex items-center gap-2">
          <h3 className="font-extrabold text-sm text-neutral-900 leading-snug">
            {item.nameEn}
          </h3>
          {item.popular && (
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-orange-100 text-[#EF5A30]">
              POPULAR
            </span>
          )}
        </div>

        {item.nameRomanUrdu && item.nameRomanUrdu.toLowerCase() !== item.nameEn.toLowerCase() && (
          <p className="text-[11px] font-medium text-[#fd8535] mt-0.5">
            {item.nameRomanUrdu}
          </p>
        )}

        <p className="text-[11px] text-neutral-500 line-clamp-2 mt-1 leading-relaxed">
          {item.description}
        </p>

        <div className="flex items-center gap-3 mt-2.5">
          <span className="text-sm font-extrabold text-neutral-950">Rs. {item.price}</span>
          {item.weight && (
            <span className="text-[10px] text-neutral-400 font-medium">
              • {item.weight}
            </span>
          )}
        </div>
      </div>

      {/* Right Side: Cutout Thumbnail + Pill Add Button */}
      <div className="relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-neutral-100 shadow-inner">
        <img
          src={item.image}
          alt={item.nameEn}
          className="w-full h-full object-cover"
        />
        {is86ed ? (
          <div className="absolute inset-0 bg-neutral-900/70 backdrop-blur-[1px] flex items-center justify-center text-white text-[10px] font-bold">
            86 OUT
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCustomize(item);
            }}
            className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-neutral-900 hover:bg-[#EF5A30] text-white flex items-center justify-center font-bold text-sm shadow-md transition-colors"
            title={`Customize ${item.nameEn}`}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
