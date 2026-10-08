# SCHEMA.md — Database Design & RLS Policies

> **Changelog (2026-10-06):** applied owner brief v6 (v1 remote ordering data model: cross-venue identity layer, venue tables, orders alterations, audit events, RLS policies, supersessions).

## Design Philosophy

The database design relies heavily on PostgreSQL features to simplify application code and guarantee isolation. We use Row-Level Security (RLS) for all multi-tenancy on sensitive state paths, paired with Redis caching and direct read-replica queries for non-sensitive public menu browsing.

## Data Access Architecture

1. **Public Read Path (Menu Browsing):**
   - High-throughput endpoint: `GET /api/v1/menu/:zone_slug/:table_number`.
   - Served primarily from Redis cache (`cache:menu:{tenant_id}`).
   - On cache miss, queries database using application-level `WHERE tenant_id = ?` without initiating a PostgreSQL RLS transaction wrapper. This permits transaction-mode pooling via PgBouncer (`pool_mode = transaction`) under peak concurrency (e.g. 500+ simultaneous customers).

2. **Sensitive State Path (Orders, KDS, Cashier, Audit, Tables):**
   - All mutations, active order fetches, cashier settlement views, and audit log accesses run inside PostgreSQL transactions with RLS active.
   - Enforced by application middleware running `SET LOCAL app.current_tenant_id = ?` inside every transaction block.

---

## Core Tables

### 1. Tenants

Represents a restaurant or cafe location. E.g. "Brewery Cafe Gulberg".

```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    venue_mode VARCHAR(20) NOT NULL DEFAULT 'COUNTER_PICKUP', -- v1 default is COUNTER_PICKUP; TABLE_SERVICE is post-v1
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Zones & Tables

Defines the physical layout namespace. E.g. "Rooftop" -> "Table 4".

```sql
CREATE TABLE zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(20) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
    table_number VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    session_id UUID NULL, -- Active session identifier (ADR-0001; ends on settle or idle timeout, default 30 min, TABLE_SERVICE only)
    UNIQUE(tenant_id, zone_id, table_number)
);
```

### 3. Menu System

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    sort_order INT DEFAULT 0
);

CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name_en VARCHAR(150) NOT NULL,
    name_roman_urdu VARCHAR(150), -- Roman Urdu only. Urdu script is NEVER supported (owner brief v4 §4).
    description TEXT,
    base_price NUMERIC(10,2) NOT NULL,
    is_86ed BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(255)
);

CREATE TABLE modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    name_en VARCHAR(50) NOT NULL, -- e.g. "Extra Cheese"
    name_roman_urdu VARCHAR(50),  -- e.g. "Ziada Cheese"
    price_delta NUMERIC(10,2) DEFAULT 0.00,
    type VARCHAR(20) NOT NULL -- 'EXCLUSION', 'ADD_ON', 'PREFERENCE'
);
```

### 4. Orders & Snapshotted Order Items

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    table_id UUID NULL REFERENCES tables(id) ON DELETE RESTRICT,       -- Nullable for remote orders (brief v6 §1.3/§8)
    session_id UUID NULL,                                             -- Nullable for remote orders (brief v6 §1.3/§8)
    channel VARCHAR(10) NOT NULL DEFAULT 'REMOTE',                    -- REMOTE (v1 default); TABLE_SERVICE post-v1
    customer_ref UUID NULL,                                           -- Opaque customer reference (no email in venue tables)
    customer_name_snapshotted VARCHAR(50) NULL,                       -- Display name snapshot from customer profile
    device_id VARCHAR(64) NULL,                                       -- Random browser-stored ID (brief v5 §3)
    idempotency_key VARCHAR(64) NULL,                                 -- Client idempotency key
    menu_version INT NULL,                                            -- Menu version loaded by client
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_PAYMENT',
    -- Status pipeline (v1 remote ordering):
    -- PENDING_PAYMENT -> SCHEDULED -> PREPARING -> READY -> SERVED | VOIDED
    -- Post-v1 TABLE_SERVICE adds PENDING_VERIFICATION and SETTLED
    pickup_at TIMESTAMPTZ NULL,                                       -- Target pickup time slot
    kitchen_start_at TIMESTAMPTZ NULL,                                -- pickup_at - prep_lead_minutes, snapshotted
    claim_deadline_at TIMESTAMPTZ NULL,                              -- min(created_at + claim_deadline_minutes, kitchen_start_at)
    verified_at TIMESTAMPTZ NULL,                                     -- For post-v1 table service (starts cook timer)
    ready_at TIMESTAMPTZ NULL,                                        -- When bumped to READY
    served_at TIMESTAMPTZ NULL,                                       -- When handed over (terminal state in v1)
    void_reason VARCHAR(30) NULL,
    -- void_reason values (v1): CUSTOMER_CANCEL, EXPIRED_NO_CLAIM, EXPIRED_UNREVIEWED, PAYMENT_REJECTED, ADMIN_VOID, NO_SHOW
    -- (Superseded: EXPIRED_UNPAID — replaced by EXPIRED_NO_CLAIM and EXPIRED_UNREVIEWED per owner brief v6 §2.2/§8)
    -- Post-v1 TABLE_SERVICE reasons remain: EXPIRED_UNVERIFIED, trash reasons
    refund_owed BOOLEAN NOT NULL DEFAULT FALSE,                       -- Flagged when a paid/confirmed order is cancelled/voided
    refund_done_at TIMESTAMPTZ NULL,                                  -- When cashier marks manual refund completed
    subtotal NUMERIC(10,2) NOT NULL,
    version INT NOT NULL DEFAULT 1,                                   -- Optimistic locking version
    locked_for_settlement BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT orders_table_ck CHECK (channel = 'REMOTE' OR table_id IS NOT NULL),
    CONSTRAINT orders_remote_ck CHECK (channel <> 'REMOTE' OR (customer_ref IS NOT NULL AND pickup_at IS NOT NULL))
);

CREATE UNIQUE INDEX orders_idem_uq ON orders (tenant_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX orders_tenant_status_kitchen_start_idx ON orders (tenant_id, status, kitchen_start_at);
CREATE INDEX orders_tenant_status_claim_deadline_idx ON orders (tenant_id, status, claim_deadline_at);
CREATE INDEX orders_customer_ref_idx ON orders (tenant_id, customer_ref);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, -- Denormalized for RLS
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    name_snapshotted VARCHAR(150) NOT NULL,
    unit_price_snapshotted NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL,
    modifiers_snapshotted JSONB NOT NULL, -- Array of { id, name_en, name_roman_urdu, price_delta, type }
    free_text_note VARCHAR(40), -- Validated against ^[a-zA-Z0-9\s.,!?'-]{0,40}$ (apostrophes allowed per owner brief v2)
    line_total NUMERIC(10, 2) NOT NULL
);
CREATE INDEX order_items_order_id_idx ON order_items (order_id);
```

#### Modifier JSONB Schema Constraint (Validated by Zod at Application Layer)

```typescript
// Shape enforced before insertion into order_items.modifiers_snapshotted
[
  {
    "id": "mod-uuid",
    "name_en": "Extra Cheese",
    "name_roman_urdu": "Ziada Cheese",
    "price_delta": 100.00,
    "type": "ADD_ON" // 'ADD_ON' | 'EXCLUSION' | 'PREFERENCE'
  }
]
```

---

## 5. Cross-Venue Identity Layer (No `tenant_id`)

Profiles are used across venues, so they live outside venue tables, reachable only through a dedicated database role (`app_identity_user`). The tenant runtime role (`app_runtime_user`) has NO access to them. Venue tables hold only an opaque `customer_ref` and `customer_name_snapshotted` (the customer's email is NEVER copied into venue tables).

```sql
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,                                       -- Mandatory at registration (format: ^(\+92|0)?3[0-9]{9}$)
  password_hash TEXT NOT NULL,                                      -- Hashed with Argon2id (OWASP recommended)
  email_verified_at TIMESTAMPTZ NULL,                               -- Timestamp when email verification code was confirmed
  display_name VARCHAR(50) NULL,                                    -- Asked during onboarding / first order for pickup callout
  token_version INT NOT NULL DEFAULT 1,
  deleted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX customers_phone_uq ON customers (phone) WHERE deleted_at IS NULL;

CREATE TABLE email_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  consumed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX email_verification_codes_email_idx ON email_verification_codes (email);

CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX password_reset_tokens_customer_idx ON password_reset_tokens (customer_id);
```

---

## 6. Venue Tables (Tenant-Scoped, RLS Enforced)

All tables below belong to a specific tenant, have a `tenant_id` foreign key with `ON DELETE CASCADE`, and are protected by PostgreSQL Row-Level Security.

### 6.1 Venue Settings

```sql
CREATE TABLE venue_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
  timezone VARCHAR(40) NOT NULL DEFAULT 'Asia/Karachi',
  remote_open_time TIME NOT NULL,
  remote_close_time TIME NOT NULL,
  remote_paused BOOLEAN NOT NULL DEFAULT FALSE,
  prep_lead_minutes INT NOT NULL DEFAULT 10,                       -- delegated: owner may override
  slot_minutes INT NOT NULL DEFAULT 10,                            -- delegated: owner may override
  slot_capacity INT NOT NULL,                                      -- no default: the engineer sets it per venue
  claim_deadline_minutes INT NOT NULL DEFAULT 15,                  -- delegated: owner may override
  noshow_hold_minutes INT NOT NULL DEFAULT 30,                     -- delegated: owner may override
  undo_window_minutes INT NOT NULL DEFAULT 5 CHECK (undo_window_minutes BETWEEN 5 AND 10), -- delegated: owner may override
  menu_version INT NOT NULL DEFAULT 1,
  price_note VARCHAR(100) NOT NULL DEFAULT 'Prices are set by the venue.',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.2 Payment Methods

```sql
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  kind VARCHAR(20) NOT NULL,                                       -- BANK | EASYPAISA | SADAPAY | OTHER
  label VARCHAR(50) NOT NULL,
  account_title VARCHAR(100) NOT NULL,
  account_number VARCHAR(40) NOT NULL,
  instructions VARCHAR(200) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX payment_methods_tenant_active_idx ON payment_methods (tenant_id, is_active);
```

### 6.3 Staff Accounts

```sql
CREATE TABLE staff_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  display_name VARCHAR(50) NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('operator','admin')),
  pin_hash TEXT NOT NULL,
  failed_attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, display_name)
);
CREATE INDEX staff_accounts_tenant_idx ON staff_accounts (tenant_id);
```

### 6.4 Slot Usage (Atomic Capacity Counter)

```sql
CREATE TABLE slot_usage (                                          -- atomic slot capacity counter
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  slot_start TIMESTAMPTZ NOT NULL,
  booked_count INT NOT NULL DEFAULT 0,
  UNIQUE (tenant_id, slot_start)
);
CREATE INDEX slot_usage_tenant_slot_idx ON slot_usage (tenant_id, slot_start);
```

### 6.5 Payment Claims

```sql
CREATE TABLE payment_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_method_id UUID NOT NULL REFERENCES payment_methods(id) ON DELETE RESTRICT,
  transaction_id VARCHAR(64) NOT NULL,
  amount_claimed NUMERIC(10,2) NOT NULL,
  screenshot_key VARCHAR(255) NULL,                                -- object-storage key; optional
  screenshot_delete_after TIMESTAMPTZ NULL,                        -- pickup date + 30 days
  status VARCHAR(12) NOT NULL DEFAULT 'SUBMITTED',                 -- SUBMITTED | CONFIRMED | REJECTED
  reject_reason VARCHAR(15) NULL,                                  -- NOT_FOUND | WRONG_AMOUNT
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by UUID NULL REFERENCES staff_accounts(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ NULL,
  undone_at TIMESTAMPTZ NULL,
  version INT NOT NULL DEFAULT 1
);
-- One transfer cannot back two orders:
CREATE UNIQUE INDEX payment_claims_txn_uq
  ON payment_claims (tenant_id, payment_method_id, transaction_id)
  WHERE status IN ('SUBMITTED','CONFIRMED');
CREATE INDEX payment_claims_order_idx ON payment_claims (tenant_id, order_id);
CREATE INDEX payment_claims_scr_cleanup_idx ON payment_claims (screenshot_delete_after) WHERE screenshot_key IS NOT NULL;
```

### 6.6 Customer Standing & Standing Events

```sql
CREATE TABLE customer_venue_standing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_ref UUID NOT NULL,
  blocked_at TIMESTAMPTZ NULL,
  blocked_by UUID NULL REFERENCES staff_accounts(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, customer_ref)
);
CREATE INDEX customer_venue_standing_lookup_idx ON customer_venue_standing (tenant_id, customer_ref);

CREATE TABLE customer_standing_events (                            -- append-only, like order_lifecycle_events
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_ref UUID NOT NULL,
  event_type VARCHAR(20) NOT NULL,                                 -- STRIKE | STRIKE_REVERSED | BLOCK | UNBLOCK
  order_id UUID NULL REFERENCES orders(id) ON DELETE SET NULL,
  actor_staff_id UUID NULL,
  reason VARCHAR(50) NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX customer_standing_events_lookup_idx ON customer_standing_events (tenant_id, customer_ref, created_at);
REVOKE UPDATE, DELETE ON customer_standing_events FROM app_runtime_user;
```

---

## 7. Immutable Audit Log

The core defense against dishonest staff and operations disputes.

```sql
CREATE TABLE order_lifecycle_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    -- Audit event types (owner brief v6 §1.4):
    -- ORDER_CREATED, PAYMENT_CLAIM_SUBMITTED, PAYMENT_CONFIRMED,
    -- PAYMENT_REJECTED (with reason: NOT_FOUND | WRONG_AMOUNT),
    -- PAYMENT_ACTION_UNDONE, ORDER_STARTED, ORDER_READY, ORDER_SERVED,
    -- ORDER_CANCELLED, ORDER_EXPIRED (with reason: EXPIRED_NO_CLAIM | EXPIRED_UNREVIEWED),
    -- ORDER_NO_SHOW, ORDER_VOIDED_ADMIN, ORDER_LATE_CONFIRMED,
    -- REFUND_FLAGGED, REFUND_MARKED_DONE.
    -- (Post-v1 TABLE_SERVICE adds: TABLE_CHECKED, ORDER_STALE, ORDER_DELIVERY_OVERDUE).
    actor_type VARCHAR(30) NOT NULL,                               -- 'CUSTOMER' | 'OPERATOR' | 'ADMIN' | 'SYSTEM'
    actor_id VARCHAR(100), 
    terminal_label VARCHAR(50), 
    metadata JSONB, 
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX order_lifecycle_events_order_idx ON order_lifecycle_events (tenant_id, order_id, created_at);

-- Deny UPDATE and DELETE to the application runtime database user
REVOKE UPDATE, DELETE ON order_lifecycle_events FROM app_runtime_user;
```

---

## 8. Row-Level Security (RLS) Policies

### Step 1: Enable RLS on All Tenant Tables

RLS is enabled on every table containing tenant data. The cross-venue identity tables (`customers`, `email_verification_codes`, `password_reset_tokens`) do NOT have RLS because they do not have a `tenant_id` and are partitioned strictly by database role (`app_identity_user` only; `app_runtime_user` has no SELECT/INSERT/UPDATE/DELETE grants on identity tables).

```sql
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_lifecycle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE slot_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_venue_standing ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_standing_events ENABLE ROW LEVEL SECURITY;
```

### Step 2: Define Tenant Isolation Policies

```sql
CREATE POLICY tenant_isolation_policy ON zones
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_policy ON tables
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_policy ON categories
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_policy ON menu_items
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_policy ON modifiers
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_policy ON orders
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_policy ON order_items
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_policy ON order_lifecycle_events
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_policy ON venue_settings
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_policy ON payment_methods
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_policy ON staff_accounts
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_policy ON slot_usage
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_policy ON payment_claims
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_policy ON customer_venue_standing
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_policy ON customer_standing_events
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
```

### Step 3: Application Middleware Execution

```typescript
async function withTenantContext<T>(tenantId: string, callback: (trx: any) => Promise<T>): Promise<T> {
  return db.transaction(async (trx) => {
    await trx.raw(`SET LOCAL app.current_tenant_id = ?`, [tenantId]);
    return callback(trx);
  });
}
```

---

## 9. Supersessions & Conflict Resolutions (Brief v6 §8)

| Earlier text | Brief v6 Specification |
|---|---|
| `SCHEMA.md` `orders.table_id NOT NULL`, `session_id NOT NULL` | Nullable for remote orders (`channel = 'REMOTE'`). Check constraints enforce `channel = 'REMOTE' OR table_id IS NOT NULL`. |
| v3 §2.3 & v4 §5.2: `EXPIRED_UNPAID` voids at kitchen start; strike on expiry | Replaced by `EXPIRED_NO_CLAIM` (deadline passed with no claim) and `EXPIRED_UNREVIEWED` (unreviewed claim at pickup_at). Unreviewed claims expire at `pickup_at`, NOT `kitchen_start_at`; late confirmation starts order immediately. Students are never struck due to slow staff. |
| v4 §5.2 strike triggers | Strikes originate ONLY from a `NOT_FOUND` rejection that survives the undo window. |
| v5 §2.1 "last-order time" | `venue_settings.remote_open_time` and `remote_close_time`. Last order time follows dynamically from `slot_start >= now + prep_lead_minutes + 10 min`. |
| v3/v5 undo for "trashed ticket" | In v1 undo covers confirm and reject; there is no kitchen TRASH. TRASH is a post-v1 table-service action. |
| v3 §3.3 refund note ("cashier sees a refund owed flag") | Fully specified in schema via `orders.refund_owed` (boolean) and `orders.refund_done_at` (timestamptz). |

---

## 10. Planned Features (Future Phases — Post-v1)

- **F2 — Cross-venue affiliation discounts (Phase: future, not v1).** Decided: eligibility is enrollment-based via two relations — Affiliation (person↔institution) and Partnership (institution↔venue). **Tenancy rule (ADR-0008):** venue tables stay under RLS unchanged; profiles, institutions, affiliations and partnerships live in *separate* tables with no `tenant_id`, reachable only through a separate database role (`app_identity_user`) and service — venue tables never join them. The server stores only the eligibility result on the order, linked by an opaque ID. An automated test runs on every change proving venue A cannot read venue B's orders. The discount never enters `line_total` (ADR-003) — it is a cashier-visible badge applied manually at the legacy POS.

