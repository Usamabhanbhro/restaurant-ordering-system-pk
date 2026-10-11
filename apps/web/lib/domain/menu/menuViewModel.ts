import type { MenuItem, MenuCategory } from "@queueless/types";
import type { ModifierGroup } from "@/lib/mockData";

export interface MenuItemViewModel {
  id: string;
  categoryId: string;
  nameEn: string;
  nameRomanUrdu?: string | undefined;
  description: string;
  price: number;
  popular: boolean;
  weight?: string | undefined;
  image: string;
  modifierGroups?: ModifierGroup[] | undefined;
  rawItem: MenuItem;
}

export interface CategoryViewModel {
  id: string;
  name: string;
  icon: string;
}

export function toCategoryViewModel(cat: MenuCategory): CategoryViewModel {
  return {
    id: cat.id,
    name: cat.nameEn,
    icon: cat.iconName,
  };
}

export function toMenuItemViewModel(item: MenuItem): MenuItemViewModel {
  return {
    id: item.id,
    categoryId: item.categoryId,
    nameEn: item.nameEn,
    nameRomanUrdu: item.nameUrdu,
    description: item.descriptionEn || "",
    price: item.pricePkr,
    popular: item.isPopular,
    weight: item.portionWeightGrams ? `${item.portionWeightGrams}g` : undefined,
    image:
      item.imageUrl ||
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    modifierGroups: item.modifierGroups?.map((mg) => ({
      id: mg.id,
      title: mg.nameEn,
      min: mg.minSelections,
      max: mg.maxSelections,
      modifiers: mg.options.map((opt) => ({
        id: opt.id,
        nameEn: opt.nameEn,
        nameRomanUrdu: opt.nameUrdu || opt.nameEn,
        priceDelta: opt.pricePkr,
        type: opt.type,
      })),
    })),
    rawItem: item,
  };
}
