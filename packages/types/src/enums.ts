/**
 * Canonical Domain Enums for QueueLess
 * Enforces strict 'as const' literal definitions and Zero-Emoji Policy.
 */

export const ORDER_STATUS = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  SCHEDULED: "SCHEDULED",
  PREPARING: "PREPARING",
  READY: "READY",
  SERVED: "SERVED",
  VOIDED: "VOIDED",
} as const;
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const PAYMENT_METHOD = {
  EASYPAISA: "EASYPAISA",
  JAZZ_CASH: "JAZZ_CASH",
  SADAPAY: "SADAPAY",
  NAYAPAY: "NAYAPAY",
  RAAST_QR: "RAAST_QR",
  MEEZAN_BANK: "MEEZAN_BANK",
} as const;
export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const PAYMENT_CLAIM_STATUS = {
  UNVERIFIED: "UNVERIFIED",
  CONFIRMED: "CONFIRMED",
  REJECTED_STRIKE: "REJECTED_STRIKE",
  REJECTED_MISTAKE: "REJECTED_MISTAKE",
} as const;
export type PaymentClaimStatus = (typeof PAYMENT_CLAIM_STATUS)[keyof typeof PAYMENT_CLAIM_STATUS];

export const REJECTION_REASON = {
  NOT_FOUND: "NOT_FOUND",
  AMOUNT_MISMATCH: "AMOUNT_MISMATCH",
  ILLEGIBLE: "ILLEGIBLE",
  OTHER: "OTHER",
} as const;
export type RejectionReason = (typeof REJECTION_REASON)[keyof typeof REJECTION_REASON];

export const SLOT_STATUS = {
  AVAILABLE: "AVAILABLE",
  FILLING_FAST: "FILLING_FAST",
  FULL: "FULL",
} as const;
export type SlotStatus = (typeof SLOT_STATUS)[keyof typeof SLOT_STATUS];

export const STAFF_ROLE = {
  CASHIER: "CASHIER",
  KITCHEN: "KITCHEN",
  MANAGER: "MANAGER",
  ADMIN: "ADMIN",
} as const;
export type StaffRole = (typeof STAFF_ROLE)[keyof typeof STAFF_ROLE];

export const VENUE_MODE = {
  COUNTER_PICKUP: "COUNTER_PICKUP",
  TABLE_SERVICE: "TABLE_SERVICE",
} as const;
export type VenueMode = (typeof VENUE_MODE)[keyof typeof VENUE_MODE];
