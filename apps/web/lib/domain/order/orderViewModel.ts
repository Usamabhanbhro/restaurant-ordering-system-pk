import type { Order } from "@queueless/types";
import type { OrderData } from "@/lib/mockData";

export function toOrderData(order: Order): OrderData {
  return {
    id: order.id,
    code: `#${order.orderNumber}`,
    customerName: order.customerDisplayName,
    customerEmail: order.customerRef ? "customer@nu.edu.pk" : "",
    items: order.items.map((it) => ({
      name: it.nameSnapshot,
      qty: it.quantity,
      price: it.pricePkrSnapshot,
      mods: it.selectedModifiers.map((m) => m.nameEn),
      note: it.itemNotes || "",
    })),
    total: order.totalPkr,
    slot: order.pickupSlot || "",
    breakSlot: order.breakSlot || "Break Slot #1",
    state: order.state,
    paymentMethod: order.claim?.paymentMethod || "Venue Direct",
    txnId: order.claim?.claimedTxnId || "",
    hasScreenshot: Boolean(order.claim?.proofImageUrl),
    createdAt: order.createdAt,
    kitchenStartAt: order.kitchenStartAt || "",
    undoUntil: null,
    rejectionReason: null,
    refundOwed: false,
    mode: order.mode,
    zoneSlug: order.tableContext?.zoneSlug,
    tableNumber: order.tableContext?.tableNumber,
    tableLabel: order.tableContext
      ? `Table ${order.tableContext.tableNumber}`
      : undefined,
  };
}
