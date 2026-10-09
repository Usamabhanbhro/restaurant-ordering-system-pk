"use client";

import { Flame, Coffee, Pizza, CupSoda } from "lucide-react";
import type { CategoryData } from "@/lib/mockData";

// Inline clean burger vector SVG (strictly zero emoji)
function BurgerIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 11h16a1 1 0 0 0 1-1A7 7 0 0 0 3 10a1 1 0 0 0 1 1Z" />
      <path d="M3 15h18" />
      <path d="M4 18h16a2 2 0 0 1 2 2v0a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v0a2 2 0 0 1 2-2Z" />
      <line x1="7" y1="14" x2="8" y2="14" />
      <line x1="12" y1="14" x2="13" y2="14" />
      <line x1="17" y1="14" x2="18" y2="14" />
    </svg>
  );
}

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
  const renderIcon = (iconName: string, isSelected: boolean) => {
    const iconClass = `w-3.5 h-3.5 ${isSelected ? "text-white" : "text-neutral-500"}`;
    switch (iconName) {
      case "Flame":
        return <Flame className={iconClass} />;
      case "Burger":
        return <BurgerIcon className={iconClass} />;
      case "Coffee":
        return <Coffee className={iconClass} />;
      case "Pizza":
        return <Pizza className={iconClass} />;
      case "CupSoda":
        return <CupSoda className={iconClass} />;
      default:
        return <Flame className={iconClass} />;
    }
  };

  return (
    <div className="px-4 py-2">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                isSelected
                  ? "bg-neutral-900 text-white shadow-pill"
                  : "bg-white text-neutral-600 border border-neutral-200/80 hover:bg-neutral-50"
              }`}
            >
              {renderIcon(cat.icon, isSelected)}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
