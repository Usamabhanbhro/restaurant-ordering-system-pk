"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Drawer } from "vaul";
import {
  CreditCard,
  Check,
  Clock,
  Ticket,
  AlertTriangle,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import type { VenueData, OrderData, OrderingMode, TableContext } from "@/lib/mockData";
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
  mode?: OrderingMode;
  tableContext?: TableContext | null;
}

export function CartDrawer({
  venue,
  isOpen,
  onClose,
  onOrderPlaced,
  onSelectTab,
  mode = "REMOTE",
  tableContext,
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

  const [selectedMethod, setSelectedMethod] = useState<"EASYPAISA" | "SADAPAY" | "BANK">("EASYPAISA");
  const [showPaymentPicker, setShowPaymentPicker] = useState(false);
  const [claimedTxnId, setClaimedTxnId] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [copiedText, setCopiedText] = useState("");
  const [localPromoInput, setLocalPromoInput] = useState(promoCode);
  const [errorMessage, setErrorMessage] = useState("");

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const termsRef = useRef<HTMLDivElement>(null);

  // Pickup Slots horizontal scroll affordances & arrow controls
  const slotsScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollSlotsLeft, setCanScrollSlotsLeft] = useState(false);
  const [canScrollSlotsRight, setCanScrollSlotsRight] = useState(false);

  const checkSlotsScroll = useCallback(() => {
    const el = slotsScrollRef.current;
    if (!el) {
      setCanScrollSlotsLeft(false);
      setCanScrollSlotsRight(false);
      return;
    }
    const hasLeft = el.scrollLeft > 2;
    const hasRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 4;
    setCanScrollSlotsLeft(hasLeft);
    setCanScrollSlotsRight(hasRight);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(checkSlotsScroll, 150);
      window.addEventListener("resize", checkSlotsScroll);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", checkSlotsScroll);
      };
    }
  }, [isOpen, checkSlotsScroll, availableSlots]);

  const scrollSlotsBy = (offset: number) => {
    if (slotsScrollRef.current) {
      slotsScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

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

    if (mode === "REMOTE") {
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
        scrollContainerRef.current?.scrollTo({ top: 120, behavior: "smooth" });
        return;
      }

      if (!claimedTxnId.trim()) {
        setErrorMessage("Please enter the transaction reference ID.");
        scrollContainerRef.current?.scrollTo({ top: 40, behavior: "smooth" });
        return;
      }

      if (!termsAccepted) {
        setErrorMessage("Please agree to the same-day counter pickup terms.");
        termsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }

    const orderNumber = Math.floor(100 + Math.random() * 900);
    const assignedTable = tableContext?.tableNumber || "01";
    const assignedZone = tableContext?.zoneSlug || "main-hall";

    const newOrder: OrderData = {
      id: `ORD-${orderNumber}`,
      code: `#${orderNumber}`,
      customerName:
        mode === "IN_VENUE"
          ? currentUser?.name && currentUser.name !== "Guest Diner"
            ? currentUser.name
            : `Table ${assignedTable} Diner`
          : currentUser!.name,
      customerEmail:
        mode === "IN_VENUE"
          ? currentUser?.email || `table-${assignedTable}@guest.local`
          : currentUser!.email,
      items: items.map((line) => ({
        name: line.item.nameEn,
        qty: line.quantity,
        price: line.item.price,
        mods: line.selectedModifiers.map((m) => m.nameEn),
        note: line.note,
      })),
      total: cartFinalTotal,
      slot: mode === "IN_VENUE" ? selectedSlot?.time || "Immediate" : selectedSlot!.time,
      breakSlot: mode === "IN_VENUE" ? selectedSlot?.breakSlot || `Table #${assignedTable}` : selectedSlot!.breakSlot,
      state: mode === "IN_VENUE" ? "PREPARING" : "PENDING_PAYMENT",
      paymentMethod: mode === "IN_VENUE" ? "COUNTER_PHYSICAL" : selectedMethod,
      txnId:
        mode === "IN_VENUE"
          ? `TABLE-${assignedTable}`
          : claimedTxnId.trim(),
      hasScreenshot: false,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }),
      kitchenStartAt: selectedSlot?.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }),
      undoUntil: null,
      rejectionReason: null,
      refundOwed: false,
      mode: mode,
      zoneSlug: assignedZone,
      tableNumber: assignedTable,
      tableLabel: `Table ${assignedTable}${tableContext?.zoneName ? ` • ${tableContext.zoneName}` : ""}`,
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
        <Drawer.Content className="fixed bottom-0 inset-x-0 z-50 max-w-md mx-auto h-full max-h-[96vh] bg-white rounded-t-[2.5rem] shadow-float overflow-hidden flex flex-col focus:outline-none">
          {/* iOS Handle */}
          <div className="pt-3 pb-1 flex justify-center shrink-0">
            <div className="w-12 h-1.5 rounded-full bg-neutral-300" />
          </div>

          {/* Top App Header: Only "Cart" */}
          <div className="py-3.5 px-4 border-b border-neutral-100 flex items-center justify-center bg-white shrink-0">
            <h3 className="font-extrabold text-base text-neutral-900 tracking-tight">
              Cart
            </h3>
          </div>

          {/* Scrollable Cart Content Area */}
          <div ref={scrollContainerRef} className="p-4 overflow-y-auto no-scrollbar space-y-4 flex-1">
            {/* Header: Your Order */}
            <div>
              <h2 className="text-lg font-black text-neutral-900 tracking-tight">
                Your Order
              </h2>
            </div>

            {/* Error Message if any (non-terms errors displayed at top) */}
            {errorMessage && !errorMessage.includes("terms") && (
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
                        {(() => {
                          const subtitle =
                            modsText ||
                            line.note ||
                            (line.item.description &&
                            line.item.description.trim().toLowerCase() !== line.item.nameEn.trim().toLowerCase()
                              ? line.item.description
                              : "");
                          if (!subtitle || subtitle.trim().toLowerCase() === line.item.nameEn.trim().toLowerCase()) {
                            return null;
                          }
                          return (
                            <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                              {subtitle}
                            </p>
                          );
                        })()}
                        <span className="font-black text-sm text-[#fd8535] mt-1 block">
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
                          className="w-7 h-7 rounded-full bg-[#fd8535] text-white hover:bg-[#e0681c] flex items-center justify-center shadow-xs transition-transform active:scale-95"
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

            {/* Payment Section (Shown in Remote Mode, HIDDEN in In-Venue Mode per specification) */}
            {mode === "REMOTE" ? (
              <div className="bg-white rounded-3xl p-4 border border-neutral-100/90 shadow-soft space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0">
                      <CreditCard className="w-5 h-5 text-neutral-800" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">
                        Payment Method
                      </span>
                      <span className="text-xs font-extrabold text-neutral-900 block mt-0.5">
                        {selectedMethod === "EASYPAISA" && "Easypaisa"}
                        {selectedMethod === "SADAPAY" && "SadaPay"}
                        {selectedMethod === "BANK" && "Bank Transfer / Raast"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPaymentPicker(!showPaymentPicker)}
                    className="text-xs font-bold text-[#fd8535] hover:underline"
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
                    <div className="grid grid-cols-3 gap-1.5">
                      {venue.paymentMethods
                        .filter((pm) => pm.kind !== "CASH")
                        .map((pm) => (
                          <button
                            key={pm.id}
                            type="button"
                            onClick={() => setSelectedMethod(pm.kind as "EASYPAISA" | "SADAPAY" | "BANK")}
                            className={`py-2 px-1 rounded-2xl border text-center text-xs font-bold transition-all ${
                              selectedMethod === pm.kind
                                ? "bg-neutral-950 text-white border-neutral-950 shadow-xs"
                                : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                            }`}
                          >
                            {pm.kind}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Direct Settlement Details */}
                <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 space-y-2.5 text-xs shadow-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-neutral-500">
                      Account Title:{" "}
                      <strong className="text-neutral-800">{activePaymentMethod.accountTitle}</strong>
                    </span>
                    <span className="font-black text-[#fd8535]">Amount: Rs. {cartFinalTotal}</span>
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
                        className="text-[10px] font-bold text-[#fd8535] hover:underline"
                      >
                        Auto-fill Test ID
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. EP-9823411 or Bank Txn ID"
                      value={claimedTxnId}
                      onChange={(e) => setClaimedTxnId(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-mono font-bold focus:ring-1 focus:ring-[#fd8535] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* In-Venue Table Card: Confirms dining location */
              <div className="bg-white rounded-3xl p-4 border border-neutral-100/90 shadow-soft flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#1546d9] shrink-0" />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">
                    Dining Location
                  </span>
                  <span className="text-xs font-extrabold text-neutral-900">
                    Table {tableContext?.tableNumber || "04"}{tableContext?.zoneName ? ` • ${tableContext.zoneName}` : ""}
                  </span>
                </div>
              </div>
            )}

            {/* Pickup Slot Selection Card (Remote Ordering Only) */}
            {mode === "REMOTE" && (
              <div className="bg-white rounded-3xl p-4 border border-neutral-100/90 shadow-soft space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#fd8535]" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                      Slot
                    </span>
                  </div>
                  <span className="text-[10px] text-[#fd8535] font-bold">10m Prep Lead</span>
                </div>

                <div className="relative">
                  {/* Left Scroll Gradient Affordance & Button */}
                  {canScrollSlotsLeft && (
                    <div className="absolute left-0 top-0 bottom-1 z-10 flex items-center bg-gradient-to-r from-white via-white/90 to-transparent pr-4 pl-0.5 pointer-events-auto">
                      <button
                        type="button"
                        onClick={() => scrollSlotsBy(-140)}
                        aria-label="Scroll slots left"
                        className="w-6 h-6 rounded-full bg-white shadow-md border border-neutral-200/80 flex items-center justify-center text-neutral-700 hover:bg-neutral-50 active:scale-95 transition-all"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Scrollable Slots Track */}
                  <div
                    ref={slotsScrollRef}
                    onScroll={checkSlotsScroll}
                    className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-1"
                  >
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

                  {/* Right Scroll Gradient Affordance & Button */}
                  {canScrollSlotsRight && (
                    <div className="absolute right-0 top-0 bottom-1 z-10 flex items-center bg-gradient-to-l from-white via-white/90 to-transparent pl-4 pr-0.5 pointer-events-auto">
                      <button
                        type="button"
                        onClick={() => scrollSlotsBy(140)}
                        aria-label="Scroll slots right"
                        className="w-6 h-6 rounded-full bg-white shadow-md border border-neutral-200/80 flex items-center justify-center text-neutral-700 hover:bg-neutral-50 active:scale-95 transition-all"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Voucher Discount Code Card */}
            <div className="bg-white rounded-3xl p-3.5 border border-neutral-100/90 shadow-soft space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-1">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#fd8535] flex items-center justify-center shrink-0">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter any code for Rs. 50 off (e.g. PROMO50)"
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
                    className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 font-extrabold text-xs flex items-center gap-1 hover:bg-emerald-100 transition-colors shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" /> Applied (Remove)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const code = localPromoInput.trim() || "PROMO50";
                      applyPromo(code);
                      setLocalPromoInput(code);
                    }}
                    className="px-4 py-1.5 rounded-full bg-neutral-950 text-white font-extrabold text-xs hover:bg-[#fd8535] transition-colors shrink-0"
                  >
                    Apply
                  </button>
                )}
              </div>
              <p className="text-[10px] text-neutral-400 pl-1">
                Any voucher code entered here applies a Rs. 50 discount to your total.
              </p>
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
                      <span>Voucher Discount ({promoCode || "PROMO50"})</span>
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
            <div ref={termsRef} className="space-y-2 px-1">
              {errorMessage && errorMessage.includes("terms") && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (e.target.checked && errorMessage.includes("terms")) {
                      setErrorMessage("");
                    }
                  }}
                  className="mt-0.5 accent-[#fd8535] rounded cursor-pointer"
                />
                <label
                  htmlFor="terms"
                  className={`text-[10px] leading-tight cursor-pointer select-none ${
                    errorMessage && errorMessage.includes("terms")
                      ? "text-red-600 font-semibold"
                      : "text-neutral-500"
                  }`}
                >
                  {mode === "IN_VENUE"
                    ? `I confirm this order is for Table ${tableContext?.tableNumber || "01"}. Payment will be settled at the counter physically.`
                    : "I understand orders are prepared for same-day counter pickup. Orders held 30m past pickup slot are counter no-shows (TERMS_DRAFT)."}
                </label>
              </div>
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
                  ? "bg-[#fd8535] hover:bg-[#e0681c] text-white shadow-[0_8px_24px_rgba(253,133,53,0.35)] cursor-pointer"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              <span className="flex items-center gap-2">
                {mode === "IN_VENUE" ? "Send Order to Kitchen" : "Place Order"}{" "}
                <ArrowRight className="w-4 h-4" />
              </span>
              <span className="text-base font-black">Rs. {cartFinalTotal}</span>
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
