import { create } from "zustand";
import { INITIAL_ORDERS, type OrderData } from "../mockData";

interface OrderState {
  orders: OrderData[];
  placeOrder: (order: OrderData) => void;
  cancelOrder: (id: string) => void;
  updateOrderState: (id: string, state: OrderData["state"]) => void;
  getActiveOrder: (email?: string) => OrderData | null;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: INITIAL_ORDERS,

  placeOrder: (order) => {
    set((state) => ({
      orders: [order, ...state.orders],
    }));
  },

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

  getActiveOrder: (email) => {
    if (!email) return null;
    const { orders } = get();
    return (
      orders.find(
        (o) =>
          o.customerEmail.toLowerCase() === email.toLowerCase() &&
          o.state !== "SERVED" &&
          o.state !== "VOIDED"
      ) || null
    );
  },
}));
