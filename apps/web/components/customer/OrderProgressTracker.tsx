"use client";

import { Zap, Check, Coffee } from "lucide-react";
import type { OrderData } from "@/lib/mockData";

interface OrderProgressTrackerProps {
  activeOrder: OrderData | null;
  onCancelOrder: (id: string) => void;
  onBrowseMenu: () => void;
}

export function OrderProgressTracker({
  activeOrder,
  onCancelOrder,
  onBrowseMenu,
}: OrderProgressTrackerProps) {
  if (!activeOrder) {
    return (
      <div className="p-4 space-y-4">
        <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">
          Active Pre-Order Status
        </h2>

        <div className="text-center py-12 px-4 bg-white rounded-3xl border border-neutral-200/80 shadow-soft">
          <Coffee className="w-10 h-10 text-neutral-300 mx-auto" />
          <h3 className="font-bold text-sm text-neutral-900 mt-2">No Active Pre-Orders</h3>
          <p className="text-xs text-neutral-500 mt-1">
            Select items and schedule your next counter pickup slot.
          </p>
          <button
            type="button"
            onClick={onBrowseMenu}
            className="mt-4 px-5 py-2 rounded-full bg-neutral-900 hover:bg-[#EF5A30] text-white font-bold text-xs transition-colors"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  const isPending = activeOrder.state === "PENDING_PAYMENT";
  const isScheduled = activeOrder.state === "SCHEDULED";
  const isPreparing = activeOrder.state === "PREPARING";
  const isReady = activeOrder.state === "READY";
  const isServed = activeOrder.state === "SERVED";

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">
          Active Pre-Order Status
        </h2>
      </div>

      {/* Digital Order Ticket */}
      <div className="p-4 rounded-3xl bg-neutral-900 text-white shadow-float relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-orange-400 fill-orange-400" />
            <span>
              {activeOrder.mode === "IN_VENUE"
                ? `Table #${activeOrder.tableNumber || "01"} Order Ticket`
                : "Counter Pickup Ticket"}
            </span>
          </span>
          <span className="text-xs font-bold text-neutral-400">
            {activeOrder.slot} ({activeOrder.breakSlot})
          </span>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-4xl font-black tracking-tight text-white">{activeOrder.code}</span>
          <span className="text-sm font-bold text-neutral-300">Rs. {activeOrder.total}</span>
        </div>

        <p className="text-xs text-neutral-400 mt-1">
          {activeOrder.mode === "IN_VENUE"
            ? `Food is being prepared for Table ${activeOrder.tableNumber || "01"}. Physical settlement at counter.`
            : "Show this number at the cafe counter acrylic stand when ready."}
        </p>

        {activeOrder.items && activeOrder.items.length > 0 && (
          <div className="mt-3 pt-3 border-t border-neutral-800 text-[11px] text-neutral-400 space-y-1">
            {activeOrder.items.map((it, i) => (
              <div key={i} className="flex justify-between">
                <span>
                  {it.qty}x {it.name}
                </span>
                <span>Rs. {it.price * it.qty}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5-Stage Vertical Timeline (Buy Bao Stepper) */}
      <div className="p-4 rounded-3xl bg-white border border-neutral-200/80 shadow-soft">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
          Preparation Timeline
        </h3>

        <div className="space-y-4 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
          {/* Step 1: Order Claim/Submission */}
          <div className="relative">
            <span
              className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white transition-all ${
                activeOrder.mode === "IN_VENUE"
                  ? "bg-neutral-900"
                  : isPending
                  ? "bg-[#fd8535] ring-4 ring-orange-100 animate-pulse"
                  : "bg-neutral-900"
              }`}
            >
              <Check className="w-3 h-3 text-white" />
            </span>
            <div>
              <p className="text-xs font-extrabold text-neutral-900">
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
                isScheduled
                  ? "bg-[#EF5A30] ring-4 ring-orange-100"
                  : isPreparing || isReady || isServed
                  ? "bg-neutral-900"
                  : "bg-neutral-300"
              }`}
            >
              2
            </span>
            <div>
              <p className="text-xs font-extrabold text-neutral-900">2. Confirmed & Scheduled</p>
              <p className="text-[11px] text-neutral-500">
                Cooking begins 10m before {activeOrder.slot}
              </p>
            </div>
          </div>

          {/* Step 3: Kitchen Preparing */}
          <div className="relative">
            <span
              className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white transition-all ${
                isPreparing
                  ? "bg-[#EF5A30] ring-4 ring-orange-100 animate-pulse"
                  : isReady || isServed
                  ? "bg-neutral-900"
                  : "bg-neutral-300"
              }`}
            >
              3
            </span>
            <div>
              <p className="text-xs font-extrabold text-neutral-900">3. Being Prepared</p>
              <p className="text-[11px] text-neutral-500">
                Cook is assembling your order on the hotline
              </p>
            </div>
          </div>

          {/* Step 4: Ready at Counter */}
          <div className="relative">
            <span
              className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white transition-all ${
                isReady
                  ? "bg-emerald-500 ring-4 ring-emerald-100 animate-pulse"
                  : isServed
                  ? "bg-neutral-900"
                  : "bg-neutral-300"
              }`}
            >
              4
            </span>
            <div>
              <p className="text-xs font-extrabold text-neutral-900">4. Ready for Pickup</p>
              <p className="text-[11px] text-neutral-500">
                Waiting on the counter tray. Please collect promptly.
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
          className="w-full py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-bold transition-colors"
        >
          Cancel Order (Before Kitchen Start)
        </button>
      )}
    </div>
  );
}
