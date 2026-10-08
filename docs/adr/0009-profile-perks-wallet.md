# Profiles are perks wallets, not ordering identities (F3)

> **Changelog (2026-10-08):** updated account creation credentials — registration requires `email`, mandatory `phone`, and `password` (Argon2id); `display_name` and institutional affiliation deferred to onboarding / first order; cross-venue tables updated (`customers`, `email_verification_codes`, `password_reset_tokens`) behind `app_identity_user` role.

A profile unlocks perks and discounts; it is **not** an ordering identity. In-venue ordering stays anonymous — a customer never needs to log in to order at a table, and the first in-venue order remains anonymous.

A profile is required only for remote orders (pre-orders, ADR-0007), where the customer is not physically present. Restricted venues do not require a profile — their access is enforced physically by the guard, not by the app (ADR-0008).

### Cross-Venue Architecture & Tenancy Isolation

Under Brief v6 §1.1, the data model for profiles is locked:
- **Dedicated Tables:** Stored in `customers`, `email_verification_codes`, and `password_reset_tokens` without a `tenant_id`.
- **Database Role Isolation:** Accessible **only** via the `app_identity_user` database role. The tenant runtime role (`app_runtime_user`) has no access to identity tables.
- **Opaque Venue Reference:** Venue tables store only an opaque `customer_ref` UUID and `customer_name_snapshotted`. The customer's email address and password are **never copied** into venue tables.

### Resolved Operational Decisions (Delegated, `owner may override`):
- **Registration Fields:** `email` (CITEXT, from any provider), `phone` (mandatory Pakistani mobile number `^(\+92|0)?3[0-9]{9}$`), and `password` (hashed with Argon2id; min 8 characters).
- **Deferred Fields:** `display_name` is prompted during onboarding or required before submitting the first remote pre-order (for counter ticket callout). Institutional affiliation is deferred to the optional F2 perks layer.
- **Login and Recovery:** Sign-in via email/phone and password. Email address verified via 6-digit code. Password reset handled via time-limited token sent to verified email. WhatsApp is not used.
- **Device Identification:** Random browser-stored UUID (`device_id VARCHAR(64)`), passed in the `X-Device-Id` header on customer requests. *(Supersedes: browser fingerprinting — no fingerprinting in v1 per brief v5 §3 / v6 §1.3).*
- **Data Protection:** Minimal fields, passwords hashed with Argon2id, no card data stored, payment screenshots deleted after 30 days (`screenshot_delete_after`), soft deletion via `deleted_at`, and purge per retention schedule.
