# Orders freeze prices and detect menu drift

> **Changelog (2026-10-05):** applied owner brief v2 — payment screen shows the final price.

At submission, the server computes and stores every price component in `order_items`:

- `unit_price_snapshotted` = the item's base price
- `modifiers_snapshotted` = JSONB array including each modifier's `price_delta`
- `line_total` = `(base_price + Σ price_delta) × quantity`

The client sends only item and modifier IDs; the server builds the snapshot inside the order transaction. An order is `INSERT`-only — a manager editing a price mid-`PREPARING` cannot alter an existing order's stored total.

Each order also carries the `menu_version` the customer loaded. If prices changed since that version, the server returns `409 PRICE_CHANGED` with the fresh prices instead of silently charging more than the customer saw on their screen. The payment screen shows the final price.