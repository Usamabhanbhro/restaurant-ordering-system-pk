# ARCHITECTURE.md — System Architecture & Component Interactions

> **Changelog (2026-10-06):** applied owner brief v6 (v1 remote ordering lifecycle state machine, scheduler engine, cross-venue identity boundary, minimal operations outage handling, supersessions).

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
 │  / CACHE HIT < 2ms      │   │  / RLS TRANSACTION      │
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
 │  │      In-Process Background Scheduler (30s ticker)       │  │
 │  ├─────────────────────────────────────────────────────────┤  │
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
 │  │ Tenants | Venue Settings | Orders (versioned) | Claims  │  │
 │  ├─────────────────────────────────────────────────────────┤  │
 │  │ Identity Layer (customers, login_codes) — role-isolated  │  │
 │  └─────────────────────────────────────────────────────────┘  │
 └───────────────────────────────────────────────────────────────┘
                                ▲
                                │ Local Network / 4G SIM
 ┌─────────────────────────────┴─────────────────────────────────┐
 │              In-Venue Physical Hardware Layer                 │
 │   ┌───────────────────────┐       ┌───────────────────────┐   │
 │   │ Unified Staff Screen  │       │  Email Gateway        │   │
 │   │ (Desktop/Phone Web)   │       │  (Fail-Open Fallback) │   │
 │   └───────────────────────┘       └───────────────────────┘   │
 └───────────────────────────────────────────────────────────────┘
```

---

## 2. Cross-Venue Identity Layer Boundary

To support student profiles across multiple campus venues without breaking per-tenant data isolation:
- **Separation of Concerns:** Profile tables (`customers`, `email_login_codes`) contain **no `tenant_id`** and exist outside tenant RLS.
- **Role Isolation:** Reached strictly via the dedicated `app_identity_user` database role. The tenant runtime role (`app_runtime_user`) has zero SELECT, INSERT, UPDATE, or DELETE privileges on identity tables.
- **Opaque References:** Venue tables store only an opaque `customer_ref` (UUID) and `customer_name_snapshotted`. The customer's email address is **never copied** into venue tables.
- **Privacy Enforcement:** Staff and tenant reporting can never enumerate or inspect student emails from the tenant database connection.

---

## 3. Order Lifecycle (Remote Orders — v1)

### 3.1 Customer-Facing States
The customer PWA presents order progress across five sequential states, plus a neutral terminal cancellation:
1. **Awaiting payment confirmation:** Order placed in `PENDING_PAYMENT`, payment claim submitted or pending.
2. **Confirmed, scheduled for HH:MM:** Operator confirmed payment claim; ticket is `SCHEDULED`.
3. **Being prepared:** Ticket reached `kitchen_start_at` (or confirmed late); currently in `PREPARING`.
4. **Ready for pickup:** Cook bumped ticket; order is in `READY` at the counter.
5. **Collected:** Staff marked order handed over; terminal state `SERVED`.
- **Cancelled / expired:** Neutral wording, no internal reason code shown (applies to customer cancellation, expiry without claim, unreviewed expiry, or rejection; brief v3 §2.4).

### 3.2 State Transition Matrix
Every transition executes as an atomic conditional update (`WHERE id = $id AND version = $expected_version AND status = ANY($valid_statuses)`). If zero rows are affected, the server returns `409 CONCURRENT_MODIFICATION`.

| From | Trigger | To | Notes |
|---|---|---|---|
| *(none)* | Customer submits order | `PENDING_PAYMENT` | Slot reserved; `claim_deadline_at = min(created_at + claim_deadline_minutes, kitchen_start_at)` |
| `PENDING_PAYMENT` | Customer submits a claim | `PENDING_PAYMENT` | Claim `SUBMITTED`; appears in `payments_to_confirm` lane |
| `PENDING_PAYMENT` | Operator confirms claim | `SCHEDULED` | Claim `CONFIRMED`; email sent to customer |
| `PENDING_PAYMENT` | Operator rejects, `WRONG_AMOUNT` | `PENDING_PAYMENT` | No strike; customer can submit corrected claim before cutoff |
| `PENDING_PAYMENT` | Operator rejects, `NOT_FOUND` | `PENDING_PAYMENT` | Strike recorded after 5-min undo window. Second `NOT_FOUND` on same order voids it (`PAYMENT_REJECTED`) |
| `PENDING_PAYMENT` | Deadline passes with no claim | `VOIDED` (`EXPIRED_NO_CLAIM`) | Slot released; no strike; handled by scheduler |
| `PENDING_PAYMENT` | Claim submitted but unreviewed at `pickup_at` | `VOIDED` (`EXPIRED_UNREVIEWED`) | Slot released; no strike; customer instructed to contact cafe if paid; handled by scheduler |
| `PENDING_PAYMENT`, `SCHEDULED` | Customer cancels before `kitchen_start_at` | `VOIDED` (`CUSTOMER_CANCEL`) | Slot released. If claim was confirmed, `refund_owed = true` |
| `SCHEDULED` | Scheduler at `kitchen_start_at` | `PREPARING` | Appears in Orders lane (`ORDER_STARTED`); cooking timer begins |
| `PENDING_PAYMENT` | Operator confirms **after** `kitchen_start_at` | `PREPARING` immediately | Marked late (`ORDER_LATE_CONFIRMED`); customer informed of delay |
| `PREPARING` | Operator bumps | `READY` | Customer alerted for pickup |
| `READY` | Operator marks handed over | `SERVED` | Terminal state for remote orders; no `SETTLED` step in v1 |
| `READY` | `pickup_at + noshow_hold_minutes` passes | `VOIDED` (`NO_SHOW`) | Payment retained, no refund; terms displayed prior to payment |
| `SCHEDULED`, `PREPARING`, `READY` | Admin voids | `VOIDED` (`ADMIN_VOID`) | Admin only. If claim was confirmed, `refund_owed = true` |

### 3.3 Undo Mechanism
- Both `operator` and `admin` roles can undo:
  - Last **confirm**: reverts order from `SCHEDULED` back to `PENDING_PAYMENT` (while still before `kitchen_start_at`).
  - Last **reject**: reverts payment claim from `REJECTED` back to `SUBMITTED`.
- **Window:** 5 minutes default (configurable within 5–10 min per venue).
- **Strike safety:** Strikes from a `NOT_FOUND` rejection take effect only after the undo window elapses. An undo before window expiration cancels the strike.
- Post-window requests return `409 UNDO_WINDOW_CLOSED`.
- **No Kitchen TRASH in v1:** Rejecting a claim is the v1 equivalent of discarding an unpaid order. Kitchen TRASH is exclusively a post-v1 table-service feature (brief v6 §2.2/§8).

### 3.4 Refunds Owed Management
When a paid/confirmed order is cancelled by the customer or administratively voided, `orders.refund_owed` is flagged `true`. The unified dashboard displays these in the `refunds_owed` lane. Cashiers issue manual refunds via their bank or mobile wallet app (Easypaisa/SadaPay) and tap "refund done", firing `POST /staff/orders/:order_id/refund-done` which sets `refund_owed = false`, `refund_done_at = NOW()`, and logs `REFUND_MARKED_DONE`.

---

## 4. Background Scheduler Engine

In v1, a lightweight, single-instance scheduler runs directly inside the Node.js application process on a **30-second interval**:
- **Design Philosophy:** The PostgreSQL database is the single source of truth. Every scheduler task executes as an idempotent conditional SQL update. If the application restarts mid-service, the scheduler catches up immediately on its next tick with zero stuck orders.
- **Scheduled Tasks:**
  1. **Order Activation:** Moves `SCHEDULED` orders to `PREPARING` where `NOW() >= kitchen_start_at` (logs `ORDER_STARTED`).
  2. **No-Claim Expiration:** Voids `PENDING_PAYMENT` orders where `NOW() >= claim_deadline_at` and no claim exists (`void_reason = 'EXPIRED_NO_CLAIM'`, releases slot).
  3. **Unreviewed Expiration:** Voids `PENDING_PAYMENT` orders with unreviewed claims where `NOW() >= pickup_at` (`void_reason = 'EXPIRED_UNREVIEWED'`, releases slot, logs `ORDER_EXPIRED`).
  4. **No-Show Processing:** Voids `READY` orders where `NOW() >= pickup_at + noshow_hold_minutes` (`void_reason = 'NO_SHOW'`, logs `ORDER_NO_SHOW`).
  5. **Screenshot Retention Cleanup:** Identifies `payment_claims` where `NOW() >= screenshot_delete_after`, deletes the object from Cloudflare R2 / S3 storage, and clears `screenshot_key`.
  6. **Transactional Notifications:** Emits queued transactional emails for confirmed, ready, and expired orders.

---

## 5. Slots & Capacity Reservation

- **Slot Alignment:** Slots represent venue-local clock times aligned to `venue_settings.slot_minutes` (default 10 min).
- **Selectability Rule:** A slot is offered if:
  1. `venue_settings.remote_paused = FALSE` and venue is currently within `[remote_open_time, remote_close_time]`.
  2. `slot_start >= NOW() + prep_lead_minutes + 10 minutes` (dynamic cutoff window).
  3. `slot_start < remote_close_time`.
- **Atomic Reservation:**
  ```sql
  UPDATE slot_usage
  SET booked_count = booked_count + 1
  WHERE tenant_id = $tenant_id
    AND slot_start = $slot_start
    AND booked_count < $slot_capacity;
  ```
  *(If row is absent, it is created with `booked_count = 1`).* If 0 rows are updated, the request rejects with `409 SLOT_FULL`.
- **Capacity Release:** `slot_usage.booked_count` is decremented on every order cancellation, expiration, or void.

---

## 6. Minimal Operations & Disaster Recovery

### 6.1 Environments
- **Development:** Local Node.js + Postgres container.
- **Test:** Dedicated Postgres instance running real RLS policies (automated test suite runs on every PR verifying venue A cannot query venue B's data).
- **Production:** Managed Node.js instance + production Postgres cluster + Cloudflare edge.

### 6.2 Backups & Monitoring
- **Backups:** Automated daily PostgreSQL logical/physical backup; mandatory test restore before first venue launch.
- **Monitoring:** External HTTP uptime check on public venue endpoint (`/api/v1/venues/:slug`), structured JSON error logging via Pino, and automated alert if scheduler loop lags by more than 2 minutes.

### 6.3 Outage & Degraded Mode Behavior

| Failure Scenario | Mitigation & System Behavior | Staff & Venue Responsibility |
|---|---|---|
| **Cloud / Backend Down** | Customer PWA serves cached menu (read-only) with yellow "ordering unavailable" banner. If origin is unreachable, Cloudflare serves static fallback: *"Ordering unavailable, please order at the counter"*. In-flight orders are safe in Postgres; scheduler catches up on reboot. | Staff takes verbal/walk-up orders at counter legacy POS. |
| **Venue Internet Down** | Venue screens offline. Web app alerts when reconnection occurs. Customer orders still process in cloud. | Venue owner's responsibility (decided). Staff hot-spots screen to phone or checks counter queue. |
| **Power / Device Outage** | Tablet/phone re-syncs state via WebSocket and API fetch immediately upon boot. | Venue runs screen on battery / backup UPS. |

---

## 7. Supersessions & Conflict Resolutions (Brief v6 §8)

| Earlier Text | Brief v6 Specification |
|---|---|
| v3 §2.3 & v4 §5.2: `EXPIRED_UNPAID` voids at kitchen start; strike on expiry | Replaced by `EXPIRED_NO_CLAIM` and `EXPIRED_UNREVIEWED`. Unreviewed claims expire at `pickup_at`, NOT `kitchen_start_at`; late confirmation starts order immediately. Students are never struck due to slow staff. |
| v4 §5.2 strike triggers | Strikes originate ONLY from a `NOT_FOUND` rejection that survives the undo window. |
| v5 §2.1 "last-order time" | `remote_open_time` and `remote_close_time`. Last order time follows dynamically from `slot_start >= now + prep_lead_minutes + 10 min`. |
| v3/v5 undo for "trashed ticket" | In v1 undo covers confirm and reject; there is no kitchen TRASH. TRASH is a post-v1 table-service action. |
| `SCHEMA.md` `orders.table_id NOT NULL`, `session_id NOT NULL` | Nullable for remote orders (`channel = 'REMOTE'`). Check constraints enforce `channel = 'REMOTE' OR table_id IS NOT NULL`. |
| v3 §3.3 refund note ("cashier sees a refund owed flag") | Specified in §3.4 (`refunds_owed` lane, `orders.refund_owed`, `POST /staff/orders/:order_id/refund-done`). |
