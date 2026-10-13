"use client";

import { Check } from "lucide-react";
import { QueueLessMascot } from "@/components/mascot/QueueLessMascot";
import type { OrderData } from "@/lib/mockData";

interface OrderProgressTrackerProps {
  activeOrder: (OrderData & { venueName?: string | undefined; tenantSlug?: string | undefined }) | null;
  onCancelOrder: (id: string) => void;
  onBrowseMenu: () => void;
  allOrders?: (OrderData & { venueName?: string | undefined; tenantSlug?: string | undefined })[] | undefined;
  selectedOrderId?: string | null | undefined;
  onSelectOrder?: ((id: string) => void) | undefined;
  historyOrders?: (OrderData & { venueName?: string | undefined; tenantSlug?: string | undefined })[] | undefined;
}

export function OrderProgressTracker({
  activeOrder,
  onCancelOrder,
  onBrowseMenu,
  allOrders,
  selectedOrderId,
  onSelectOrder,
  historyOrders,
}: OrderProgressTrackerProps) {
  if (!activeOrder) {
    return (
      <div className="p-4 space-y-4">
        <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">
          Active Pre-Order Status
        </h2>

        <div className="text-center py-10 px-4 bg-white rounded-3xl border border-neutral-200/80 shadow-soft">
          <QueueLessMascot state="sad" size="md" className="mx-auto mb-3" />
          <h3 className="font-bold text-sm text-neutral-900 mt-1">No Active Pre-Orders</h3>
          <p className="text-xs text-neutral-500 mt-1">
            Select items and schedule your next counter pickup slot.
          </p>
          <button
            type="button"
            onClick={onBrowseMenu}
            className="mt-4 px-5 py-2 rounded-full bg-neutral-900 hover:bg-[#fd8535] text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Browse Menu
          </button>
        </div>

        {/* If past orders exist, show history even when no active order */}
        {historyOrders && historyOrders.length > 0 && (
          <div className="pt-2 space-y-2.5">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-neutral-400">
              Past Orders History ({historyOrders.length})
            </h3>
            <div className="space-y-2">
              {historyOrders.map((order) => {
                const formattedDate = /^\d{1,2}:\d{2}/.test(order.createdAt || "")
                  ? `Today at ${order.createdAt}`
                  : order.createdAt || "Recently";

                return (
                  <div
                    key={order.id}
                    onClick={() => onSelectOrder?.(order.id)}
                    className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 hover:border-neutral-300 shadow-2xs transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-xs text-neutral-900">
                            {order.code}
                          </span>
                          {order.venueName && (
                            <span className="text-[11px] font-bold text-neutral-500">
                              • {order.venueName}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-400 font-medium mt-0.5">
                          {formattedDate} • Slot: {order.slot}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-black text-xs text-[#fd8535]">
                          Rs. {order.total}
                        </span>
                        <p className="text-[9px] font-bold text-neutral-400 uppercase mt-0.5">
                          {order.state.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  const isPending = activeOrder.state === "PENDING_PAYMENT";
  const isScheduled = activeOrder.state === "SCHEDULED";
  const isPreparing = activeOrder.state === "PREPARING";
  const isReady = activeOrder.state === "READY";
  const isServed = activeOrder.state === "SERVED";

  const step1Completed = activeOrder.mode === "IN_VENUE" || !isPending;
  const step2Completed = isPreparing || isReady || isServed;
  const step3Completed = isReady || isServed;
  const step4Completed = isServed;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">
          Active Pre-Order Status
        </h2>
      </div>

      {/* Multi-Order Tabs Strip (All Venues Shared Order Tracker) */}
      {allOrders && allOrders.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {allOrders.map((o) => {
            const isSelected = o.id === activeOrder.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => onSelectOrder?.(o.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isSelected
                    ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                    : "bg-white text-neutral-700 border-neutral-200/90 hover:bg-neutral-50 hover:border-neutral-300"
                }`}
              >
                <span>{o.venueName || "Venue"}</span>
                <span className="opacity-70 font-mono">{o.code}</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    o.state === "READY"
                      ? "bg-emerald-400 animate-pulse"
                      : o.state === "PREPARING"
                      ? "bg-amber-400 animate-pulse"
                      : "bg-[#fd8535]"
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Digital Order Ticket */}
      <div className="p-4 rounded-3xl bg-neutral-900 text-white shadow-float relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400">
            {activeOrder.mode === "IN_VENUE"
              ? "Order Ticket"
              : "Counter Pickup Ticket"}
          </span>
          {activeOrder.mode !== "IN_VENUE" && (
            <span className="text-xs font-bold text-neutral-400">
              {activeOrder.slot} ({activeOrder.breakSlot})
            </span>
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-4xl font-black tracking-tight text-white">{activeOrder.code}</span>
        </div>

        {activeOrder.mode !== "IN_VENUE" && (
          <p className="text-xs text-neutral-400 mt-1">
            Show this number at the cafe counter acrylic stand when ready.
          </p>
        )}

        {activeOrder.items && activeOrder.items.length > 0 && (
          <div className="mt-3 pt-3 border-t border-neutral-800 text-[11px] text-neutral-400 space-y-1">
            {activeOrder.items.map((it, i) => (
              <div key={i} className="flex justify-between">
                <span>
                  {it.qty}x {it.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4-Stage Vertical Timeline (Buy Bao Stepper) */}
      <div className="p-4 rounded-3xl bg-white border border-neutral-200/80 shadow-soft">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
          Preparation Timeline
        </h3>

        <div className="space-y-4 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
          {/* Step 1: Order Claim/Submission */}
          <div className="relative">
            <span
              className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white transition-all ${
                step1Completed
                  ? "bg-[#1546d9]"
                  : "bg-[#fd8535] ring-4 ring-orange-100 animate-pulse"
              }`}
            >
              {step1Completed ? <Check className="w-3 h-3 text-white" /> : "1"}
            </span>
            <div>
              <p
                className={`text-xs font-extrabold ${
                  step1Completed ? "text-[#1546d9]" : "text-neutral-900"
                }`}
              >
                {activeOrder.mode === "IN_VENUE"
                  ? "1. Order Sent to Kitchen"
                  : "1. Awaiting Payment Confirmation"}
              </p>
              <p className="text-[11px] text-neutral-500">
                {activeOrder.mode === "IN_VENUE"
                  ? `Table ${activeOrder.tableNumber || "01"} • Linked to table session`
                  : `${activeOrder.paymentMethod} Txn: ${activeOrder.txnId}`}
              </p>
            </div>
          </div>

          {/* Step 2: Confirmed & Scheduled */}
          <div className="relative">
            <span
              className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white transition-all ${
                step2Completed
                  ? "bg-[#1546d9]"
                  : isScheduled
                  ? "bg-[#fd8535] ring-4 ring-orange-100 animate-pulse"
                  : "bg-neutral-300"
              }`}
            >
              {step2Completed ? <Check className="w-3 h-3 text-white" /> : "2"}
            </span>
            <div>
              <p
                className={`text-xs font-extrabold ${
                  step2Completed
                    ? "text-[#1546d9]"
                    : isScheduled
                    ? "text-neutral-900"
                    : "text-neutral-500"
                }`}
              >
                {activeOrder.mode === "IN_VENUE" ? "2. Kitchen Ticket Dispatched" : "2. Confirmed & Scheduled"}
              </p>
              <p className="text-[11px] text-neutral-500">
                {activeOrder.mode === "IN_VENUE"
                  ? "Order sent directly to kitchen station"
                  : `Cooking begins 10m before ${activeOrder.slot}`}
              </p>
            </div>
          </div>

          {/* Step 3: Kitchen Preparing */}
          <div className="relative">
            <span
              className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white transition-all ${
                step3Completed
                  ? "bg-[#1546d9]"
                  : isPreparing
                  ? "bg-[#fd8535] ring-4 ring-orange-100 animate-pulse"
                  : "bg-neutral-300"
              }`}
            >
              {step3Completed ? <Check className="w-3 h-3 text-white" /> : "3"}
            </span>
            <div>
              <p
                className={`text-xs font-extrabold ${
                  step3Completed
                    ? "text-[#1546d9]"
                    : isPreparing
                    ? "text-neutral-900"
                    : "text-neutral-500"
                }`}
              >
                3. Being Prepared
              </p>
              <p className="text-[11px] text-neutral-500">
                Cook is assembling your order on the hotline
              </p>
            </div>
          </div>

          {/* Step 4: Ready at Counter / Served to Table */}
          <div className="relative">
            <span
              className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white transition-all ${
                step4Completed
                  ? "bg-[#1546d9]"
                  : isReady
                  ? "bg-emerald-500 ring-4 ring-emerald-100 animate-pulse"
                  : "bg-neutral-300"
              }`}
            >
              {step4Completed ? <Check className="w-3 h-3 text-white" /> : "4"}
            </span>
            <div>
              <p
                className={`text-xs font-extrabold ${
                  step4Completed
                    ? "text-[#1546d9]"
                    : isReady
                    ? "text-emerald-700"
                    : "text-neutral-500"
                }`}
              >
                {activeOrder.mode === "IN_VENUE" ? "4. Served to Table" : "4. Ready for Pickup"}
              </p>
              <p className="text-[11px] text-neutral-500">
                {activeOrder.mode === "IN_VENUE"
                  ? `Delivered to Table ${activeOrder.tableNumber || "04"}. Enjoy your meal!`
                  : "Waiting on the counter tray. Please collect promptly."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Action (Valid before kitchen start) */}
      {!isPreparing && !isReady && !isServed && (
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Cancel this pre-order? If payment was confirmed, refund will be queued.")) {
              onCancelOrder(activeOrder.id);
            }
          }}
          className="w-full py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-bold transition-colors cursor-pointer"
        >
          Cancel Order (Before Kitchen Start)
        </button>
      )}

      {/* Order History: List of All Orders Made */}
      {historyOrders && historyOrders.length > 0 && (
        <div className="pt-3 border-t border-neutral-200/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-neutral-400">
              All Orders Made ({historyOrders.length})
            </h3>
          </div>

          <div className="space-y-2">
            {historyOrders.map((order) => {
              const formattedDate = /^\d{1,2}:\d{2}/.test(order.createdAt || "")
                ? `Today at ${order.createdAt}`
                : order.createdAt || "Recently";

              const isSelected = order.id === activeOrder.id;

              return (
                <div
                  key={order.id}
                  onClick={() => onSelectOrder?.(order.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-orange-50/50 border-[#fd8535]/50 shadow-xs"
                      : "bg-white border-neutral-200/80 hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-xs text-neutral-900">
                          {order.code}
                        </span>
                        {order.venueName && (
                          <span className="text-[11px] font-bold text-neutral-500">
                            • {order.venueName}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-400 font-medium mt-0.5">
                        {formattedDate} • Slot: {order.slot}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-xs text-[#fd8535]">
                        Rs. {order.total}
                      </span>
                      <p className="text-[9px] font-bold text-neutral-400 uppercase mt-0.5">
                        {order.state.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
