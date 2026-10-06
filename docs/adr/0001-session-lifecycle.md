# Table sessions are explicit records, not a column

> **Changelog (2026-10-06):** applied owner brief v6 — confirmed idle timeout (default 30 min, TABLE_SERVICE only); in v1 remote ordering (`channel = 'REMOTE'`), `orders.table_id` and `orders.session_id` are nullable per brief v6 §1.3.

The nullable `tables.session_id` column is replaced by a `table_sessions` table (`id`, `table_id`, `opened_at`, `last_order_at`, `closed_at`, `closed_reason`). A session ties multi-round ordering to a table's occupied state: it is opened on first menu load and closed by the cashier's settle action **or after an idle timeout** — default 30 minutes, configurable per venue, where "idle" means no new order has been submitted. This applies to TABLE_SERVICE mode only (remote pre-orders have no table or table session, so `table_id` and `session_id` are nullable on `orders`). Because session state is now queryable history rather than a mutable column, the audit trail can answer "when was this table open, and why did it close?"

Creation is atomic so two phones scanning the tag simultaneously get the same session:

```sql
UPDATE tables SET session_id = gen_random_uuid()
WHERE id = $1 AND session_id IS NULL
RETURNING session_id;
```

A customer who scans after the previous party left but before the cashier settled joins the *existing* session — the session belongs to the table's occupied state, not to a person.

**Considered:** keeping the nullable column. Rejected because closed-session history is valuable for owner reporting and dispute resolution, and a column can't hold it.