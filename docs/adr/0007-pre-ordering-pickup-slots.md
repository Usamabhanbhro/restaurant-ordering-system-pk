# Pre-ordering: scheduled pickup slots at COUNTER_PICKUP venues (F1)

> **Changelog (2026-10-06):** applied owner brief v6 — `remote_open_time` and `remote_close_time` replace static last-order time; slot capacity has no default (set per venue by engineer) and uses atomic `slot_usage` counter; `refunds_owed` lane specified; `EXPIRED_NO_CLAIM` / `EXPIRED_UNREVIEWED` lifecycles added.

F1 is **pre-ordering**, not "remote ordering": a customer places an order for a chosen pickup time slot, and the kitchen starts it when the slot begins. The owner's stated purpose — order during class so the break isn't wasted — only works if the food is ready at the slot, not "ASAP". This also removes the "not a delivery app" tension: fulfilment is pickup at the counter, never delivery.

Payment: remote orders are paid via the **venue's own accounts** (bank, Easypaisa, SadaPay, etc.), configured by the venue owner. The app only displays the venue's payment instructions and records confirmation status — it never processes or holds money. The customer pays outside the app and enters a transaction ID (primary proof) or optionally uploads a screenshot; the ticket waits in `PENDING_PAYMENT` until the operator/admin confirms payment, moving it to `SCHEDULED`. The kitchen starts at `kitchen_start_at` (`pickup_at - prep_lead_minutes`), after which the ticket transitions to `PREPARING`.

Status flow: `PENDING_PAYMENT → SCHEDULED → PREPARING → READY → SERVED`.

**Resolved operational decisions (delegated, per-venue configurable, `owner may override`):**
- **Availability:** Venue sets `remote_open_time` and `remote_close_time`. Operator has a "pause remote orders" switch. Closed/paused venues show a clear message. Orders are **same-day only** (brief v5 & v6).
- **Dynamic Cutoff:** A slot is selectable only if `slot_start >= NOW() + prep_lead_minutes + 10 minutes` and `slot_start < remote_close_time`. *(Supersedes: static "last-order time" — last order time follows dynamically from the cutoff window; brief v6 §8).*
- **Slot Capacity & Atomic Usage:** Slot length defaults to 10 minutes. Slot capacity (`slot_capacity`) has **no system default** and is explicitly configured per venue by the forward-deployed engineer based on kitchen equipment and staff capacity. Enforced atomically via the `slot_usage` table:
  ```sql
  UPDATE slot_usage SET booked_count = booked_count + 1
  WHERE tenant_id = $tenant_id AND slot_start = $slot_start AND booked_count < $slot_capacity;
  ```
  Returns `409 SLOT_FULL` if full. Capacity is decremented upon cancellation or expiration.
- **Kitchen Start Time:** Pickup time minus per-venue prep lead time (`prep_lead_minutes`, default **10 minutes**). If confirmed after `kitchen_start_at`, order starts immediately marked late (`ORDER_LATE_CONFIRMED`).
- **Cancellation & Refunds Owed:** Customers can cancel with one tap until `kitchen_start_at`. If payment was confirmed, the order moves to `VOIDED`, `refund_owed` is flagged `true`, and it enters the cashier's `refunds_owed` lane until the cashier reimburses the student via bank/wallet app and taps "refund done" (`REFUND_MARKED_DONE`). App-based cancellation is prohibited after kitchen start.
- **Auto-Expiration:** If no claim is submitted by `claim_deadline_at`, order voids with reason `EXPIRED_NO_CLAIM`. If a claim is unreviewed at `pickup_at`, order voids with reason `EXPIRED_UNREVIEWED`. Neither triggers a strike.
- **No-Show Hold:** A ready order is held for 30 minutes after pickup time, then marked `NO_SHOW` with no refund (must be displayed in customer terms before payment per `TERMS_DRAFT.md`).
- **Screenshot Retention:** The transaction ID is the primary proof; a screenshot is optional (max 5 MB). Screenshots are deleted **30 days** after the pickup date (`screenshot_delete_after`).
- **Customer Entry & Walk-up:** Accessed via the counter QR `order.cafe.pk/{tenant_slug}` from anywhere. Walk-up customers with the app use the same flow and pick the earliest available slot. (Customers who don't use the app are out of scope; the venue's existing counter process is unchanged.)
- **Profile:** A pre-order requires a profile (ADR-0009) with a verified email from any provider.

Consequences:
- The unified staff dashboard gains a `scheduled` queue that moves tickets to `PREPARING` automatically at `kitchen_start_at`.
- Pre-orders are COUNTER_PICKUP only. TABLE_SERVICE venues have no pickup counter to hand a remote order to, so the flow does not exist there.
- A pre-order has no table and no table session (`orders.table_id` and `orders.session_id` are nullable).
