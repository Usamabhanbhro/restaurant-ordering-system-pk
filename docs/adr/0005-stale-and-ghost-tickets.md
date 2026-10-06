# Unverified and undelivered tickets escalate, then expire

> **Changelog (2026-10-06):** applied owner brief v6 — `EXPIRED_UNPAID` superseded by `EXPIRED_NO_CLAIM` and `EXPIRED_UNREVIEWED`; unreviewed claims expire at `pickup_at`, not `kitchen_start_at`; late confirmation starts order immediately; cancel before `kitchen_start_at` flags `refund_owed`.

Two clocks, because a ticket waiting to be *verified* is not the same problem as a ticket that is *cooking*:

- **HOLD timer** runs from submission. For remote orders it runs from when the customer submits payment details.
- **Cooking timer** starts at verification: `orders.verified_at` (table service) or `kitchen_start_at` (remote pre-orders), and the 10/20-minute color scale measures cooking time, not waiting time (green 0–10 min, amber 10–20, red 20+).

**HOLD escalation (KDS / Staff Dashboard):**
| Time in HOLD | KDS / Dashboard | Other |
|---|---|---|
| 3 min | Card pulses red (from amber) with one chime; an "N unverified" / "payments to confirm" counter at top; dashboard changes page title and plays sound | Customer sees "Still checking your order" |
| 6 min | Same | Broadcast `ORDER_STALE` to admin (and expo tablet in post-v1 TABLE_SERVICE) |

**Auto-expire (uses `VOIDED` + a reason code in event metadata; no new status):**
- **TABLE_SERVICE (Post-v1):** an order unverified for **15 minutes** is voided with reason `EXPIRED_UNVERIFIED`. The customer is notified; the device is *not* flagged.
- **Remote Pre-Orders (v1):** *(Superseded: `EXPIRED_UNPAID` at kitchen start is replaced per owner brief v6 §2.2/§8)*:
  1. **No claim by deadline:** If a customer submits no payment claim by `claim_deadline_at = min(created_at + claim_deadline_minutes, kitchen_start_at)`, the order is voided with reason `EXPIRED_NO_CLAIM`. Slot capacity is released; no strike is recorded.
  2. **Unreviewed claim at pickup:** If a claim was submitted but remains unreviewed when `pickup_at` arrives, the order is voided with reason `EXPIRED_UNREVIEWED`. Slot is released; **no strike is recorded** (students are never penalized for slow staff); customer is instructed to contact the cafe if they transferred funds.
  3. **Late confirmation:** If an operator confirms a claim **after** `kitchen_start_at`, the order bypasses `SCHEDULED` and transitions to `PREPARING` immediately, marked late (`ORDER_LATE_CONFIRMED`), notifying the customer of the delay.
  4. **No-show hold:** A ready order uncollected after `pickup_at + noshow_hold_minutes` (default 30 min) is voided with reason `NO_SHOW` with no refund.

**Customer cancel:** the customer can cancel while the order is still in HOLD before `kitchen_start_at`. If payment was already confirmed, `refund_owed = true` appears in the cashier's `refunds_owed` lane until manually refunded. Neutral status wording (*"Order cancelled"*) is displayed to the customer without internal reason codes.

**Who checked (TABLE_SERVICE, Post-v1):** when the cook taps VERIFY & COOK, the KDS asks "who checked?" — a one-tap pick from the venue's runner list (staff role `floor_staff`) — and writes a `TABLE_CHECKED` audit event with the runner's `staff_id` as actor, alongside the cook's verify event. Not required for remote orders; their HOLD is payment claim verification, recorded as the operator's confirm action.

**Verified but unserved (TABLE_SERVICE, Post-v1):** a ticket in PLATED / AWAITING DELIVERY for more than **5 minutes** triggers `ORDER_DELIVERY_OVERDUE` on the expo tablet.

All timings are delegated defaults, per-venue configurable, `owner may override`.
