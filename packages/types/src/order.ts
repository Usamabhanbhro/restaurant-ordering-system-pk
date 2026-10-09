import { z } from "zod";
import {
  ORDER_STATUS,
  PAYMENT_CLAIM_STATUS,
  PAYMENT_METHOD,
  REJECTION_REASON,
} from "./enums.js";

/**
 * Kitchen Note Regex: Max 40 characters, alphanumeric with safe punctuation only
 */
export const KITCHEN_NOTE_REGEX = /^[a-zA-Z0-9\s.,!?'-]{0,40}$/;

export const SelectedModifierSchema = z.object({
  groupId: z.string(),
  optionId: z.string(),
  nameEn: z.string(),
  pricePkr: z.number().int().nonnegative(),
});
export type SelectedModifier = z.infer<typeof SelectedModifierSchema>;

export const OrderItemInputSchema = z.object({
  menuItemId: z.string(),
  quantity: z.number().int().positive(),
  selectedModifiers: z.array(SelectedModifierSchema).default([]),
  itemNotes: z
    .string()
    .regex(
      KITCHEN_NOTE_REGEX,
      "Notes must be 40 characters or fewer and contain only safe alphanumeric characters."
    )
    .optional(),
});
export type OrderItemInput = z.infer<typeof OrderItemInputSchema>;

export const OrderCreateInputSchema = z.object({
  tenantId: z.string().uuid(),
  pickupSlot: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid slot format (HH:mm)"),
  items: z.array(OrderItemInputSchema).min(1, "Order must contain at least one item."),
  orderNotes: z
    .string()
    .regex(
      KITCHEN_NOTE_REGEX,
      "Notes must be 40 characters or fewer and contain only safe alphanumeric characters."
    )
    .optional(),
});
export type OrderCreateInput = z.infer<typeof OrderCreateInputSchema>;

export const PaymentClaimSubmitSchema = z.object({
  orderId: z.string().uuid(),
  paymentMethod: z.enum([
    PAYMENT_METHOD.EASYPAISA,
    PAYMENT_METHOD.JAZZ_CASH,
    PAYMENT_METHOD.SADAPAY,
    PAYMENT_METHOD.NAYAPAY,
    PAYMENT_METHOD.RAAST_QR,
    PAYMENT_METHOD.MEEZAN_BANK,
  ]),
  claimedTxnId: z.string().trim().min(3).max(64),
  proofImageUrl: z.string().url().optional(),
});
export type PaymentClaimSubmitInput = z.infer<typeof PaymentClaimSubmitSchema>;

export const CashierConfirmInputSchema = z.object({
  orderId: z.string().uuid(),
  claimId: z.string().uuid(),
});
export type CashierConfirmInput = z.infer<typeof CashierConfirmInputSchema>;

export const CashierRejectInputSchema = z.object({
  orderId: z.string().uuid(),
  claimId: z.string().uuid(),
  reason: z.enum([
    REJECTION_REASON.NOT_FOUND,
    REJECTION_REASON.AMOUNT_MISMATCH,
    REJECTION_REASON.ILLEGIBLE,
    REJECTION_REASON.OTHER,
  ]),
  notes: z.string().max(200).optional(),
});
export type CashierRejectInput = z.infer<typeof CashierRejectInputSchema>;

export const CashierUndoInputSchema = z.object({
  orderId: z.string().uuid(),
  actionId: z.string().uuid(),
});
export type CashierUndoInput = z.infer<typeof CashierUndoInputSchema>;

export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  menuItemId: z.string(),
  nameSnapshot: z.string(),
  pricePkrSnapshot: z.number().int().positive(),
  quantity: z.number().int().positive(),
  selectedModifiers: z.array(SelectedModifierSchema),
  itemNotes: z.string().nullable(),
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const PaymentClaimSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  tenantId: z.string().uuid(),
  paymentMethod: z.string(),
  claimedTxnId: z.string(),
  proofImageUrl: z.string().nullable(),
  status: z.enum([
    PAYMENT_CLAIM_STATUS.UNVERIFIED,
    PAYMENT_CLAIM_STATUS.CONFIRMED,
    PAYMENT_CLAIM_STATUS.REJECTED_STRIKE,
    PAYMENT_CLAIM_STATUS.REJECTED_MISTAKE,
  ]),
  reviewedAt: z.string().nullable(),
  reviewedByStaffId: z.string().uuid().nullable(),
  undoExpiresAt: z.string().nullable(),
  createdAt: z.string(),
});
export type PaymentClaim = z.infer<typeof PaymentClaimSchema>;

export const OrderSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.number().int().positive(),
  tenantId: z.string().uuid(),
  customerRef: z.string().uuid(),
  customerDisplayName: z.string(),
  pickupSlot: z.string(),
  state: z.enum([
    ORDER_STATUS.PENDING_PAYMENT,
    ORDER_STATUS.SCHEDULED,
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.READY,
    ORDER_STATUS.SERVED,
    ORDER_STATUS.VOIDED,
  ]),
  subtotalPkr: z.number().int().positive(),
  discountPkr: z.number().int().nonnegative().default(0),
  totalPkr: z.number().int().positive(),
  kitchenStartAt: z.string().nullable(),
  readyAt: z.string().nullable(),
  servedAt: z.string().nullable(),
  voidedAt: z.string().nullable(),
  items: z.array(OrderItemSchema),
  claim: PaymentClaimSchema.nullable(),
  createdAt: z.string(),
});
export type Order = z.infer<typeof OrderSchema>;
