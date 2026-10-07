# DESIGN.md — Product Design Document

> **Changelog (2026-10-06):** applied owner brief v6 (payments lane, refunds lane, customer-facing timeline, offline outage behaviour, supersessions §8).

## 1. Product Vision

QueueLess is a lean, Pakistan-market-specific digital ordering and kitchen management system that eliminates long counter queues at busy university canteens and cafes by providing remote pre-ordering with scheduled counter pickup, and a unified web-based staff dashboard — without replacing the venue's existing Point of Sale (POS), payment bank/wallet accounts, or staff hierarchy.

The product deliberately stops at order dispatch, kitchen display, and payment verification. It does not process card rails directly, calculate taxes, manage reservations, or handle delivery logistics. This constraint is the product's greatest strength: it can be deployed in a cafe in one morning alongside any legacy POS.

---

## 2. Stakeholder Map & Design Principles

### 2.1 The Customer (Customer PWA)

**Context:** A university student in class or at their hostel. They access `order.cafe.pk/{tenant_slug}` from their phone, pick menu items, select a 10-minute pickup slot, pay via Easypaisa, SadaPay, or direct bank transfer, and submit their transaction ID.

**Design principles:**
- **Zero App Download:** Instant loading PWA via mobile browser.
- **Fast Menu Browsing:** Menu loads in under 2 seconds on a mid-range phone over 4G via Redis cache and Service Worker.
- **Customer Timeline (5 Sequential States + Neutral Cancellation):**
  1. **Awaiting payment confirmation:** Order queued; payment details and instructions clearly displayed.
  2. **Confirmed, scheduled for HH:MM:** Operator verified payment; shows pickup slot time and expected kitchen start time.
  3. **Being prepared:** Ticket active in kitchen; preparation timer running.
  4. **Ready for pickup:** Audio/vibration alert and visual banner to collect order at counter.
  5. **Collected:** Order handed over.
  - **Cancelled / expired:** Displays neutral wording (*"This order could not be completed"*) with no internal reason codes exposed. A customer cancel, claim rejection, or expiry looks identical to preserve student dignity.
- **Pre-Payment Terms Display:** Terms explicitly state before payment: orders are same-day pickup, cancelled orders before kitchen start are refunded manually by the cafe, orders uncollected 30 minutes past pickup are marked no-show **with no refund**, and repeated unconfirmed payments result in account blocking (`TERMS_DRAFT.md`).
- **Cancellation Grace Period:** Students can cancel with one tap until `kitchen_start_at`. App-cancellation is disabled once preparation is scheduled to start.

### 2.2 The Kitchen & Unified Staff Dashboard (BOH)

**Context:** Cook and counter operator managing food prep during peak class breaks. Standing in front of one responsive web application (desktop monitor or smartphone browser). Hands may be greasy. Kitchen is loud.

**Design principles:**
- **Single Dashboard Screen:** Operates across five clear operational lanes:
  1. `payments_to_confirm`: Incoming payment claims requiring cashier confirmation.
  2. `scheduled`: Paid orders waiting for their dynamic `kitchen_start_at`.
  3. `preparing`: Active cooking tickets.
  4. `ready`: Orders ready for customer counter pickup.
  5. `refunds_owed`: Cancelled or voided orders where payment was already confirmed, awaiting manual bank/wallet reimbursement.
- **Start Shift Interaction:** Operator taps **Start shift** once upon loading to enable browser audio chimes and page title updates.
- **Ticket Visual Hierarchy:** Cards display pickup slot time, elapsed cook timer, item names, and modifier pill tags (Red: Exclusions, Green: Add-ons, Amber: Preferences, Slate: Free-text note; English and Roman Urdu).
- **Cook Timers:** Color-coded (Green <=10 min, Amber 10-20 min, Red >20 min), measured from `kitchen_start_at`.
- **Single-Tap Actions & Undo:**
  - Single-tap `BUMP` moves ticket from `PREPARING` to `READY`.
  - Single-tap `SERVED` marks order handed over.
  - 5-Minute Undo Window: Any confirmation or rejection can be undone within 5 minutes.
  - *(Superseded: No kitchen TRASH in v1 — rejecting a payment claim is the v1 equivalent of discarding an unpaid ticket; TRASH is post-v1 table-service; brief v6 §2.2/§8).*

### 2.3 The Operator (Payments & Refunds Lane)

**Context:** Staff stationed at the counter with the venue's payment smartphone (Easypaisa/SadaPay/bank app) and legacy POS terminal.

**Design principles:**
- **Verification Flow:** Operator cross-references the student's claimed transaction ID and amount against the venue's bank app:
  - If verified: Tap `Confirm` (`PENDING_PAYMENT → SCHEDULED`).
  - If incorrect amount: Tap `Reject → WRONG_AMOUNT` (no strike; student notified to send remaining amount before cutoff).
  - If not found: Tap `Reject → NOT_FOUND` (admin PIN required; strike applied after 5-min undo window; 2nd consecutive rejection voids order).
- **Refunds Owed Lane:** Displays tickets where payment was received but the order was cancelled by the student before kitchen start or voided by admin. Operator manually transfers funds via bank app and taps `Refund Done` (`REFUND_MARKED_DONE`).

### 2.4 The Admin & Forward-Deployed Engineer (FDE)

**Context:** Cafe owner managing operating hours and menu stock, and the engineer onboarding the venue (`FDE_RUNBOOK.md`).

**Design principles:**
- **Day-2 Management:** Admin tab controls `remote_open_time`, `remote_close_time`, slot capacity, prep lead times, 86 out-of-stock toggles, payment methods, staff PIN accounts, and customer unblocking.
- **Dispute Inspector:** Chronological audit trail showing every event (who confirmed, who bumped, when voided).
- **Post-Verification Voids:** Only admins can void an order after it has been verified/scheduled.

---

## 3. Customer PWA Flow (Remote Pre-Ordering — v1)

```
[Open order.cafe.pk/:slug or scan Counter QR]
       │
       ▼
[Menu loads instantly from Redis / Service Worker cache]
       │
       ▼
[Select items, choose modifiers, add optional note]
       │
       ▼
[Select same-day pickup slot (cutoff: >= now + lead time + 10 min)]
       │
       ▼
[Review cart — subtotal shown with venue price note: "Prices are set by the venue."]
       │
       ▼
[Sign in with email OTP (if not already authenticated)]
       │
       ▼
[Submit Order — Slot capacity incremented atomically]
       │
       ▼
[Payment Screen: venue bank/Easypaisa/SadaPay details + Draft Terms shown]
       │
       ▼
[Customer sends payment in external banking app]
       │
       ▼
[Submit payment claim with Transaction ID & optional screenshot]
       │
       ▼
[Timeline State 1: "Awaiting payment confirmation"]
       │
       ▼ (Operator verifies txn ID & confirms)
[Timeline State 2: "Confirmed, scheduled for HH:MM"]
       │
       ▼ (Scheduler triggers at kitchen_start_at)
[Timeline State 3: "Being prepared"]
       │
       ▼ (Cook bumps ticket)
[Timeline State 4: "Ready for pickup at counter"]
       │
       ▼ (Operator marks handed over)
[Timeline State 5: "Collected"]
```

---

## 4. Staff Dashboard Lane Layout

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ QueueLess Staff Dashboard — Brewery Cafe Gulberg                         [Shift Active 🔔] [Admin]│
├────────────────────┬────────────────────┬────────────────────┬──────────────────┬────────────────┤
│ PAYMENTS TO CONFIRM│     SCHEDULED      │     PREPARING      │      READY       │  REFUNDS OWED  │
├────────────────────┼────────────────────┼────────────────────┼──────────────────┼────────────────┤
│ ORDER #108 (13:30) │ ORDER #105 (13:20) │ ORDER #102 (13:10) │ ORDER #99 (13:00)│ ORDER #97      │
│ Ahmad Ali          │ Hamza Khan         │ Bilal Tariq        │ Sara Noor        │ Usman Riaz     │
│ Rs. 750.00         │ Rs. 450.00         │ Rs. 1,200.00       │ Rs. 650.00       │ Rs. 850.00     │
│ Easypaisa: 987654  │ Starts in: 4 mins  │ Elapsed: 6 mins    │ Ready: 2 mins    │ Reason: Cancel │
│                    │                    │                    │                  │ Bank: 12345678 │
│ [CONFIRM] [REJECT] │ [UNDO CONFIRM]     │ [BUMP READY]       │ [SERVED]         │ [REFUND DONE]  │
└────────────────────┴────────────────────┴────────────────────┴──────────────────┴────────────────┘
```

---

## 5. Offline & Degraded Mode Design

| Failure Scenario | Customer Experience | Staff Action & Mitigation |
|---|---|---|
| **Backend server down** | PWA shows cached menu (read-only) with *"Ordering unavailable"* banner. If origin is unreachable, Cloudflare serves static fallback: *"Ordering unavailable, please order at the counter"*. In-flight orders are preserved in Postgres; scheduler catches up on reboot. | Staff takes verbal orders directly at counter legacy POS. |
| **Venue Internet down** | Customer remote orders still succeed in cloud; venue screen shows offline banner until connection re-establishes. | Venue's responsibility (decided). Staff hot-spots screen to smartphone or switches to counter queue. |
| **Complete power outage** | PWA shows cafe closed or customers order at counter via manual paper process. | Venue switches screen/router to 12V backup battery / UPS. |
| **Screen battery dies** | Cloud queue preserves all tickets; screen re-syncs state upon reboot via REST delta fetch. | Staff plugs in device or opens dashboard on another phone. |

---

## 6. Supersessions & Conflict Resolutions (Brief v6 §8)

| Earlier Text | Brief v6 Specification |
|---|---|
| v3 §2.3 & v4 §5.2: `EXPIRED_UNPAID` voids at kitchen start; strike on expiry | Replaced by `EXPIRED_NO_CLAIM` and `EXPIRED_UNREVIEWED`. Unreviewed claims expire at `pickup_at`, NOT `kitchen_start_at`; late confirmation starts order immediately. Students are never struck due to slow staff. |
| v4 §5.2 strike triggers | Strikes originate ONLY from a `NOT_FOUND` rejection that survives the undo window. |
| v5 §2.1 "last-order time" | `remote_open_time` and `remote_close_time`. Last order time follows dynamically from `slot_start >= now + prep_lead_minutes + 10 min`. |
| v3/v5 undo for "trashed ticket" | In v1 undo covers confirm and reject; there is no kitchen TRASH. TRASH is a post-v1 table-service action. |
| `SCHEMA.md` `orders.table_id NOT NULL`, `session_id NOT NULL` | Nullable for remote orders (`channel = 'REMOTE'`). Check constraints enforce `channel = 'REMOTE' OR table_id IS NOT NULL`. |
| v3 §3.3 refund note ("cashier sees a refund owed flag") | Specified in §2.3/§4 (`refunds_owed` lane, `orders.refund_owed`, `POST /staff/orders/:order_id/refund-done`). |
