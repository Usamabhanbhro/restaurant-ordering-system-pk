# ARCHITECTURE.md — System Architecture & Component Interactions

## 1. System Topology Overview

```
                        [ Customer PWA ] (Mobile Browser)
                               │
                       HTTPS / WSS
                               │
                               ▼
 ┌───────────────────────────────────────────────────────────────┐
 │               Load Balancer & Edge Proxy (Cloudflare)         │
 └──────────────────────────────┬────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
 ┌─────────────────────────┐   ┌─────────────────────────┐
 │  Public Read Path (Redis)│   │  Sensitive State Path   │
 │  / CACHE HIT < 2ms      │   │  / RL TRANSACTION        │
 │  (Bypass RLS)           │   │  (Strict Isolation)      │
 └─────────────────────────┘   └─────────────────────────┘
                                │
               SQL over Connection Pool (with RLS)
                                │
                                ▼
 ┌───────────────────────────────────────────────────────────────┐
 │                 Fastify Application Layer (Node.js)           │
 │  ┌──────────────────┬───────────────────┬──────────────────┐  │
 │  │ Customer Module  │   KDS Module      │ Cashier Module   │  │
 │  ├──────────────────┴───────────────────┴──────────────────┤  │
 │  │                WebSocket Hub / PubSub                   │  │
 │  └──────────────────────────┬──────────────────────────────┘  │
 └─────────────────────────────┼─────────────────────────────────┘
                               │
               Redis (Caching, Streams & Pub/Sub)
                               │
                               ▼
 ┌───────────────────────────────────────────────────────────────┐
 │                 PostgreSQL Database Instance                  │
 │  ┌─────────────────────────────────────────────────────────┐  │
 │  │ Tenants | Tables | Menu Items | Orders (versioned)      │  │
 │  └─────────────────────────────────────────────────────────┘  │
 └───────────────────────────────────────────────────────────────┘
                               ▲
                               │ Local Network / 4G SIM
 ┌─────────────────────────────┴─────────────────────────────────┐
 │              In-Venue Physical Hardware Layer                 │
 │   ┌───────────────────────┐       ┌───────────────────────┐   │
 │   │  Kitchen KDS Tablet   │       │  WhatsApp Gateway    │   │
 │   │  (Circuit Breaker)    │       │  (Fail-Open Fallback)│   │
 │   └───────────────────────┘       └───────────────────────┘   │
 └───────────────────────────────────────────────────────────────┘
```

## 2. Component Descriptions

### 2.1 Customer PWA (Client Edge)
- Lightweight Progressive Web App with Service Workers for offline menu caching.
- WebSocket connection with JWT-based tenant binding for real-time state updates.

### 2.2 Application Server (Fastify)
- Strict tenant-scoped middleware: `SET LOCAL app.current_tenant_id` for sensitive operations.
- **Dual Data Access Paths:**
  - **Public Path:** Non-sensitive menu reads via Redis cache to avoid RLS/Transaction overhead under high concurrency.
  - **Sensitive Path:** All mutations and state reads (Orders, KDS, Cashier, Audit) run inside strict PostgreSQL RLS transactions.

### 2.3 WebSocket Isolation Layers
- **Handshake Layer:** JWT verification binds socket connection immediately to `tenant_id`.
- **Namespace Layer:** Redis channels prefixed with `pubsub:tenant:{id}:kds:{station}`.
- **Runtime Validation:** Every broadcast validates `socket.data.tenantId === payload.tenantId`.

### 2.4 Real-Time Sync Engine (Redis Streams)
- Uses Redis Streams with monotonic sequence IDs (`seq_id`) for reliable state tracking.
- **Reconnection Handshake:** Client sends `RESYNC { last_received_seq_id }`. 
- **Delta Replay:** Server replays missed events from the Redis ring buffer (up to 2,000 events).
- **Fallback:** If client is too far behind, server triggers `FORCE_FULL_RESYNC` via full API fetch.

## 3. Optimistic Locking & State Transitions

To handle concurrent updates (e.g., KDS bumping an order while Cashier settles it), the `orders` table uses a `version` column.

```sql
ALTER TABLE orders 
ADD COLUMN version INT NOT NULL DEFAULT 1,
ADD COLUMN locked_for_settlement BOOLEAN NOT NULL DEFAULT FALSE;
```

Every transition is an atomic conditional update:
```sql
UPDATE orders 
SET status = $new_status, version = version + 1
WHERE id = $order_id 
  AND version = $expected_version 
  AND status = ANY($valid_source_statuses);
```
If `rowsAffected === 0`, the server returns `409 Conflict` with the current state.

## 4. Safety Guarantees

### 4.1 XSS & Injection Protection
- Free-text notes (`guest_notes`) are validated at the API boundary using a strict whitelist regex: `^[a-zA-Z0-9\s.,!?-]{0,40}$`. This prevents XSS, CSS injection, and CSV formula injection.

### 4.2 "86ed" Item Race Conditions
- During order submission, the system executes a `SELECT ... FOR SHARE` on `menu_items`.
- If any item has `is_86ed = TRUE` during this atomic transaction, the order is rolled back and a `422 Unprocessable Entity` is returned with the specific unavailable items.

### 4.3 WhatsApp Gateway Circuit Breaker
- The WhatsApp API integration is wrapped in a circuit breaker (3s timeout, 3-failure threshold).
- **Fail-Open Policy:** If the gateway is down, the system bypasses the OTP and routes the order to the KDS `UNVERIFIED / HOLD` queue with a `⚠️ WHATSAPP DOWN` badge for manual waiter verification.

## 5. Disaster Recovery & Offline Strategy

| Failure | Mitigation |
|---|---|
| **Cloud/Backend Down** | PWA displays cached menu (Read-only) with "Offline" banner. |
| **Internet/4G Down** | QR-on-reverse fallback: physical scan of static PDF menu on Cloudflare. |
| **Power/Device Down** | Redis Streams preserve state; KDS re-syncs all pending events on reconnect. |
