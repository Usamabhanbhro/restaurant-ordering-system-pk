"use client";

import React, { useMemo } from "react";
import { Drawer } from "vaul";
import { useOrderStore, EMPTY_ORDERS } from "@/lib/store/orderStore";
import { useAuthStore } from "@/lib/store/authStore";
import { useTenant } from "@/lib/tenant/TenantContext";
import { VENUE_REGISTRY } from "@/lib/domain/venue/venueRegistry";
import type { OrderData } from "@/lib/mockData";

export interface OrderHistorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder?: (order: OrderData) => void;
}

const STATE_BADGES: Record<
  OrderData["state"],
  { label: string; bg: string; text: string }
> = {
  PENDING_PAYMENT: { label: "Payment Verification", bg: "bg-amber-50", text: "text-amber-700" },
  SCHEDULED: { label: "Scheduled", bg: "bg-blue-50", text: "text-blue-700" },
  PREPARING: { label: "In Kitchen", bg: "bg-orange-50", text: "text-[#fd8535]" },
  READY: { label: "Ready for Pickup", bg: "bg-emerald-50", text: "text-emerald-700" },
  SERVED: { label: "Completed", bg: "bg-neutral-100", text: "text-neutral-600" },
  VOIDED: { label: "Cancelled", bg: "bg-red-50", text: "text-red-600" },
};

function formatOrderDate(createdAt: string | undefined): string {
  if (!createdAt) return "Recently";
  if (/^\d{1,2}:\d{2}/.test(createdAt)) {
    return `Today at ${createdAt}`;
  }
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return `Today at ${createdAt}`;
  return d.toLocaleDateString("en-PK", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderHistorySheet({
  isOpen,
  onClose,
  onSelectOrder,
}: OrderHistorySheetProps) {
  const { tenantSlug } = useTenant();
  const { currentUser } = useAuthStore();
  const ordersByTenant = useOrderStore((s) => s.ordersByTenant);

  // Surface all orders made across all venues for the customer
  const customerOrders = useMemo(() => {
    const all = Object.entries(ordersByTenant).flatMap(([slug, list]) => {
      const v = VENUE_REGISTRY.find((venue) => venue.slug === slug);
      return list.map((o) => ({
        ...o,
        tenantSlug: slug,
        venueName: v?.name ?? (slug === tenantSlug ? "Current Venue" : slug),
      }));
    });

    return all.filter((o) => {
      if (currentUser?.email && o.customerEmail) {
        return o.customerEmail === currentUser.email;
      }
      return true;
    });
  }, [ordersByTenant, tenantSlug, currentUser?.email]);

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Drawer.Content className="fixed bottom-0 inset-x-0 z-50 max-w-md mx-auto max-h-[85vh] bg-white rounded-t-[2.5rem] shadow-2xl overflow-hidden flex flex-col focus:outline-none">
          {/* iOS Drawer Handle */}
          <div className="pt-3 pb-1 flex justify-center shrink-0">
            <div className="w-12 h-1.5 rounded-full bg-neutral-300" />
          </div>

          {/* Header: Centered Order History */}
          <div className="py-3.5 px-4 border-b border-neutral-100 flex items-center justify-center bg-white shrink-0">
            <h3 className="font-extrabold text-base text-neutral-900 tracking-tight text-center">
              All Orders Made ({customerOrders.length})
            </h3>
          </div>

          {/* Scrollable Order List */}
          <div className="p-4 overflow-y-auto no-scrollbar space-y-3 flex-1">
            {customerOrders.length > 0 ? (
              customerOrders.map((order) => {
                const badge = STATE_BADGES[order.state] || {
                  label: order.state,
                  bg: "bg-neutral-100",
                  text: "text-neutral-700",
                };
                const formattedDate = formatOrderDate(order.createdAt);
                const orderCodeDisplay = order.code
                  ? order.code
                  : `#${order.id.replace("ORD-", "")}`;

                return (
                  <div
                    key={order.id}
                    onClick={() => {
                      if (onSelectOrder) {
                        onSelectOrder(order);
                        onClose();
                      }
                    }}
                    className="p-4 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 shadow-xs space-y-2.5 transition-all hover:border-neutral-300 cursor-pointer"
                  >
                    {/* Top Row: ID, Venue & State */}
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-extrabold text-xs text-neutral-900 shrink-0">
                          Order {orderCodeDisplay}
                        </span>
                        {order.venueName && (
                          <span className="text-[10px] font-bold text-[#fd8535] bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200/60 truncate">
                            {order.venueName}
                          </span>
                        )}
                        <span className="text-[10px] text-neutral-400 font-medium shrink-0">
                          {formattedDate}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${badge.bg} ${badge.text}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {/* Mode & Table / Counter Info */}
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-600">
                      <span>
                        {order.mode === "IN_VENUE"
                          ? `Table QR Dine-In • Table ${order.tableNumber || "01"}`
                          : "Counter Pickup"}
                      </span>
                      {order.slot && <span>• Slot: {order.slot}</span>}
                    </div>

                    {/* Items Summary */}
                    <div className="pt-1 border-t border-neutral-200/50 space-y-1">
                      {order.items.map((line, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs text-neutral-700 font-medium"
                        >
                          <span className="truncate pr-2">
                            {line.qty}x {line.name}
                          </span>
                          <span className="font-bold text-neutral-900 shrink-0">
                            Rs. {line.price * line.qty}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Row: Total */}
                    <div className="pt-1.5 border-t border-neutral-200/60 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">
                        Total Settled
                      </span>
                      <span className="font-black text-sm text-[#fd8535]">
                        Rs. {order.total}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 px-4 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center font-bold text-lg">
                  #
                </div>
                <h4 className="font-bold text-sm text-neutral-900">No Orders Placed Yet</h4>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Your past receipts and completed orders will appear here once you place your first order.
                </p>
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export default OrderHistorySheet;
