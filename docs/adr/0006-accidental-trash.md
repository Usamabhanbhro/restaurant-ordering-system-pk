# Accidental confirmation and payment rejection are recoverable (Undo window)

> **Changelog (2026-10-06):** applied owner brief v6 — in v1 undo covers confirm and reject; there is no kitchen TRASH in v1 (TRASH is post-v1 table-service); undo reverts last confirm or reject within 5-min window.

In v1 remote ordering, **there is no kitchen TRASH**. Rejecting a payment claim is the v1 equivalent of discarding an unpaid order; TRASH is deferred to post-v1 table service.

To protect against accidental taps during peak counter rushes, both `operator` and `admin` staff roles have access to an **Undo window** (default **5 minutes**, configurable per venue within 5–10 minutes, `owner may override`):

1. **Undoing a Confirmation:** Reverts an order from `SCHEDULED` back to `PENDING_PAYMENT` (valid while still before `kitchen_start_at`).
2. **Undoing a Rejection:** Reverts a rejected payment claim from `REJECTED` back to `SUBMITTED`.

### Operational Rules

- **Strike Delay Safety:** A strike from a `NOT_FOUND` rejection applies **only after the undo window elapses**. Undoing the rejection before the window closes cancels the strike. An accidental tap never penalizes a customer.
- **After the Window:** Calls to `/api/v1/staff/orders/:order_id/undo` after the window elapses return `409 UNDO_WINDOW_CLOSED`.
- **Append-Only Audit:** Undoing an action appends a new `PAYMENT_ACTION_UNDONE` event to `order_lifecycle_events`, preserving audit integrity.
- **Post-v1 Table Service TRASH:** In post-v1 `TABLE_SERVICE`, TRASH applies to unverified table tickets in HOLD, with a 5-minute undo window restoring the ticket (`VOIDED → PENDING_VERIFICATION`) with a fresh HOLD timer and `ORDER_RESTORED` event.
- **Exclusions:** Expiry (`EXPIRED_NO_CLAIM`, `EXPIRED_UNREVIEWED`), customer cancellation, no-show (`NO_SHOW`), and admin post-verification voids (`ADMIN_VOID`) are **not** undoable.