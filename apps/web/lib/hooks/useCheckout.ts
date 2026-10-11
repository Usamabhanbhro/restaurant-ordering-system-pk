"use client";

import { useState } from "react";
import type { Order, OrderCreateInput, PaymentMethod } from "@queueless/types";
import { useTenant } from "../tenant/TenantContext";
import { useOrderingMode } from "../domain/ordering/OrderingModeContext";
import { useTenantCart } from "../store/cartStore";
import { useTenantOrders } from "../store/orderStore";
import { useAuthStore } from "../store/authStore";
import { apiClient } from "../api";
import { toOrderData } from "../domain/order/orderViewModel";

interface SubmitOrderParams {
  pickupSlot?: string;
  paymentMethod?: PaymentMethod;
  claimedTxnId?: string;
  orderNotes?: string;
}

export function useCheckout() {
  const { tenantId, tenantSlug } = useTenant();
  const { mode, capabilities, tableContext } = useOrderingMode();
  const cart = useTenantCart();
  const orders = useTenantOrders();
  const { currentUser, setAuthModal, setPendingPostAuthAction } = useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitOrder = async ({
    pickupSlot,
    paymentMethod,
    claimedTxnId,
    orderNotes,
  }: SubmitOrderParams): Promise<Order | null> => {
    setError(null);

    // 1. Minimum items check
    if (cart.items.length === 0) {
      setError("Your cart is empty.");
      return null;
    }

    // 2. Authentication check for modes that require customer profile
    if (capabilities.requiresAuthentication && !currentUser) {
      setPendingPostAuthAction("CHECKOUT");
      setAuthModal("LOGIN");
      return null;
    }

    // 3. Pickup slot check
    if (capabilities.requiresPickupSlot && !pickupSlot) {
      setError("Please select a pickup slot.");
      return null;
    }

    // 4. Payment claim check for remote orders
    if (capabilities.requiresPaymentClaim && !claimedTxnId?.trim()) {
      setError("Please provide your payment transaction ID.");
      return null;
    }

    setIsSubmitting(true);

    try {
      // 5. Construct OrderCreateInput
      const input: OrderCreateInput = {
        tenantId,
        mode,
        pickupSlot: capabilities.requiresPickupSlot ? pickupSlot : undefined,
        tableContext: tableContext || undefined,
        customerDisplayName: currentUser?.name || (tableContext ? `Table ${tableContext.tableNumber}` : "Guest Diner"),
        items: cart.items.map((it) => ({
          menuItemId: it.item.id,
          quantity: it.quantity,
          selectedModifiers: it.selectedModifiers.map((m) => ({
            groupId: "mod-default",
            optionId: m.id,
            nameEn: m.nameEn,
            pricePkr: m.priceDelta,
          })),
          itemNotes: it.note ? it.note.slice(0, 40) : undefined,
        })),
        orderNotes,
      };

      // 6. Create order via ApiClient
      const createdOrder = await apiClient.createOrder(input);

      // 7. If remote, submit payment claim
      if (capabilities.requiresPaymentClaim && paymentMethod && claimedTxnId) {
        await apiClient.submitPaymentClaim({
          orderId: createdOrder.id,
          paymentMethod,
          claimedTxnId: claimedTxnId.trim(),
        });
      }

      // 8. Record in tenant order store
      orders.placeOrder(toOrderData(createdOrder));

      // 9. Clear tenant cart
      cart.clearCart();

      return createdOrder;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to place order";
      setError(msg);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    submitOrder,
  };
}
