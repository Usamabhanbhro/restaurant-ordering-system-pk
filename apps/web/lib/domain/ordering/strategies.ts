import { ORDER_STATUS, ORDERING_MODE, type OrderingMode } from "@queueless/types";
import type { OrderingCapabilities } from "./types";

export const REMOTE_ORDERING_CAPABILITIES: OrderingCapabilities = {
  mode: ORDERING_MODE.REMOTE,
  requiresAuthentication: true,
  requiresPickupSlot: true,
  requiresPaymentClaim: true,
  settlementType: "DIGITAL_VERIFICATION",
  canCancelBeforeKitchenStart: true,
  timelineStages: [
    ORDER_STATUS.PENDING_PAYMENT,
    ORDER_STATUS.SCHEDULED,
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.READY,
    ORDER_STATUS.SERVED,
  ],
};

export const IN_VENUE_ORDERING_CAPABILITIES: OrderingCapabilities = {
  mode: ORDERING_MODE.IN_VENUE,
  requiresAuthentication: false,
  requiresPickupSlot: false,
  requiresPaymentClaim: false,
  settlementType: "COUNTER_PHYSICAL",
  canCancelBeforeKitchenStart: false,
  timelineStages: [
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.SERVED,
  ],
};

export function getOrderingCapabilities(mode: OrderingMode): OrderingCapabilities {
  return mode === ORDERING_MODE.IN_VENUE
    ? IN_VENUE_ORDERING_CAPABILITIES
    : REMOTE_ORDERING_CAPABILITIES;
}
