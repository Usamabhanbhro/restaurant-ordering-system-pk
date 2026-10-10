import { create } from "zustand";
import { INITIAL_ORDERS, type OrderData, type TableContext } from "../mockData";

interface OrderState {
  orders: OrderData[];
  activeInVenueOrderId: string | null;
  placeOrder: (order: OrderData) => void;
  cancelOrder: (id: string) => void;
  updateOrderState: (id: string, state: OrderData["state"]) => void;
  getActiveOrder: (email?: string, tableContext?: TableContext | null) => OrderData | null;
  setActiveInVenueOrderId: (id: string | null) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: INITIAL_ORDERS,
  activeInVenueOrderId: null,

  placeOrder: (order) => {
    set((state) => ({
      orders: [order, ...state.orders],
      activeInVenueOrderId: order.mode === "IN_VENUE" ? order.id : state.activeInVenueOrderId,
    }));
  },

  setActiveInVenueOrderId: (id) => set({ activeInVenueOrderId: id }),

  cancelOrder: (id) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, state: "VOIDED" as const, refundOwed: o.state !== "PENDING_PAYMENT" } : o
      ),
    }));
  },

  updateOrderState: (id, state) => {
    set((s) => ({
      orders: s.orders.map((o) => (o.id === id ? { ...o, state } : o)),
    }));
  },

  getActiveOrder: (email, tableContext) => {
    const { orders, activeInVenueOrderId } = get();

    // In-Venue Mode: Resolve session-only or table-linked order without requiring email
    if (tableContext) {
      if (activeInVenueOrderId) {
        const order = orders.find(
          (o) => o.id === activeInVenueOrderId && o.state !== "SERVED" && o.state !== "VOIDED"
        );
        if (order) return order;
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

    // Remote Mode: Resolve by registered customer account email
    if (!email) return null;
    return (
      orders.find(
        (o) =>
          o.mode !== "IN_VENUE" &&
          o.customerEmail.toLowerCase() === email.toLowerCase() &&
          o.state !== "SERVED" &&
          o.state !== "VOIDED"
      ) || null
    );
  },
}));
