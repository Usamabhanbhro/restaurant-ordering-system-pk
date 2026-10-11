import type { OrderingMode, OrderStatus } from "@queueless/types";

export type SettlementType = "COUNTER_PHYSICAL" | "DIGITAL_VERIFICATION";

export interface OrderingCapabilities {
  mode: OrderingMode;
  requiresAuthentication: boolean;
  requiresPickupSlot: boolean;
  requiresPaymentClaim: boolean;
  settlementType: SettlementType;
  canCancelBeforeKitchenStart: boolean;
  timelineStages: readonly OrderStatus[];
}
