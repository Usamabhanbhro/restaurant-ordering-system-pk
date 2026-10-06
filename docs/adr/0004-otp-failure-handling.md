# OTP failure never blocks an order (Post-v1 velocity gate)

> **Changelog (2026-10-06):** applied owner brief v4 — WhatsApp OTP is completely superseded by passwordless email code sign-in (WhatsApp is not used anywhere; owner brief v4 §5.4).

In post-v1 TABLE_SERVICE, the velocity gate requests an email code sign-in on a second order from the same table session within 4 minutes. If unverified within the timeout, the order routes to HOLD flagged as unverified (never blocked, never silently bypassed).

The physical table check remains the actual fraud control in TABLE_SERVICE. The cook's `VERIFY & COOK` tap on a badged ticket is the staff override, so no separate force-order endpoint exists.

Housekeeping:
- WhatsApp is not used anywhere. All previous references to WhatsApp OTP in FR-5.1 are replaced with email code sign-in.
- The velocity gate is post-v1 (Phase 2 feature); in v1 COUNTER_PICKUP, remote orders require signed-in email profiles and payment confirmation before cooking starts.
- If a round cap is ever restored, add `POST /admin/sessions/:id/extend`, logged with the actor.