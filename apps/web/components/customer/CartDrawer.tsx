"use client";

import { useState } from "react";
import { Drawer } from "vaul";
import {
  ArrowLeft,
  Flame,
  User,
  Store,
  CreditCard,
  Copy,
  Check,
  Clock,
  Ticket,
  AlertTriangle,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import type { VenueData, OrderData } from "@/lib/mockData";
import { useCartStore } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";
import { useSlotStore } from "@/lib/store/slotStore";
import { playChime } from "@/lib/audio";

interface CartDrawerProps {
  venue: VenueData;
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced: (order: OrderData) => void;
  onSelectTab: (tab: "menu" | "perks" | "status" | "profile") => void;
}

export function CartDrawer({
  venue,
  isOpen,
  onClose,
  onOrderPlaced,
  onSelectTab,
}: CartDrawerProps) {
  const {
    items,
    updateQuantity,
    promoCode,
    promoApplied,
    applyPromo,
    removePromo,
    getSubtotal,
    getVoucherDiscount,
    getFinalTotal,
    getItemCount,
    clearCart,
  } = useCartStore();

  const { currentUser, setAuthModal, setPendingPostAuthAction } = useAuthStore();
  const { availableSlots, selectedSlot, setSelectedSlot } = useSlotStore();

  const [selectedMethod, setSelectedMethod] = useState<"EASYPAISA" | "SADAPAY" | "BANK" | "CASH">("EASYPAISA");
  const [showPaymentPicker, setShowPaymentPicker] = useState(false);
  const [claimedTxnId, setClaimedTxnId] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [copiedText, setCopiedText] = useState("");
  const [localPromoInput, setLocalPromoInput] = useState(promoCode);
  const [errorMessage, setErrorMessage] = useState("");

  const cartSubtotal = getSubtotal();
  const voucherDiscount = getVoucherDiscount();
  const cartFinalTotal = getFinalTotal();
  const cartItemCount = getItemCount();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const handlePlaceOrder = () => {
    setErrorMessage("");

    if (!currentUser) {
      onClose();
      setAuthModal("WELCOME");
      setPendingPostAuthAction("CHECKOUT");
      return;
    }

    if (!currentUser.name || currentUser.name.trim() === "" || currentUser.name === "Guest Diner") {
      onClose();
      setAuthModal("ONBOARDING");
      setPendingPostAuthAction("CHECKOUT");
      return;
    }

    if (!selectedSlot) {
      setErrorMessage("Please select a pickup time slot.");
      return;
    }

    if (!claimedTxnId.trim() && selectedMethod !== "CASH") {
      setErrorMessage("Please enter the transaction reference ID (or select Cash on Pickup).");
      return;
    }

    if (!termsAccepted) {
      setErrorMessage("Please agree to the same-day counter pickup terms.");
      return;
    }

    const orderNumber = Math.floor(100 + Math.random() * 900);
    const newOrder: OrderData = {
      id: `ORD-${orderNumber}`,
      code: `#${orderNumber}`,
      customerName: currentUser.name,
      customerEmail: currentUser.email,
      items: items.map((line) => ({
        name: line.item.nameEn,
        qty: line.quantity,
        price: line.item.price,
        mods: line.selectedModifiers.map((m) => m.nameEn),
        note: line.note,
      })),
      total: cartFinalTotal,
      slot: selectedSlot.time,
      breakSlot: selectedSlot.breakSlot,
      state: "PENDING_PAYMENT",
      paymentMethod: selectedMethod,
      txnId: selectedMethod === "CASH" ? "CASH-ON-COUNTER" : claimedTxnId.trim(),
      hasScreenshot: true,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }),
      kitchenStartAt: selectedSlot.time,
      undoUntil: null,
      rejectionReason: null,
      refundOwed: false,
    };

    playChime();
    onOrderPlaced(newOrder);
    clearCart();
    onClose();
    onSelectTab("status");
  };

  const defaultPaymentMethod = {
    id: "pm-ep",
    kind: "EASYPAISA" as const,
    label: "Easypaisa Counter",
    accountTitle: "Brewery Cafe Gulberg",
    accountNumber: "0300-1234567",
    instructions: "Transfer exact amount & enter the 11-digit Txn ID.",
  };

  const activePaymentMethod =
    venue.paymentMethods.find((m) => m.kind === selectedMethod) ||
    venue.paymentMethods[0] ||
    defaultPaymentMethod;

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Drawer.Content className="fixed bottom-0 inset-x-0 z-50 max-w-md mx-auto h-full max-h-[96vh] bg-[#FFFBF8] rounded-t-[2.5rem] shadow-float overflow-hidden flex flex-col focus:outline-none">
          {/* iOS Handle */}
          <div className="pt-3 pb-1 flex justify-center shrink-0">
            <div className="w-12 h-1.5 rounded-full bg-neutral-300" />
          </div>

          {/* Top App Header */}
          <div className="p-4 border-b border-neutral-200/80 flex items-center justify-between bg-white shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition-colors"
              title="Return to Menu"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#FF6B42] to-[#EF5A30] flex items-center justify-center text-white shadow-sm">
                <Flame className="w-4 h-4 fill-white" />
              </div>
              <span className="font-extrabold text-sm text-neutral-900 tracking-tight">
                Queue<span className="text-[#EF5A30]">Less</span>
              </span>
              <span className="text-neutral-300 font-bold">•</span>
              <span className="font-extrabold text-sm text-neutral-900">Cart</span>
            </div>

            {currentUser ? (
              <div
                className="w-8 h-8 rounded-full bg-neutral-900 text-white font-extrabold text-xs flex items-center justify-center shadow-xs"
                title={currentUser.name}
              >
                {currentUser.name
                  ? currentUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "AA"}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setAuthModal("WELCOME");
                  setPendingPostAuthAction(null);
                }}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition-colors shadow-xs"
                title="Sign In / Register"
              >
                <User className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Scrollable Cart Content Area */}
          <div className="p-4 overflow-y-auto no-scrollbar space-y-4 flex-1">
            {/* Header / Venue Name */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-neutral-900 tracking-tight flex items-center gap-1.5">
                  <span>Your Order</span>
                  <span className="w-2 h-2 rounded-full bg-[#EF5A30] inline-block" />
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                  <Store className="w-3.5 h-3.5 text-[#EF5A30]" />
                  <span>{venue.name} • Counter Pickup</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 font-bold text-xs">
                {cartItemCount} {cartItemCount === 1 ? "Item" : "Items"}
              </span>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Items List */}
            {items.length > 0 ? (
              <div className="bg-white rounded-3xl p-4 border border-neutral-100/90 shadow-soft divide-y divide-neutral-100">
                {items.map((line, idx) => {
                  const modTotal = line.selectedModifiers.reduce((s, m) => s + m.priceDelta, 0);
                  const itemTotal = (line.item.price + modTotal) * line.quantity;
                  const modsText = line.selectedModifiers.map((m) => m.nameEn).join(" • ");

                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between gap-3 ${
                        idx > 0 ? "pt-3.5" : ""
                      } ${idx < items.length - 1 ? "pb-3.5" : ""}`}
                    >
                      <img
                        src={line.item.image}
                        alt={line.item.nameEn}
                        className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-neutral-100/80 shadow-xs"
                      />

                      <div className="flex-1 min-w-0 pr-1">
                        <h4 className="font-extrabold text-sm text-neutral-900 truncate">
                          {line.item.nameEn}
                        </h4>
                        <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                          {modsText || line.note || line.item.description || "Freshly Prepared"}
                        </p>
                        <span className="font-black text-sm text-[#EF5A30] mt-1 block">
                          Rs. {itemTotal}
                        </span>
                      </div>

                      {/* Stepper Pill */}
                      <div className="flex items-center bg-neutral-100 rounded-full p-1 gap-1.5 shrink-0 shadow-inner">
                        <button
                          type="button"
                          onClick={() => updateQuantity(idx, -1)}
                          title={line.quantity === 1 ? "Remove item" : "Decrease quantity"}
                          className="w-7 h-7 rounded-full bg-white text-neutral-700 hover:text-red-500 flex items-center justify-center shadow-xs transition-transform active:scale-95"
                        >
                          {line.quantity === 1 ? (
                            <Trash2 className="w-3.5 h-3.5 text-neutral-400 hover:text-red-500" />
                          ) : (
                            <Minus className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <span className="w-4 text-center text-xs font-black text-neutral-900">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(idx, 1)}
                          title="Increase quantity"
                          className="w-7 h-7 rounded-full bg-[#EF5A30] text-white hover:bg-[#D94820] flex items-center justify-center shadow-xs transition-transform active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-3xl border border-neutral-100 shadow-soft">
                <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-neutral-600">Your cart is empty</p>
              </div>
            )}

            {/* Payment Method Card */}
            <div className="bg-white rounded-3xl p-4 border border-neutral-100/90 shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0">
                    <CreditCard className="w-5 h-5 text-neutral-800" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">
                      Payment Rail
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-extrabold text-neutral-900">
                        {selectedMethod === "EASYPAISA" && "Easypaisa • 0300-1234567"}
                        {selectedMethod === "SADAPAY" && "SadaPay • 0300-9876543"}
                        {selectedMethod === "BANK" && "Meezan Raast • 000123"}
                        {selectedMethod === "CASH" && "Cash on Pickup"}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-500">
                        Venue Direct
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPaymentPicker(!showPaymentPicker)}
                  className="text-xs font-bold text-[#EF5A30] hover:underline"
                >
                  {showPaymentPicker ? "Done" : "Change"}
                </button>
              </div>

              {/* Expandable Payment Rail Selector */}
              {showPaymentPicker && (
                <div className="pt-3 border-t border-neutral-100 space-y-2.5">
                  <span className="text-[11px] font-bold text-neutral-600 block">
                    Select Venue Payment Rail:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {venue.paymentMethods.map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setSelectedMethod(pm.kind)}
                        className={`py-2 px-1 rounded-2xl border text-center text-xs font-bold transition-all ${
                          selectedMethod === pm.kind
                            ? "bg-neutral-950 text-white border-neutral-950 shadow-xs"
                            : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                        }`}
                      >
                        {pm.kind}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSelectedMethod("CASH")}
                      className={`py-2 px-1 rounded-2xl border text-center text-xs font-bold transition-all ${
                        selectedMethod === "CASH"
                          ? "bg-neutral-950 text-white border-neutral-950 shadow-xs"
                          : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      CASH
                    </button>
                  </div>
                </div>
              )}

              {/* Direct Settlement Details */}
              {selectedMethod !== "CASH" ? (
                <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-neutral-500">
                      Account Title:{" "}
                      <strong className="text-neutral-800">{activePaymentMethod.accountTitle}</strong>
                    </span>
                    <span className="font-black text-[#EF5A30]">Amount: Rs. {cartFinalTotal}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-neutral-200/80 font-mono text-xs font-bold">
                    <span>{activePaymentMethod.accountNumber}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(activePaymentMethod.accountNumber)}
                      className="px-2 py-0.5 rounded-md bg-neutral-100 border text-[10px] font-sans font-bold hover:bg-neutral-200 transition-colors"
                    >
                      {copiedText === activePaymentMethod.accountNumber ? (
                        <span className="flex items-center gap-1 text-emerald-600">
                          <Check className="w-3 h-3" />
                          <span>Copied</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </span>
                      )}
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-neutral-700">
                        Transaction Reference ID *
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setClaimedTxnId(`EP-${Math.floor(1000000 + Math.random() * 9000000)}`)
                        }
                        className="text-[10px] font-bold text-[#EF5A30] hover:underline"
                      >
                        Auto-fill Test ID
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. EP-9823411 or Bank Txn ID"
                      value={claimedTxnId}
                      onChange={(e) => setClaimedTxnId(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-mono font-bold focus:ring-1 focus:ring-[#EF5A30] focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-[11px] text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    Pay exact amount (Rs. {cartFinalTotal}) in cash at register counter upon collection.
                  </span>
                </div>
              )}
            </div>

            {/* Pickup Slot Selection Card */}
            <div className="bg-white rounded-3xl p-4 border border-neutral-100/90 shadow-soft space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#EF5A30]" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                    Pickup Slot (Anti-Queue)
                  </span>
                </div>
                <span className="text-[10px] text-[#EF5A30] font-bold">10m Prep Lead</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {availableSlots.map((s, idx) => {
                  const isSel = selectedSlot && selectedSlot.time === s.time;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={s.status === "full"}
                      onClick={() => setSelectedSlot(s)}
                      className={`p-2.5 rounded-2xl border text-center shrink-0 min-w-[78px] transition-all ${
                        isSel
                          ? "bg-neutral-950 text-white border-neutral-950 shadow-md scale-102"
                          : s.status === "full"
                          ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed"
                          : "bg-neutral-50 text-neutral-800 border-neutral-200 hover:border-neutral-400"
                      }`}
                    >
                      <p className="font-black text-xs">{s.time}</p>
                      <p className="text-[9px] mt-0.5 opacity-80">{s.breakSlot}</p>
                      <span
                        className={`inline-block mt-1 text-[8px] font-extrabold uppercase px-1 rounded ${
                          s.status === "available"
                            ? "bg-emerald-100 text-emerald-800"
                            : s.status === "filling"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-neutral-200 text-neutral-500"
                        }`}
                      >
                        {s.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Voucher Discount Code Card */}
            <div className="bg-white rounded-3xl p-3.5 border border-neutral-100/90 shadow-soft flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-1">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#EF5A30] flex items-center justify-center shrink-0">
                  <Ticket className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Voucher code (e.g. FAST20)"
                  value={localPromoInput}
                  onChange={(e) => setLocalPromoInput(e.target.value)}
                  className="w-full text-xs font-bold text-neutral-800 bg-transparent focus:outline-none placeholder:text-neutral-400 uppercase"
                />
              </div>

              {promoApplied ? (
                <button
                  type="button"
                  onClick={() => {
                    removePromo();
                    setLocalPromoInput("");
                  }}
                  className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 font-extrabold text-xs flex items-center gap-1 hover:bg-emerald-100 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" /> Applied (Remove)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const code = localPromoInput.trim() || "FAST20";
                    applyPromo(code);
                    setLocalPromoInput(code);
                  }}
                  className="px-4 py-1.5 rounded-full bg-neutral-950 text-white font-extrabold text-xs hover:bg-[#EF5A30] transition-colors"
                >
                  Apply
                </button>
              )}
            </div>

            {/* Order Summary Card */}
            <div className="bg-white rounded-3xl p-4 border border-neutral-100/90 shadow-soft space-y-3 text-xs">
              <h4 className="font-extrabold text-sm text-neutral-900">Order Summary</h4>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-neutral-900">Rs. {cartSubtotal}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Counter Pickup Fee</span>
                  <span className="font-bold text-emerald-600">Free</span>
                </div>
                {promoApplied && (
                  <div className="flex items-center justify-between text-emerald-600 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Voucher Discount ({promoCode || "FAST20"})</span>
                    </span>
                    <span>-Rs. {voucherDiscount}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-neutral-100 pt-3 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-base text-neutral-950 block">Total</span>
                  <span className="text-[10px] text-neutral-400">
                    Includes all local taxes & fees
                  </span>
                </div>
                <span className="text-xl font-black text-neutral-950">Rs. {cartFinalTotal}</span>
              </div>
            </div>

            {/* Terms Acknowledgment */}
            <div className="flex items-start gap-2 px-1">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 accent-[#EF5A30] rounded cursor-pointer"
              />
              <label
                htmlFor="terms"
                className="text-[10px] text-neutral-500 leading-tight cursor-pointer select-none"
              >
                I understand orders are prepared for same-day counter pickup. Orders held 30m past
                pickup slot are counter no-shows (TERMS_DRAFT).
              </label>
            </div>
          </div>

          {/* Bottom Sticky Action CTA */}
          <div className="p-4 bg-white/95 backdrop-blur-md border-t border-neutral-100 shrink-0">
            <button
              type="button"
              disabled={items.length === 0}
              onClick={handlePlaceOrder}
              className={`w-full py-4 px-6 rounded-full font-extrabold text-sm flex items-center justify-between transition-all active:scale-[0.99] ${
                items.length > 0
                  ? "bg-[#EF5A30] hover:bg-[#D94820] text-white shadow-[0_8px_24px_rgba(239,90,48,0.35)] cursor-pointer"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              <span className="flex items-center gap-2">
                Place Order <ArrowRight className="w-4 h-4" />
              </span>
              <span className="text-base font-black">Rs. {cartFinalTotal}</span>
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
