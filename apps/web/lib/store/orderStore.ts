import { create } from "zustand";
import { INITIAL_ORDERS, type OrderData, type TableContext } from "../mockData";
import { useTenant } from "../tenant/TenantContext";

interface OrderState {
  ordersByTenant: Record<string, OrderData[]>;
  activeInVenueOrderIds: Record<string, string | null>;
  activeTenantSlug: string;

  // Scoped getters
  getOrders: (tenantSlug?: string) => OrderData[];
  getActiveOrder: (
    tenantSlug?: string,
    customerEmail?: string,
    tableContext?: TableContext | null
  ) => OrderData | null;

  // Scoped mutators
  placeOrder: (order: OrderData, tenantSlug?: string) => void;
  cancelOrder: (id: string, tenantSlug?: string) => void;
  updateOrderState: (id: string, state: OrderData["state"], tenantSlug?: string) => void;
  setActiveInVenueOrderId: (id: string | null, tenantSlug?: string) => void;
  setActiveTenantSlug: (slug: string) => void;

  // Backwards-compatible properties
  orders: OrderData[];
}

const DEFAULT_TENANT = "brewery-gulberg";

export const useOrderStore = create<OrderState>((set, get) => ({
  ordersByTenant: {
    [DEFAULT_TENANT]: INITIAL_ORDERS,
  },
  activeInVenueOrderIds: {
    [DEFAULT_TENANT]: null,
  },
  activeTenantSlug: DEFAULT_TENANT,
  orders: INITIAL_ORDERS,

  setActiveTenantSlug: (slug) => {
    const list = get().ordersByTenant[slug] || [];
    set({
      activeTenantSlug: slug,
      orders: list,
    });
  },

  getOrders: (tenantSlug) => {
    const slug = tenantSlug || get().activeTenantSlug;
    return get().ordersByTenant[slug] || [];
  },

  getActiveOrder: (tenantSlug, customerEmail, tableContext) => {
    const slug = tenantSlug || get().activeTenantSlug;
    const orders = get().ordersByTenant[slug] || [];
    const activeInVenueId = get().activeInVenueOrderIds[slug];

    // In-Venue Mode: Resolve session-only or table-linked order without requiring email
    if (tableContext) {
      if (activeInVenueId) {
        const match = orders.find(
          (o) => o.id === activeInVenueId && o.state !== "SERVED" && o.state !== "VOIDED"
        );
        if (match) return match;
      }
      return (
        orders.find(
          (o) =>
            o.mode === "IN_VENUE" &&
            o.tableNumber === tableContext.tableNumber &&
            o.zoneSlug === tableContext.zoneSlug &&
            o.state !== "SERVED" &&
            o.state !== "VOIDED"
        ) || null
      );
    }

    // Remote Mode: Resolve by account customer email or most recent active non-served order
    if (customerEmail) {
      return (
        orders.find(
          (o) =>
            o.customerEmail === customerEmail &&
            o.mode !== "IN_VENUE" &&
            o.state !== "SERVED" &&
            o.state !== "VOIDED"
        ) || null
      );
    }

    return null;
  },

  placeOrder: (order, tenantSlug) => {
    set((state) => {
      const slug = tenantSlug || state.activeTenantSlug;
      const current = state.ordersByTenant[slug] || [];
      const updated = [order, ...current];

      const isCurrent = slug === state.activeTenantSlug;
      return {
        ordersByTenant: {
          ...state.ordersByTenant,
          [slug]: updated,
        },
        activeInVenueOrderIds: {
          ...state.activeInVenueOrderIds,
          [slug]: order.mode === "IN_VENUE" ? order.id : state.activeInVenueOrderIds[slug] || null,
        },
        orders: isCurrent ? updated : state.orders,
      };
    });
  },

  cancelOrder: (id, tenantSlug) => {
    set((state) => {
      const slug = tenantSlug || state.activeTenantSlug;
      const current = state.ordersByTenant[slug] || [];
      const updated = current.map((o) =>
        o.id === id
          ? {
              ...o,
              state: "VOIDED" as const,
              refundOwed: o.state !== "PENDING_PAYMENT",
            }
          : o
      );

      const isCurrent = slug === state.activeTenantSlug;
      return {
        ordersByTenant: {
          ...state.ordersByTenant,
          [slug]: updated,
        },
        orders: isCurrent ? updated : state.orders,
      };
    });
  },

  updateOrderState: (id, nextState, tenantSlug) => {
    set((state) => {
      const slug = tenantSlug || state.activeTenantSlug;
      const current = state.ordersByTenant[slug] || [];
      const updated = current.map((o) =>
        o.id === id ? { ...o, state: nextState } : o
      );

      const isCurrent = slug === state.activeTenantSlug;
      return {
        ordersByTenant: {
          ...state.ordersByTenant,
          [slug]: updated,
        },
        orders: isCurrent ? updated : state.orders,
      };
    });
  },

  setActiveInVenueOrderId: (id, tenantSlug) => {
    set((state) => {
      const slug = tenantSlug || state.activeTenantSlug;
      return {
        activeInVenueOrderIds: {
          ...state.activeInVenueOrderIds,
          [slug]: id,
        },
      };
    });
  },
}));

/**
 * Hook that automatically binds order operations to the current tenant from TenantContext.
 */
export function useTenantOrders() {
  const { tenantSlug } = useTenant();
  const store = useOrderStore();

  return {
    orders: store.getOrders(tenantSlug),
    getActiveOrder: (customerEmail?: string, tableContext?: TableContext | null) =>
      store.getActiveOrder(tenantSlug, customerEmail, tableContext),
    placeOrder: (order: OrderData) => store.placeOrder(order, tenantSlug),
    cancelOrder: (id: string) => store.cancelOrder(id, tenantSlug),
    updateOrderState: (id: string, state: OrderData["state"]) =>
      store.updateOrderState(id, state, tenantSlug),
    setActiveInVenueOrderId: (id: string | null) =>
      store.setActiveInVenueOrderId(id, tenantSlug),
  };
}
