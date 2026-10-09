import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  numeric,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// =========================================================================
// 1. TENANTS & VENUE SETTINGS
// =========================================================================

export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 50 }).unique().notNull(),
  venueMode: varchar("venue_mode", { length: 20 }).default("COUNTER_PICKUP").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const venueSettings = pgTable("venue_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .references(() => tenants.id, { onDelete: "cascade" })
    .notNull(),
  operatingHours: varchar("operating_hours", { length: 100 }).default("08:00 - 22:00").notNull(),
  isOrderingPaused: boolean("is_ordering_paused").default(false).notNull(),
  slotDurationMinutes: integer("slot_duration_minutes").default(10).notNull(),
  prepLeadTimeMinutes: integer("prep_lead_minutes").default(10).notNull(),
  claimDeadlineMinutes: integer("claim_deadline_minutes").default(15).notNull(),
  paymentAccounts: jsonb("payment_accounts").default([]).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// =========================================================================
// 2. CATEGORIES & MENU ITEMS
// =========================================================================

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    nameEn: varchar("name_en", { length: 50 }).notNull(),
    nameUrdu: varchar("name_urdu", { length: 50 }),
    iconName: varchar("icon_name", { length: 50 }).default("Utensils").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [index("categories_tenant_idx").on(table.tenantId)]
);

export const menuItems = pgTable(
  "menu_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    nameEn: varchar("name_en", { length: 150 }).notNull(),
    nameUrdu: varchar("name_urdu", { length: 150 }), // Roman Urdu only
    descriptionEn: text("description_en"),
    portionWeightGrams: integer("portion_weight_grams"),
    pricePkr: integer("price_pkr").notNull(),
    imageUrl: varchar("image_url", { length: 500 }),
    blurHash: varchar("blur_hash", { length: 100 }),
    prepTimeMinutes: integer("prep_time_minutes").default(6).notNull(),
    isAvailable: boolean("is_available").default(true).notNull(),
    modifierGroups: jsonb("modifier_groups").default([]).notNull(),
  },
  (table) => [index("menu_items_tenant_idx").on(table.tenantId, table.categoryId)]
);

// =========================================================================
// 3. ORDERS & ORDER ITEMS
// =========================================================================

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    orderNumber: integer("order_number").notNull(),
    channel: varchar("channel", { length: 20 }).default("REMOTE").notNull(),
    customerRef: uuid("customer_ref").notNull(), // Opaque UUID reference to customer
    customerNameSnapshotted: varchar("customer_name_snapshotted", { length: 50 }).notNull(),
    deviceId: varchar("device_id", { length: 64 }),
    idempotencyKey: varchar("idempotency_key", { length: 64 }),
    status: varchar("status", { length: 30 }).default("PENDING_PAYMENT").notNull(),
    pickupSlot: varchar("pickup_slot", { length: 10 }).notNull(),
    kitchenStartAt: timestamp("kitchen_start_at", { withTimezone: true }),
    claimDeadlineAt: timestamp("claim_deadline_at", { withTimezone: true }),
    readyAt: timestamp("ready_at", { withTimezone: true }),
    servedAt: timestamp("served_at", { withTimezone: true }),
    voidReason: varchar("void_reason", { length: 50 }),
    refundOwed: boolean("refund_owed").default(false).notNull(),
    refundDoneAt: timestamp("refund_done_at", { withTimezone: true }),
    subtotalPkr: integer("subtotal_pkr").notNull(),
    discountPkr: integer("discount_pkr").default(0).notNull(),
    totalPkr: integer("total_pkr").notNull(),
    version: integer("version").default(1).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("orders_idem_idx").on(table.tenantId, table.idempotencyKey),
    index("orders_tenant_status_idx").on(table.tenantId, table.status),
    index("orders_customer_ref_idx").on(table.tenantId, table.customerRef),
  ]
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(), // Denormalized for RLS
    orderId: uuid("order_id")
      .references(() => orders.id, { onDelete: "cascade" })
      .notNull(),
    menuItemId: uuid("menu_item_id").references(() => menuItems.id, { onDelete: "set null" }),
    nameSnapshotted: varchar("name_snapshotted", { length: 150 }).notNull(),
    unitPriceSnapshotted: integer("unit_price_snapshotted").notNull(),
    quantity: integer("quantity").notNull(),
    modifiersSnapshotted: jsonb("modifiers_snapshotted").default([]).notNull(),
    freeTextNote: varchar("free_text_note", { length: 40 }),
    lineTotalPkr: integer("line_total_pkr").notNull(),
  },
  (table) => [index("order_items_order_idx").on(table.orderId)]
);

// =========================================================================
// 4. PAYMENT CLAIMS (Pakistani Manual Direct-to-Venue Transfers)
// =========================================================================

export const paymentClaims = pgTable(
  "payment_claims",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    orderId: uuid("order_id")
      .references(() => orders.id, { onDelete: "cascade" })
      .notNull(),
    paymentMethod: varchar("payment_method", { length: 30 }).notNull(),
    claimedTxnId: varchar("claimed_txn_id", { length: 64 }).notNull(),
    proofImageUrl: varchar("proof_image_url", { length: 500 }),
    status: varchar("status", { length: 30 }).default("UNVERIFIED").notNull(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewedByStaffId: uuid("reviewed_by_staff_id"),
    undoExpiresAt: timestamp("undo_expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("payment_claims_order_idx").on(table.orderId)]
);

// =========================================================================
// 5. APPEND-ONLY AUDIT & LIFECYCLE TABLES (REVOKE UPDATE, DELETE)
// =========================================================================

export const orderLifecycleEvents = pgTable(
  "order_lifecycle_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    orderId: uuid("order_id")
      .references(() => orders.id, { onDelete: "cascade" })
      .notNull(),
    fromState: varchar("from_state", { length: 30 }).notNull(),
    toState: varchar("to_state", { length: 30 }).notNull(),
    trigger: varchar("trigger", { length: 50 }).notNull(),
    actorType: varchar("actor_type", { length: 20 }).notNull(), // 'CUSTOMER' | 'STAFF' | 'SYSTEM'
    actorId: varchar("actor_id", { length: 64 }),
    idempotencyKey: varchar("idempotency_key", { length: 64 }),
    payload: jsonb("payload").default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("lifecycle_order_idx").on(table.orderId)]
);

export const customerStandingEvents = pgTable(
  "customer_standing_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    customerRef: uuid("customer_ref").notNull(),
    eventType: varchar("event_type", { length: 30 }).notNull(), // 'STRIKE_RECORDED' | 'STRIKE_UNDONE' | 'BLOCKED'
    deltaStrikes: integer("delta_strikes").notNull(),
    activeStrikesSnapshot: integer("active_strikes_snapshot").notNull(),
    isBlockedSnapshot: boolean("is_blocked_snapshot").notNull(),
    triggerReason: varchar("trigger_reason", { length: 100 }),
    claimId: uuid("claim_id"),
    orderId: uuid("order_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("standing_customer_idx").on(table.tenantId, table.customerRef)]
);
