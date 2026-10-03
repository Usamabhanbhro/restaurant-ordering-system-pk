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
               SQL over Connection Pool (with RLS)
                               │
                               ▼
 ┌───────────────────────────────────────────────────────────────┐
 │                 PostgreSQL Database Instance                  │
 │  ┌─────────────────────────────────────────────────────────┐  │
 │  │ Tenants | Tables | Menu Items | Orders | Audit Logs    │  │
 │  └─────────────────────────────────────────────────────────┘  │
 └───────────────────────────────────────────────────────────────┘
                               ▲
                               │ Local Network / 4G SIM
 ┌─────────────────────────────┴─────────────────────────────────┐
 │              In-Venue Physical Hardware Layer                 │
 │   ┌───────────────────────┐       ┌───────────────────────┐   │
 │   │  Kitchen KDS Tablet   │       │ Cashier Terminal View │   │
 │   └───────────────────────┘       └───────────────────────┘   │
 └───────────────────────────────────────────────────────────────┘
```

## 2. Component Descriptions

### 2.1 Customer PWA (Client Edge)
- Built as a lightweight, bundle-optimized Progressive Web App.
- Uses Service Workers for offline fallback (caching the full menu payload and styling).
- Connects via WebSocket for real-time order state progression.

### 2.2 Application Server (Fastify)
- Single monolithic Fastify service for the MVP, structured with clean module boundaries.
- **Tenant Context Middleware:** Sets PostgreSQL transaction session variable `app.current_tenant_id` for every operation to enforce RLS.
- **WebSocket Manager:** Manages active connections across 3 distinct rooms per tenant: `kds_room`, `cashier_room`, and individual `session_room` for diners.

### 2.3 Storage Layer (PostgreSQL)
- Relational database storing all tenant, menu, order, and lifecycle logs.
- Uses strict PostgreSQL Row-Level Security (RLS) policies to prevent cross-tenant data leaks.
- Uses an append-only table `order_lifecycle_events` for audit trails with revoked destructive privileges.

## 3. Real-Time Order Flow

```
Diner Phone                Fastify Server                KDS Tablet               Cashier Web View
    │                            │                            │                          │
    │── 1. POST /orders ────────►│                            │                          │
    │                            │── 2. WS: ORDER_HOLD ──────►│                          │
    │                            │                            │                          │
    │                            │                            │ (Cook verifies table     │
    │                            │                            │  and taps VERIFY)        │
    │                            │◄── 3. POST /verify ────────│                          │
    │◄── 4. WS: STATE: PREPARING─│                            │                          │
    │                            │                            │                          │
    │                            │                            │ (Cook finishes & taps)   │
    │                            │◄── 5. POST /bump ──────────│                          │
    │◄── 6. WS: STATE: READY ────│                            │── 7. WS: TAB_UPDATED ───►│
    │                            │                            │                          │
    │                            │                            │                          │ (Customer pays at cash)
    │                            │◄── 8. POST /settle ───────────────────────────────────│
    │◄── 9. WS: SESSION_CLOSED ──│                                                       │
```

## 4. Disaster Recovery & Offline Fallback Architecture

1. **Internet / Cloud Outage:** If the Fastify backend is unreachable, the customer's PWA detects network failure and activates the cached offline menu with a banner advising them to place orders verbally with staff.
2. **Total Power Cut / Device Failure:** Diners scan the emergency QR code on the back of the acrylic block, fetching a pure static PDF menu hosted on Cloudflare Pages without touching application servers.
3. **KDS Tablet Disconnection:** Upon reconnecting, the KDS client sends a synchronization handshake to fetch the latest server-side order queue, reconciling any missed WebSocket events.
