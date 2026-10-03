# SCHEMA.md — Database Design & RLS Policies

## Design Philosophy

The database design relies heavily on PostgreSQL features to simplify application code and guarantee isolation. We use Row-Level Security (RLS) for all multi-tenancy on sensitive state paths, paired with Redis caching and direct read-replica queries for non-sensitive public menu browsing.

## Data Access Architecture

1. **Public Read Path (Menu Browsing):**
   - High-throughput endpoint: `GET /api/v1/menu/:zone_slug/:table_number`.
   - Served primarily from Redis cache (`cache:menu:{tenant_id}`).
   - On cache miss, queries database using application-level `WHERE tenant_id = ?` without initiating a PostgreSQL RLS transaction wrapper. This permits transaction-mode pooling via PgBouncer (`pool_mode = transaction`) under peak concurrency (e.g. 500+ simultaneous diners).

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
    venue_mode VARCHAR(20) NOT NULL DEFAULT 'TABLE_SERVICE', -- or 'COUNTER_PICKUP'
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
    session_id UUID NULL, -- Active session identifier
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
    name_roman_urdu VARCHAR(150),
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
    table_id UUID NOT NULL REFERENCES tables(id) ON DELETE RESTRICT,
    session_id UUID NOT NULL, -- Ties multi-round orders together
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_VERIFICATION',
    -- Status pipeline: PENDING_VERIFICATION -> PREPARING -> READY -> SERVED -> SETTLED | VOIDED
    subtotal NUMERIC(10,2) NOT NULL,
    diner_fingerprint VARCHAR(255), -- Non-PII velocity tracking
    diner_phone VARCHAR(20) NULL, -- Optional WhatsApp number for loyalty
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, -- Denormalized for RLS
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    name_snapshotted VARCHAR(150) NOT NULL,
    unit_price_snapshotted NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL,
    modifiers_snapshotted JSONB NOT NULL, -- Array of { id, name_en, name_roman_urdu, price_delta, type }
    free_text_note VARCHAR(40), -- Validated against ^[a-zA-Z0-9\s.,!?-]{0,40}$
    line_total NUMERIC(10, 2) NOT NULL
);
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

### 5. Immutable Audit Log

The core defense against dishonest staff and operations disputes.

```sql
CREATE TABLE order_lifecycle_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, 
    actor_type VARCHAR(30) NOT NULL,
    actor_id VARCHAR(100), 
    terminal_label VARCHAR(50), 
    metadata JSONB, 
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deny UPDATE and DELETE to the application runtime database user
REVOKE UPDATE, DELETE ON order_lifecycle_events FROM app_runtime_user;
```

---

## Row-Level Security (RLS) Policies

### Step 1: Enable RLS

```sql
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_lifecycle_events ENABLE ROW LEVEL SECURITY;
```

### Step 2: Define Tenant Isolation Policy

```sql
CREATE POLICY tenant_isolation_policy ON orders
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
