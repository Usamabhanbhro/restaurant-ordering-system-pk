import { create } from "zustand";
import type { MenuItemData, ModifierItem } from "../mockData";
import { useTenant } from "../tenant/TenantContext";

export interface CartLineItem {
  item: MenuItemData;
  quantity: number;
  selectedModifiers: ModifierItem[];
  note: string;
}

interface AppliedPromo {
  code: string;
  discountPkr: number;
}

interface CartState {
  // Tenant-scoped state
  cartsByTenant: Record<string, CartLineItem[]>;
  promosByTenant: Record<string, AppliedPromo | null>;
  activeTenantSlug: string;

  // Global / Active Tenant Setters & Mutators
  setActiveTenantSlug: (slug: string) => void;
  addItem: (
    item: MenuItemData,
    quantity: number,
    selectedModifiers: ModifierItem[],
    note: string,
    tenantSlug?: string
  ) => void;
  updateQuantity: (index: number, delta: number, tenantSlug?: string) => void;
  removeItem: (index: number, tenantSlug?: string) => void;
  clearCart: (tenantSlug?: string) => void;
  applyPromo: (code: string, tenantSlug?: string) => boolean;
  removePromo: (tenantSlug?: string) => void;

  // Calculators (reads activeTenantSlug by default or takes explicit tenantSlug)
  getItems: (tenantSlug?: string) => CartLineItem[];
  getItemCount: (tenantSlug?: string) => number;
  getSubtotal: (tenantSlug?: string) => number;
  getVoucherDiscount: (tenantSlug?: string) => number;
  getFinalTotal: (tenantSlug?: string) => number;
  getPromo: (tenantSlug?: string) => AppliedPromo | null;

  // Backwards-compatible properties
  items: CartLineItem[];
  promoCode: string;
  promoApplied: boolean;
}

const DEFAULT_TENANT = "brewery-gulberg";

function calculateSubtotalForItems(items: CartLineItem[]): number {
  return items.reduce((sum, line) => {
    const modTotal = line.selectedModifiers.reduce((mSum, m) => mSum + m.priceDelta, 0);
    return sum + (line.item.price + modTotal) * line.quantity;
  }, 0);
}

export const useCartStore = create<CartState>((set, get) => ({
  cartsByTenant: {
    [DEFAULT_TENANT]: [],
  },
  promosByTenant: {
    [DEFAULT_TENANT]: null,
  },
  activeTenantSlug: DEFAULT_TENANT,
  items: [],
  promoCode: "",
  promoApplied: false,

  setActiveTenantSlug: (slug) => {
    const tenantCart = get().cartsByTenant[slug] || [];
    const tenantPromo = get().promosByTenant[slug];
    set({
      activeTenantSlug: slug,
      items: tenantCart,
      promoCode: tenantPromo?.code || "",
      promoApplied: Boolean(tenantPromo),
    });
  },

  getItems: (tenantSlug) => {
    const slug = tenantSlug || get().activeTenantSlug;
    return get().cartsByTenant[slug] || [];
  },

  getItemCount: (tenantSlug) => {
    const list = get().getItems(tenantSlug);
    return list.reduce((sum, it) => sum + it.quantity, 0);
  },

  getSubtotal: (tenantSlug) => {
    const list = get().getItems(tenantSlug);
    return calculateSubtotalForItems(list);
  },

  getVoucherDiscount: (tenantSlug) => {
    const slug = tenantSlug || get().activeTenantSlug;
    const promo = get().promosByTenant[slug];
    return promo ? promo.discountPkr : 0;
  },

  getFinalTotal: (tenantSlug) => {
    const subtotal = get().getSubtotal(tenantSlug);
    const discount = get().getVoucherDiscount(tenantSlug);
    return Math.max(0, subtotal - discount);
  },

  getPromo: (tenantSlug) => {
    const slug = tenantSlug || get().activeTenantSlug;
    return get().promosByTenant[slug] || null;
  },

  addItem: (item, quantity, selectedModifiers, note, tenantSlug) => {
    set((state) => {
      const slug = tenantSlug || state.activeTenantSlug;
      const current = state.cartsByTenant[slug] || [];
      const updated = [
        ...current,
        {
          item,
          quantity: Math.max(1, quantity),
          selectedModifiers: [...selectedModifiers],
          note: note.slice(0, 40),
        },
      ];

      const isCurrent = slug === state.activeTenantSlug;
      return {
        cartsByTenant: {
          ...state.cartsByTenant,
          [slug]: updated,
        },
        items: isCurrent ? updated : state.items,
      };
    });
  },

  updateQuantity: (index, delta, tenantSlug) => {
    set((state) => {
      const slug = tenantSlug || state.activeTenantSlug;
      const current = [...(state.cartsByTenant[slug] || [])];
      const target = current[index];
      if (!target) return state;

      const nextQty = target.quantity + delta;
      if (nextQty <= 0) {
        current.splice(index, 1);
      } else {
        current[index] = { ...target, quantity: nextQty };
      }

      const isCurrent = slug === state.activeTenantSlug;
      return {
        cartsByTenant: {
          ...state.cartsByTenant,
          [slug]: current,
        },
        items: isCurrent ? current : state.items,
      };
    });
  },

  removeItem: (index, tenantSlug) => {
    set((state) => {
      const slug = tenantSlug || state.activeTenantSlug;
      const current = [...(state.cartsByTenant[slug] || [])];
      current.splice(index, 1);

      const isCurrent = slug === state.activeTenantSlug;
      return {
        cartsByTenant: {
          ...state.cartsByTenant,
          [slug]: current,
        },
        items: isCurrent ? current : state.items,
      };
    });
  },

  clearCart: (tenantSlug) => {
    set((state) => {
      const slug = tenantSlug || state.activeTenantSlug;
      const isCurrent = slug === state.activeTenantSlug;
      return {
        cartsByTenant: {
          ...state.cartsByTenant,
          [slug]: [],
        },
        promosByTenant: {
          ...state.promosByTenant,
          [slug]: null,
        },
        items: isCurrent ? [] : state.items,
        promoCode: isCurrent ? "" : state.promoCode,
        promoApplied: isCurrent ? false : state.promoApplied,
      };
    });
  },

  applyPromo: (code, tenantSlug) => {
    const normalized = code.trim().toUpperCase();
    if (normalized === "PROMO50") {
      set((state) => {
        const slug = tenantSlug || state.activeTenantSlug;
        const promo = { code: "PROMO50", discountPkr: 50 };
        const isCurrent = slug === state.activeTenantSlug;
        return {
          promosByTenant: {
            ...state.promosByTenant,
            [slug]: promo,
          },
          promoCode: isCurrent ? "PROMO50" : state.promoCode,
          promoApplied: isCurrent ? true : state.promoApplied,
        };
      });
      return true;
    }
    return false;
  },

  removePromo: (tenantSlug) => {
    set((state) => {
      const slug = tenantSlug || state.activeTenantSlug;
      const isCurrent = slug === state.activeTenantSlug;
      return {
        promosByTenant: {
          ...state.promosByTenant,
          [slug]: null,
        },
        promoCode: isCurrent ? "" : state.promoCode,
        promoApplied: isCurrent ? false : state.promoApplied,
      };
    });
  },
}));

/**
 * Hook that automatically binds cart operations to the current tenant from TenantContext.
 */
export function useTenantCart() {
  const { tenantSlug } = useTenant();
  const store = useCartStore();

  const items = store.getItems(tenantSlug);
  const itemCount = store.getItemCount(tenantSlug);
  const subtotal = store.getSubtotal(tenantSlug);
  const voucherDiscount = store.getVoucherDiscount(tenantSlug);
  const finalTotal = store.getFinalTotal(tenantSlug);
  const promo = store.getPromo(tenantSlug);

  return {
    items,
    itemCount,
    subtotal,
    voucherDiscount,
    finalTotal,
    promoCode: promo?.code || "",
    promoApplied: Boolean(promo),
    addItem: (
      item: MenuItemData,
      quantity: number,
      selectedModifiers: ModifierItem[],
      note: string
    ) => store.addItem(item, quantity, selectedModifiers, note, tenantSlug),
    updateQuantity: (index: number, delta: number) =>
      store.updateQuantity(index, delta, tenantSlug),
    removeItem: (index: number) => store.removeItem(index, tenantSlug),
    clearCart: () => store.clearCart(tenantSlug),
    applyPromo: (code: string) => store.applyPromo(code, tenantSlug),
    removePromo: () => store.removePromo(tenantSlug),
  };
}
