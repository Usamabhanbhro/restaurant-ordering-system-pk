# Profiles are perks wallets, not ordering identities (F3)

> **Changelog (2026-10-06):** applied owner brief v6 — cross-venue identity layer tables locked (`customers`, `email_login_codes`) behind `app_identity_user` role; random browser device ID replaces fingerprinting; customer email never copied into venue tables.

A profile unlocks perks and discounts; it is **not** an ordering identity. In-venue ordering stays anonymous — a customer never needs to log in to order at a table, and the first in-venue order remains anonymous.

A profile is required only for remote orders (pre-orders, ADR-0007), where the customer is not physically present. Restricted venues do not require a profile — their access is enforced physically by the guard, not by the app (ADR-0008).

### Cross-Venue Architecture & Tenancy Isolation

Under Brief v6 §1.1, the data model for profiles is locked:
- **Dedicated Tables:** Stored in `customers` and `email_login_codes` without a `tenant_id`.
- **Database Role Isolation:** Accessible **only** via the `app_identity_user` database role. The tenant runtime role (`app_runtime_user`) has no access to identity tables.
- **Opaque Venue Reference:** Venue tables store only an opaque `customer_ref` UUID and `customer_name_snapshotted`. The customer's email address is **never copied** into venue tables.

### Resolved Operational Decisions (Delegated, `owner may override`):
- **Fields:** `display_name`, verified `email` (CITEXT, from any provider; institution email needed only for future F2 affiliations), optional `phone`, and `token_version`.
- **Login and Verification:** Passwordless email one-time code (6 digits, valid for 10 minutes, max 5 failed attempts). No passwords. WhatsApp is not used.
- **Device Identification:** Random browser-stored UUID (`device_id VARCHAR(64)`), passed in the `X-Device-Id` header on customer requests. *(Supersedes: browser fingerprinting — no fingerprinting in v1 per brief v5 §3 / v6 §1.3).*
- **Data Protection:** Minimal fields, no card data stored, payment screenshots deleted after 30 days (`screenshot_delete_after`), soft deletion via `deleted_at`, and purge per retention schedule.
