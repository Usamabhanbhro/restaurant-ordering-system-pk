"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Drawer } from "vaul";
import {
  CreditCard,
  Check,
  Clock,
  Ticket,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Copy,
  Upload,
} from "lucide-react";
import type { VenueData, OrderData, OrderingMode, TableContext } from "@/lib/mockData";
import { useCartStore, EMPTY_CART } from "@/lib/store/cartStore";
import { useOrderStore } from "@/lib/store/orderStore";
import { getRegistryVenueBySlug } from "@/lib/domain/venue/venueRegistry";
import { useAuthStore } from "@/lib/store/authStore";
import { useSlots } from "@/lib/hooks/useSlots";
import { useCheckout } from "@/lib/hooks/useCheckout";
import { useOrderingMode } from "@/lib/domain/ordering/OrderingModeContext";
import { toOrderData } from "@/lib/domain/order/orderViewModel";
import { playChime } from "@/lib/audio";

interface CartDrawerProps {
  venue: VenueData;
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced?: (order: OrderData) => void;
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
  const cartsByTenant = useCartStore((s) => s.cartsByTenant);
  const promosByTenant = useCartStore((s) => s.promosByTenant);
  const [selectedCartSlug, setSelectedCartSlug] = useState<string>(venue.slug || "burns-road-cafe");

  useEffect(() => {
    if (venue.slug) {
      setSelectedCartSlug(venue.slug);
    }
  }, [venue.slug]);

  const populatedSlugs = useMemo(() => {
    return Object.keys(cartsByTenant).filter(
      (slug) => (cartsByTenant[slug]?.length ?? 0) > 0
    );
  }, [cartsByTenant]);

  const allCartSlugs = useMemo(() => {
    return Array.from(new Set([...(venue.slug ? [venue.slug] : []), ...populatedSlugs]));
  }, [venue.slug, populatedSlugs]);

  const activeVenue = getRegistryVenueBySlug(selectedCartSlug) || venue;

  const items = cartsByTenant[selectedCartSlug] || EMPTY_CART;
  const cartItemCount = useMemo(() => {
    return items.reduce((sum, it) => sum + it.quantity, 0);
  }, [items]);
  const cartSubtotal = useMemo(() => {
    return items.reduce((sum, line) => {
      const modTotal = line.selectedModifiers.reduce((mSum, m) => mSum + m.priceDelta, 0);
      return sum + (line.item.price + modTotal) * line.quantity;
    }, 0);
  }, [items]);
  const currentPromo = promosByTenant[selectedCartSlug] || null;
  const promoCode = currentPromo?.code || "";
  const promoApplied = Boolean(currentPromo);
  const voucherDiscount = currentPromo ? currentPromo.discountPkr : 0;
  const cartFinalTotal = Math.max(0, cartSubtotal - voucherDiscount);

  const updateQuantity = (index: number, delta: number) => {
    useCartStore.getState().updateQuantity(index, delta, selectedCartSlug);
  };
  const clearCart = () => {
    useCartStore.getState().clearCart(selectedCartSlug);
  };
  const applyPromo = (code: string) => {
    return useCartStore.getState().applyPromo(code, selectedCartSlug);
  };
  const removePromo = () => {
    useCartStore.getState().removePromo(selectedCartSlug);
  };

  const { currentUser, setAuthModal, setPendingPostAuthAction } = useAuthStore();
  const { slots: availableSlots, selectedSlot, setSelectedSlot } = useSlots();
  const { isSubmitting, error: checkoutError, submitOrder } = useCheckout();
  const { capabilities } = useOrderingMode();

  const [selectedMethod, setSelectedMethod] = useState<"EASYPAISA" | "SADAPAY" | "BANK">("EASYPAISA");
  const [showPaymentPicker, setShowPaymentPicker] = useState(false);
  const [claimedTxnId, setClaimedTxnId] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [copiedText, setCopiedText] = useState("");
  const [localPromoInput, setLocalPromoInput] = useState(promoCode);
  const [errorMessage, setErrorMessage] = useState("");
  const [proofScreenshotName, setProofScreenshotName] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const termsRef = useRef<HTMLDivElement>(null);
  const proofFileInputRef = useRef<HTMLInputElement>(null);

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


  const handleCopy = (text: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedText(text);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const handlePlaceOrder = async () => {
    setErrorMessage("");

    if (!termsAccepted) {
      setErrorMessage("Please agree to the counter pickup terms.");
      return;
    }

    if (capabilities.requiresAuthentication && !currentUser) {
      onClose();
      setAuthModal("WELCOME");
      setPendingPostAuthAction("CHECKOUT");
      return;
    }

    if (
      capabilities.requiresAuthentication &&
      (!currentUser?.name || currentUser.name.trim() === "" || currentUser.name === "Guest Diner")
    ) {
      onClose();
      setAuthModal("ONBOARDING");
      setPendingPostAuthAction("CHECKOUT");
      return;
    }

    if (capabilities.requiresPickupSlot && !selectedSlot) {
      setErrorMessage("Please select a pickup time slot.");
      return;
    }

    if (capabilities.requiresPaymentClaim && !claimedTxnId.trim()) {
      setErrorMessage("Please enter the transaction reference ID.");
      return;
    }

    let placedOrderData: OrderData | null = null;
    if (selectedCartSlug === venue.slug) {
      const order = await submitOrder({
        pickupSlot: selectedSlot?.time,
        paymentMethod: selectedMethod as any,
        claimedTxnId: claimedTxnId.trim(),
      });
      if (order) {
        placedOrderData = toOrderData(order, currentUser?.email);
      } else if (checkoutError) {
        setErrorMessage(checkoutError);
        return;
      }
    } else {
      placedOrderData = {
        id: `ord-${Date.now().toString(36)}`,
        code: `QL-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: currentUser?.name || "Guest Diner",
        customerEmail: currentUser?.email || "guest@queueless.pk",
        items: items.map((line) => ({
          name: line.item.nameEn,
          qty: line.quantity,
          price: line.item.price,
          mods: line.selectedModifiers.map((m) => m.nameEn),
          note: line.note,
        })),
        total: cartFinalTotal,
        slot: selectedSlot?.time || "Express Counter",
        breakSlot: selectedSlot?.time || "Express Counter",
        state: "PREPARING",
        paymentMethod: selectedMethod,
        txnId: claimedTxnId.trim() || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        hasScreenshot: Boolean(proofScreenshotName),
        createdAt: new Date().toISOString(),
        kitchenStartAt: new Date().toISOString(),
        undoUntil: Date.now() + 60000,
        rejectionReason: null,
        refundOwed: false,
        mode: mode,
      };
      useOrderStore.getState().placeOrder(placedOrderData, selectedCartSlug);
      clearCart();
    }

    if (placedOrderData) {
      playChime();
      if (onOrderPlaced) {
        onOrderPlaced(placedOrderData);
      }
      onClose();
      onSelectTab("status");
    }
  };

  const defaultPaymentMethod = {
    id: "pm-ep",
    kind: "EASYPAISA" as const,
    label: "Easypaisa Counter",
    accountTitle: "Brewery Cafe Gulberg",
    accountNumber: "0300-1234567",
    instructions: "Transfer exact amount & enter the 11-digit Txn ID.",
  };

  const activePaymentMethods =
    ("paymentMethods" in activeVenue && Array.isArray(activeVenue.paymentMethods))
      ? activeVenue.paymentMethods
      : venue.paymentMethods;

  const activePaymentMethod =
    activePaymentMethods.find((m) => m.kind === selectedMethod) ||
    activePaymentMethods[0] ||
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

          {/* Multi-Venue Cart Switcher Tabs */}
          {allCartSlugs.length > 1 && (
            <div className="px-4 py-2 bg-neutral-50/90 border-b border-neutral-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 shrink-0 mr-1">
                Active Carts:
              </span>
              {allCartSlugs.map((slug) => {
                const regVenue = getRegistryVenueBySlug(slug);
                const name = regVenue?.name || slug;
                const count = (cartsByTenant[slug] || EMPTY_CART).reduce((sum, it) => sum + it.quantity, 0);
                const isActive = slug === selectedCartSlug;
                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => {
                      setSelectedCartSlug(slug);
                      setLocalPromoInput("");
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? "bg-[#fd8535] text-white shadow-xs"
                        : "bg-white text-neutral-700 border border-neutral-200/80 hover:bg-neutral-100"
                    }`}
                  >
                    <span>{name}</span>
                    {count > 0 && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                          isActive ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-800"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Scrollable Cart Content Area */}
          <div ref={scrollContainerRef} className="p-4 overflow-y-auto no-scrollbar space-y-4 flex-1">
            {/* Header: Your Order */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-neutral-900 tracking-tight">
                  Your Order
                </h2>
                <span className="text-xs font-bold text-[#fd8535]">
                  {activeVenue.name}
                </span>
              </div>
              {selectedCartSlug !== venue.slug && (
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-neutral-500 font-medium">Ordering from {activeVenue.name}</span>
                  <Link
                    href={`/${selectedCartSlug}`}
                    className="text-[#1546d9] font-bold hover:underline"
                  >
                    View Menu →
                  </Link>
                </div>
              )}
            </div>

            {/* Error Message if any */}
            {(errorMessage || checkoutError) && !(errorMessage || checkoutError)!.includes("terms") && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
                <span>{errorMessage || checkoutError}</span>
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
                <p className="text-xs font-bold text-neutral-600">Your cart is empty for this venue</p>
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
                  </div>

                  {/* Account Number below Account Title */}
                  {activePaymentMethod.accountNumber && (
                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      <span className="text-neutral-500">Account Number:</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(activePaymentMethod.accountNumber)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-100 hover:bg-neutral-200/70 text-neutral-900 font-mono font-bold text-xs transition-all active:scale-95 cursor-pointer border border-neutral-200/60"
                        title="Tap to copy account number"
                      >
                        <span>{activePaymentMethod.accountNumber}</span>
                        {copiedText === activePaymentMethod.accountNumber ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-sans font-bold">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Copied
                          </span>
                        ) : (
                          <Copy className="w-3 h-3 text-neutral-400 hover:text-neutral-600" />
                        )}
                      </button>
                    </div>
                  )}

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
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g. EP-9823411 or Bank Txn ID"
                        value={claimedTxnId}
                        onChange={(e) => {
                          setClaimedTxnId(e.target.value);
                          if (errorMessage) setErrorMessage("");
                        }}
                        className="flex-1 px-3 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-mono font-bold focus:ring-1 focus:ring-[#fd8535] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => proofFileInputRef.current?.click()}
                        className="p-2 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-colors shrink-0 flex items-center justify-center shadow-2xs active:scale-95"
                        title="Upload payment proof screenshot"
                        aria-label="Upload payment proof screenshot"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                      <input
                        ref={proofFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setProofScreenshotName(file.name);
                            if (errorMessage) setErrorMessage("");
                          }
                        }}
                        className="hidden"
                      />
                    </div>
                    {proofScreenshotName && (
                      <p className="text-[10px] text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Screenshot attached ({proofScreenshotName})</span>
                      </p>
                    )}
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
                      const isFull = s.status === "FULL" || (s as any).status === "full";
                      const isAvailable = s.status === "AVAILABLE" || (s as any).status === "available";
                      const isFilling = s.status === "FILLING_FAST" || (s as any).status === "filling";
                      const breakLabel = s.breakSlotName || (s as any).breakSlot || `Slot #${idx + 1}`;

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isFull}
                          onClick={() => setSelectedSlot(s)}
                          className={`p-2.5 rounded-2xl border text-center shrink-0 min-w-[78px] transition-all ${
                            isSel
                              ? "bg-neutral-950 text-white border-neutral-950 shadow-md scale-102"
                              : isFull
                              ? "bg-neutral-100 border-neutral-200 cursor-not-allowed"
                              : "bg-white border-neutral-200/90 hover:border-neutral-400 shadow-xs"
                          }`}
                        >
                          <p
                            className={`font-black text-xs ${
                              isSel
                                ? "text-white"
                                : isAvailable
                                ? "text-emerald-600"
                                : isFilling
                                ? "text-amber-600"
                                : "text-neutral-400"
                            }`}
                          >
                            {s.time}
                          </p>
                          <p
                            className={`text-[9px] mt-0.5 ${
                              isSel
                                ? "text-neutral-300 font-medium"
                                : isAvailable
                                ? "text-emerald-700/80 font-medium"
                                : isFilling
                                ? "text-amber-700/80 font-medium"
                                : "text-neutral-400"
                            }`}
                          >
                            {breakLabel}
                          </p>
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
                  className={`text-[10px] leading-relaxed cursor-pointer select-none ${
                    errorMessage && errorMessage.includes("terms")
                      ? "text-red-600 font-semibold"
                      : "text-neutral-500"
                  }`}
                >
                  {mode === "IN_VENUE" ? (
                    <>
                      I confirm this order is for Table {tableContext?.tableNumber || "01"}. Physical settlement at counter under our{" "}
                      <Link
                        href="/terms"
                        target="_blank"
                        className="underline font-bold text-neutral-700 hover:text-neutral-950"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        target="_blank"
                        className="underline font-bold text-neutral-700 hover:text-neutral-950"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Privacy Policy
                      </Link>.
                    </>
                  ) : (
                    <>
                      I understand orders are prepared for same-day counter pickup (held 30m past slot before no-show). I agree to the{" "}
                      <Link
                        href="/terms"
                        target="_blank"
                        className="underline font-bold text-neutral-700 hover:text-neutral-950"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        target="_blank"
                        className="underline font-bold text-neutral-700 hover:text-neutral-950"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Privacy Policy
                      </Link>.
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Bottom Sticky Action CTA */}
          <div className="p-4 bg-white/95 backdrop-blur-md border-t border-neutral-100 shrink-0 space-y-2.5">
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
                <span>{errorMessage}</span>
              </div>
            )}
            <button
              type="button"
              disabled={items.length === 0 || isSubmitting}
              onClick={handlePlaceOrder}
              className={`w-full py-4 px-6 rounded-full font-extrabold text-sm flex items-center justify-between transition-all active:scale-[0.99] ${
                items.length > 0 && !isSubmitting
                  ? "bg-[#fd8535] hover:bg-[#e0681c] text-white shadow-[0_8px_24px_rgba(253,133,53,0.35)] cursor-pointer"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              <span className="flex items-center gap-2">
                {isSubmitting
                  ? "Placing Order..."
                  : mode === "IN_VENUE"
                  ? "Send Order to Kitchen"
                  : "Place Order"}{" "}
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </span>
              <span className="text-base font-black">Rs. {cartFinalTotal}</span>
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
