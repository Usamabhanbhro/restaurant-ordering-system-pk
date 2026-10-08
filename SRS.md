# SRS.md — Software Requirements Specification

> **Changelog (2026-10-06):** applied owner brief v6 (v1 remote ordering functional requirements, order lifecycle & lanes, acceptance criteria §4, supersessions §8).

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for QueueLess, an in-venue restaurant digital ordering and kitchen management platform for the Pakistani market, focused in v1 on remote pre-ordering and counter pickup.

### 1.2 Scope
QueueLess enables customers to browse menus, select pickup slots, and order via a zero-install Progressive Web App (PWA). It provides a unified staff web dashboard (desktop/smartphone) featuring Orders, Payments, and Admin capabilities to manage payment claim verification, kitchen staging, pickup notifications, and manual refund tracking without altering the venue's legacy Point of Sale (POS) infrastructure.

---

## 2. Functional Requirements (FR)

### 2.1 Customer PWA (Customer Interface)
- **FR-1.1:** System shall load the venue menu when a customer scans a venue counter QR (`order.cafe.pk/{tenant_slug}`) or accesses it remotely.
- **FR-1.2:** System shall allow customers to customize items using defined modifiers and a single free-text note (maximum 40 characters, apostrophes allowed: `^[a-zA-Z0-9\s.,!?'-]{0,40}$`).
- **FR-1.3 (Customer-Facing States):** System shall present real-time order status across five customer-facing stages:
  1. `Awaiting payment confirmation`: Order placed in `PENDING_PAYMENT`, awaiting claim review.
  2. `Confirmed, scheduled for HH:MM`: Payment confirmed, order in `SCHEDULED`.
  3. `Being prepared`: Cooking active in `PREPARING` (starts at `kitchen_start_at`).
  4. `Ready for pickup`: Bumped to `READY` at the counter.
  5. `Collected`: Handed over to customer (`SERVED`).
  Plus `Cancelled / expired`: Neutral status message displayed without internal reason codes (covers customer cancel, claim rejection, or expiry; brief v3 §2.4).
- **FR-1.3a (Cancellation):** System shall allow a customer to cancel an order up until `kitchen_start_at`. Once cancelled, slot capacity is released. If payment was already confirmed, `refund_owed` is flagged `true` for manual cashier reimbursement. App-based cancellation is prohibited after `kitchen_start_at` (`409 CANCEL_WINDOW_CLOSED`).
- **FR-1.4 (Post-v1 Table Service):** System shall support in-venue table QR scanning and multi-round table sessions (TABLE_SERVICE mode only).
- **FR-1.5:** System shall cache the full menu offline using Service Workers.
- **FR-1.6 (Remote Pre-Ordering — v1 Core):** System shall allow students to place orders for a chosen same-day pickup slot at a COUNTER_PICKUP venue.
  - Operating hours are defined by `remote_open_time` and `remote_close_time`.
  - Operator can toggle a "pause remote orders" switch.
  - Selectable pickup slots require `slot_start >= NOW() + prep_lead_minutes + 10 minutes` (dynamic cutoff window) and `slot_start < remote_close_time`.
  - Slot capacity is atomically incremented on creation and decremented on cancellation/expiry.
  - Fulfilment is counter pickup only (never delivery).
  - Ready orders are held for `noshow_hold_minutes` (default 30 min) past `pickup_at`; if uncollected, order is marked `NO_SHOW` with no refund (terms displayed before payment).
  - Unreviewed payment claims expire at `pickup_at` (`EXPIRED_UNREVIEWED`), not `kitchen_start_at`. Unclaimed orders expire at `claim_deadline_at` (`EXPIRED_NO_CLAIM`). Neither expiry triggers a strike.
- **FR-1.6a (Notifications):** Primary order updates occur live in the PWA. System shall send transactional emails upon payment confirmation, rejection, order ready for pickup, or order expiration.
- **FR-1.7 (User Profiles — F3):** Customers create an account using email, Pakistani mobile phone number, and password (hashed with Argon2id). Display name and institutional affiliation are collected afterwards (during onboarding or prior to first pre-order for counter ticket callout). Profiles are stored in the cross-venue identity layer with `app_identity_user` role isolation. Venue tables store only `customer_ref` and `customer_name_snapshotted`.
- **FR-1.8 (Price Integrity):** The client sends `menu_version` with each order. If menu prices changed, order rejects with `409 PRICE_CHANGED` and returns current prices.
- **FR-1.9 (Tax and Prices):** Prices are set by the venue without app-level tax computation. Cart and payment views display the venue-configurable note: default *"Prices are set by the venue."*

### 2.2 Unified Staff Dashboard (v1)

Staff access is delivered via a single responsive web application (desktop and phone browsers) operating with a single live WebSocket connection per screen.

**Staff Roles Matrix (v1):**
| Capability | Operator | Admin |
|---|:---:|:---:|
| View active lanes (`payments_to_confirm`, `scheduled`, `preparing`, `ready`, `refunds_owed`) | ✅ | ✅ |
| Confirm payment claim (`PENDING_PAYMENT → SCHEDULED`) | ✅ | ✅ |
| Reject payment claim (`WRONG_AMOUNT` or `NOT_FOUND`) | ✅ | ✅ |
| Undo last confirm or reject within 5-min undo window | ✅ | ✅ |
| Bump order (`PREPARING → READY`) | ✅ | ✅ |
| Hand over order (`READY → SERVED`) | ✅ | ✅ |
| Mark manual refund completed (`REFUND_MARKED_DONE`) | ✅ | ✅ |
| Pause / unpause remote orders | ✅ | ✅ |
| Manage Menu (categories, items, modifiers, 86 toggle) | ❌ | ✅ |
| Configure Venue Settings, hours, slot capacity, lead times | ❌ | ✅ |
| Manage Payment Methods & Staff PIN accounts | ❌ | ✅ |
| View blocked customers & manual Block / Unblock | ❌ | ✅ |
| Void order post-verification (`ADMIN_VOID`) | ❌ | ✅ |

- **FR-2.1 (Dashboard UI & Audio):** Unified dashboard with five lanes: `payments_to_confirm`, `scheduled`, `preparing`, `ready`, and `refunds_owed`. Staff tap **Start shift** once to enable web audio alerts and page title notifications for incoming claims.
- **FR-2.2 (Ticket Card Hierarchy):** Cards display slot time, elapsed cooking timer, item names, and modifier pills (Red: Exclusions, Green: Add-ons, Amber: Preferences, Slate: Free-text note; English and Roman Urdu).
- **FR-2.3 (Ticket Actions & Undo):**
  - `CONFIRM PAYMENT`: Transitions order to `SCHEDULED` (or `PREPARING` immediately if past `kitchen_start_at`, logged as `ORDER_LATE_CONFIRMED`).
  - `REJECT PAYMENT`: Requires reason (`WRONG_AMOUNT` or `NOT_FOUND`).
  - `UNDO`: Available for 5 minutes (default, venue-configurable 5–10 min); reverts confirm (back to `PENDING_PAYMENT`) or reject (back to `SUBMITTED`). Strikes from `NOT_FOUND` apply only after the undo window closes.
  - *(Superseded: No kitchen TRASH in v1 — rejecting a claim is the v1 equivalent of discarding an unpaid order; TRASH is post-v1 table-service; brief v6 §2.2/§8).*
- **FR-2.4 (Timers):** Color-coded cooking timers (Green <=10 min, Amber 10-20 min, Red >20 min) measured from `kitchen_start_at`.
- **FR-2.5 (Automated Kitchen Staging):** Scheduled tickets move to `PREPARING` automatically at `kitchen_start_at` via the background scheduler.

### 2.3 Payments & Cashier Refund Management
- **FR-3.1:** Display submitted payment claims with payment method, transaction ID, claimed amount, and optional screenshot.
- **FR-3.2:** Unique transaction constraint: one transaction ID cannot back two live claims (`payment_claims_txn_uq`).
- **FR-3.3 (Refunds Owed Lane):** Orders with `refund_owed = true` display in the `refunds_owed` lane until the cashier executes manual bank/wallet transfer and taps "refund done", firing `REFUND_MARKED_DONE`.

### 2.4 Admin Management (Day-2 Operations)
- **FR-4.1:** Real-time 86 out-of-stock toggle immediately hiding items from customer menu.
- **FR-4.2:** Batch QR code PDF generation for counter acrylic stands.
- **FR-4.3:** Immutable audit dispute log displaying chronological event stream for every order.
- **FR-4.4:** Configure operating hours, lead times, slot length, slot capacity, payment methods, staff PINs, and customer standing.

### 2.5 Security, Abuse & Rate Limiting (v1 Defaults — Delegated: Owner May Override)
- **FR-5.1:** Max 5 failed password attempts per 15 minutes before temporary lockout; email verification codes capped at max 3 requests per 15 minutes and max 10 per IP per hour.
- **FR-5.2:** Cloudflare Turnstile bot challenge on sign-in and order creation.
- **FR-5.3:** Max 5 order submissions per customer per 10 minutes.
- **FR-5.4:** Max 2 open orders in `PENDING_PAYMENT` per customer.
- **FR-5.5:** Idempotency key enforced on order placement (`orders_idem_uq`).
- **FR-5.6:** Random browser-stored device ID sent on all customer requests (`X-Device-Id`).
- **FR-5.7:** Strikes apply ONLY on `NOT_FOUND` rejection surviving the undo window. 3 strikes in 30 days automatically blocks customer from remote ordering at that venue.

---

## 3. Acceptance Criteria (v1 Remote Ordering — Brief v6 §4)

v1 is done when every acceptance criterion below passes and the engineer has completed one rehearsal day (per `FDE_RUNBOOK.md`).

### 3.1 Ordering
1. **Given** an open venue, **when** a signed-in customer picks items and a valid slot, **then** an order is created in `PENDING_PAYMENT` with the expected amount and the venue's active payment methods.
2. **Given** a venue that is closed or paused, **then** order creation fails with `VENUE_CLOSED` or `VENUE_PAUSED` and the customer sees the venue message.
3. **Given** a slot earlier than `now + lead time + 10 minutes`, **then** the slot is not offered and a direct request fails with `PAST_CUTOFF`.
4. **Given** one remaining place in a slot and two customers submitting at once, **then** exactly one order is created and the other gets `SLOT_FULL`.
5. **Given** a double tap or retry with the same `idempotency_key`, **then** only one order exists.
6. **Given** prices changed since the menu loaded, **then** the order fails with `PRICE_CHANGED` and returns the new prices.
7. **Given** an item marked 86, **then** the order fails with `ITEM_UNAVAILABLE` listing it.
8. **Given** a customer with 2 open unpaid orders, **then** a third fails with `TOO_MANY_OPEN_ORDERS`.

### 3.2 Payment
9. **Given** an order in `PENDING_PAYMENT`, **when** the customer submits a claim, **then** the payments lane shows it within 2 seconds and the operator's screen plays a sound.
10. **Given** a claim, **when** the operator confirms it, **then** the order becomes `SCHEDULED` and the customer receives an email and a live status update.
11. **Given** a transaction ID already used on another live claim, **then** the second claim fails with `DUPLICATE_TRANSACTION`.
12. **Given** `WRONG_AMOUNT`, **then** no strike is created and the customer can submit a new claim.
13. **Given** `NOT_FOUND` and no undo within the window, **then** a strike is recorded. **Given** an undo within the window, **then** no strike is recorded.
14. **Given** 3 strikes in 30 days, **then** the customer is blocked at that venue until an admin unblocks.
15. **Given** two staff members confirming and rejecting the same claim at once, **then** one succeeds and the other gets `CONCURRENT_MODIFICATION`.

### 3.3 Kitchen
16. **Given** a `SCHEDULED` order, **then** it appears in the Orders lane at `kitchen_start_at` without any staff action.
17. **Given** a claim confirmed after `kitchen_start_at`, **then** the order goes to `PREPARING` immediately, marked late (`ORDER_LATE_CONFIRMED`).
18. **Given** a `READY` order uncollected at `pickup_at + 30 minutes`, **then** it becomes `VOIDED` (`NO_SHOW`) with no refund flag.

### 3.4 Cancellation and Expiry
19. **Given** a confirmed order cancelled before `kitchen_start_at`, **then** the slot is released and `refund_owed` shows in the cashier lane until marked done.
20. **Given** no claim by the deadline, **then** the order voids as `EXPIRED_NO_CLAIM`. **Given** an unreviewed claim at `pickup_at`, **then** it voids as `EXPIRED_UNREVIEWED`. Neither creates a strike.

### 3.5 Security and Data
21. **Given** a customer token, **then** the customer cannot read another customer's order. **Given** staff of venue A, **then** they cannot read venue B's orders (an automated RLS test runs on every change).
22. **Given** any order, **then** the audit log shows every transition with actor and time, and no runtime role can update or delete audit rows.
23. **Given** authentication abuse (more than 5 failed password attempts, wrong verification codes, or requests above the rate limit), **then** further attempts are rejected and temporary lockout applies.
24. **Given** payment screenshots past `screenshot_delete_after`, **then** they are deleted by the scheduler.

### 3.6 Operations
25. **Given** the application restarts mid-service, **then** the scheduler catches up and no order is left stuck.
26. **Given** the dashboard open for a full service, **then** new claims and stale tickets still alert.

---

## 4. Supersessions & Conflict Resolutions (Brief v6 §8)

| Earlier Text | Brief v6 Specification |
|---|---|
| v3 §2.3 & v4 §5.2: `EXPIRED_UNPAID` voids at kitchen start; strike on expiry | Replaced by `EXPIRED_NO_CLAIM` and `EXPIRED_UNREVIEWED`. Unreviewed claims expire at `pickup_at`, NOT `kitchen_start_at`; late confirmation starts order immediately. Students are never struck due to slow staff. |
| v4 §5.2 strike triggers | Strikes originate ONLY from a `NOT_FOUND` rejection that survives the undo window. |
| v5 §2.1 "last-order time" | `remote_open_time` and `remote_close_time`. Last order time follows dynamically from `slot_start >= now + prep_lead_minutes + 10 min`. |
| v3/v5 undo for "trashed ticket" | In v1 undo covers confirm and reject; there is no kitchen TRASH. TRASH is a post-v1 table-service action. |
| `SCHEMA.md` `orders.table_id NOT NULL`, `session_id NOT NULL` | Nullable for remote orders (`channel = 'REMOTE'`). Check constraints enforce `channel = 'REMOTE' OR table_id IS NOT NULL`. |
| v3 §3.3 refund note ("cashier sees a refund owed flag") | Specified in FR-2.1/FR-3.3 (`refunds_owed` lane, `orders.refund_owed`, `orders.refund_done_at`). |
