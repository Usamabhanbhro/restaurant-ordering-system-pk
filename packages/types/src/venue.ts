import { z } from "zod";
import { PAYMENT_METHOD, SLOT_STATUS, VENUE_MODE } from "./enums.js";

export const ModifierOptionSchema = z.object({
  id: z.string(),
  nameEn: z.string().min(1),
  nameUrdu: z.string().optional(),
  pricePkr: z.number().int().nonnegative(),
});
export type ModifierOption = z.infer<typeof ModifierOptionSchema>;

export const ModifierGroupSchema = z.object({
  id: z.string(),
  nameEn: z.string().min(1),
  required: z.boolean(),
  minSelections: z.number().int().nonnegative().default(0),
  maxSelections: z.number().int().positive().default(1),
  options: z.array(ModifierOptionSchema),
});
export type ModifierGroup = z.infer<typeof ModifierGroupSchema>;

export const MenuItemSchema = z.object({
  id: z.string(),
  tenantId: z.string().uuid(),
  categoryId: z.string(),
  nameEn: z.string().min(1),
  nameUrdu: z.string().optional(),
  descriptionEn: z.string().optional(),
  portionWeightGrams: z.number().int().positive().optional(),
  pricePkr: z.number().int().positive(),
  imageUrl: z.string().url().optional(),
  blurHash: z.string().optional(),
  prepTimeMinutes: z.number().int().positive().default(6),
  isAvailable: z.boolean().default(true),
  modifierGroups: z.array(ModifierGroupSchema).default([]),
});
export type MenuItem = z.infer<typeof MenuItemSchema>;

export const MenuCategorySchema = z.object({
  id: z.string(),
  tenantId: z.string().uuid(),
  nameEn: z.string().min(1),
  nameUrdu: z.string().optional(),
  iconName: z.string(),
  sortOrder: z.number().int().default(0),
});
export type MenuCategory = z.infer<typeof MenuCategorySchema>;

export const PickupSlotSchema = z.object({
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be HH:mm"),
  status: z.enum([
    SLOT_STATUS.AVAILABLE,
    SLOT_STATUS.FILLING_FAST,
    SLOT_STATUS.FULL,
  ]),
  capacity: z.number().int().positive(),
  reservedCount: z.number().int().nonnegative(),
});
export type PickupSlot = z.infer<typeof PickupSlotSchema>;

export const VenuePaymentAccountSchema = z.object({
  method: z.enum([
    PAYMENT_METHOD.EASYPAISA,
    PAYMENT_METHOD.JAZZ_CASH,
    PAYMENT_METHOD.SADAPAY,
    PAYMENT_METHOD.NAYAPAY,
    PAYMENT_METHOD.RAAST_QR,
    PAYMENT_METHOD.MEEZAN_BANK,
  ]),
  accountTitle: z.string().min(1),
  accountNumber: z.string().min(1),
  qrImageUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
});
export type VenuePaymentAccount = z.infer<typeof VenuePaymentAccountSchema>;

export const VenueSettingsSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  operatingHours: z.string(),
  mode: z.enum([VENUE_MODE.COUNTER_PICKUP, VENUE_MODE.TABLE_SERVICE]).default(VENUE_MODE.COUNTER_PICKUP),
  isOrderingPaused: z.boolean().default(false),
  slotDurationMinutes: z.number().int().positive().default(10),
  prepLeadTimeMinutes: z.number().int().positive().default(10),
  claimDeadlineMinutes: z.number().int().positive().default(15),
  paymentAccounts: z.array(VenuePaymentAccountSchema).default([]),
});
export type VenueSettings = z.infer<typeof VenueSettingsSchema>;
