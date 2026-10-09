import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// =========================================================================
// CROSS-VENUE IDENTITY LAYER (NO tenant_id)
// Accessible strictly via app_identity_user role
// =========================================================================

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    phone: varchar("phone", { length: 20 }).notNull(), // format: +923XXXXXXXXX
    passwordHash: text("password_hash").notNull(), // Argon2id
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    displayName: varchar("display_name", { length: 50 }),
    tokenVersion: integer("token_version").default(1).notNull(),
    affiliation: varchar("affiliation", { length: 100 }), // e.g. "FAST-NUCES", "LUMS"
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("customers_phone_uq").on(table.phone)]
);

export const emailVerificationCodes = pgTable(
  "email_verification_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    codeHash: text("code_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    attempts: integer("attempts").default(0).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("email_codes_email_idx").on(table.email)]
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id")
      .references(() => customers.id, { onDelete: "cascade" })
      .notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("pwd_reset_customer_idx").on(table.customerId)]
);
