import { z } from "zod";
import { OrderSchema, PaymentClaimSchema } from "./order.js";

export const WS_EVENT_TYPE = {
  // Staff / Kitchen Channel Events
  CLAIM_SUBMITTED: "CLAIM_SUBMITTED",
  PAYMENT_CONFIRMED: "PAYMENT_CONFIRMED",
  PAYMENT_REJECTED: "PAYMENT_REJECTED",
  ORDER_SCHEDULED: "ORDER_SCHEDULED",
  KITCHEN_START: "KITCHEN_START",
  ORDER_READY: "ORDER_READY",
  ORDER_SERVED: "ORDER_SERVED",
  ORDER_VOIDED: "ORDER_VOIDED",
  UNDO_WINDOW_OPENED: "UNDO_WINDOW_OPENED",
  UNDO_WINDOW_CLOSED: "UNDO_WINDOW_CLOSED",
  ACTION_UNDONE: "ACTION_UNDONE",
  
  // Venue Controls Events
  ITEM_86_TOGGLED: "ITEM_86_TOGGLED",
  VENUE_STATE_TOGGLED: "VENUE_STATE_TOGGLED",

  // Diner Timeline Events
  ORDER_STATUS_UPDATED: "ORDER_STATUS_UPDATED",
} as const;
export type WsEventType = (typeof WS_EVENT_TYPE)[keyof typeof WS_EVENT_TYPE];

export const BaseWsMessageSchema = z.object({
  type: z.string(),
  tenantId: z.string().uuid(),
  timestamp: z.string(),
});

export const ClaimSubmittedMessageSchema = BaseWsMessageSchema.extend({
  type: z.literal(WS_EVENT_TYPE.CLAIM_SUBMITTED),
  order: OrderSchema,
  claim: PaymentClaimSchema,
});
export type ClaimSubmittedMessage = z.infer<typeof ClaimSubmittedMessageSchema>;

export const OrderStatusUpdatedMessageSchema = BaseWsMessageSchema.extend({
  type: z.literal(WS_EVENT_TYPE.ORDER_STATUS_UPDATED),
  orderId: z.string().uuid(),
  orderNumber: z.number().int(),
  previousState: z.string(),
  currentState: z.string(),
  timelineNotes: z.string().optional(),
});
export type OrderStatusUpdatedMessage = z.infer<typeof OrderStatusUpdatedMessageSchema>;

export const Item86ToggledMessageSchema = BaseWsMessageSchema.extend({
  type: z.literal(WS_EVENT_TYPE.ITEM_86_TOGGLED),
  itemId: z.string(),
  isAvailable: z.boolean(),
});
export type Item86ToggledMessage = z.infer<typeof Item86ToggledMessageSchema>;

export const VenueStateToggledMessageSchema = BaseWsMessageSchema.extend({
  type: z.literal(WS_EVENT_TYPE.VENUE_STATE_TOGGLED),
  isOrderingPaused: z.boolean(),
});
export type VenueStateToggledMessage = z.infer<typeof VenueStateToggledMessageSchema>;
