# Public URLs are tenant-prefixed

> **Changelog (2026-10-06):** applied owner brief v4 — counter QR entry URL is `order.cafe.pk/{tenant_slug}` for v1; table-specific tags are post-v1.

`zones.slug` and `tables.table_number` are only unique *within* a tenant, so two venues can both have a `rooftop/04`.

In v1 (COUNTER_PICKUP), the customer entry URL is a venue-level counter QR:
```
order.cafe.pk/{tenant_slug}
```
This link works from anywhere and does not prove physical presence.

For post-v1 (TABLE_SERVICE), table tags use the zone-qualified format:
```
order.cafe.pk/{tenant_slug}/t/{zone_slug}/{table_number}
```

The tenant slug resolves the tenant; zone and table resolve within it. Menu reads are public and deliberately skip RLS (see SCHEMA.md), so browsing another venue's menu is accepted risk, not a leak concern — mitigated by rate limiting on the public menu and order endpoints, since a QR URL is trivially shareable.