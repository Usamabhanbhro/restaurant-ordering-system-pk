import { create } from "zustand";
import type { MenuItemData, ModifierItem } from "../mockData";

export interface CartLineItem {
  item: MenuItemData;
  quantity: number;
  selectedModifiers: ModifierItem[];
  note: string;
}

interface CartState {
  items: CartLineItem[];
  promoCode: string;
  promoApplied: boolean;
  addItem: (item: MenuItemData, quantity: number, selectedModifiers: ModifierItem[], note: string) => void;
  updateQuantity: (index: number, delta: number) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  applyPromo: (code: string) => void;
  removePromo: () => void;
  getSubtotal: () => number;
  getVoucherDiscount: () => number;
  getFinalTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  promoCode: "",
  promoApplied: false,

  addItem: (item, quantity, selectedModifiers, note) => {
    set((state) => ({
      items: [
        ...state.items,
        {
          item,
          quantity: Math.max(1, quantity),
          selectedModifiers: [...selectedModifiers],
          note: note.slice(0, 40),
        },
      ],
    }));
  },

  updateQuantity: (index, delta) => {
    set((state) => {
      const next = [...state.items];
      const target = next[index];
      if (!target) return state;

      const newQty = target.quantity + delta;
      if (newQty <= 0) {
        next.splice(index, 1);
      } else {
        next[index] = { ...target, quantity: newQty };
      }
      return { items: next };
    });
  },

  removeItem: (index) => {
    set((state) => ({
      items: state.items.filter((_, i) => i !== index),
    }));
  },

  clearCart: () => {
    set({ items: [], promoApplied: false, promoCode: "" });
  },

  applyPromo: (code) => {
    set({ promoCode: code.toUpperCase(), promoApplied: true });
  },

  removePromo: () => {
    set({ promoCode: "", promoApplied: false });
  },

  getSubtotal: () => {
    const { items } = get();
    return items.reduce((sum, line) => {
      const modTotal = line.selectedModifiers.reduce((mSum, m) => mSum + m.priceDelta, 0);
      return sum + (line.item.price + modTotal) * line.quantity;
    }, 0);
  },

  getVoucherDiscount: () => {
    const { promoApplied } = get();
    return promoApplied ? 50 : 0;
  },

  getFinalTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getVoucherDiscount();
    return Math.max(0, subtotal - discount);
  },

  getItemCount: () => {
    const { items } = get();
    return items.reduce((count, line) => count + line.quantity, 0);
  },
}));
