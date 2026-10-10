# CLAUDE.md — Project Intelligence File

> **Changelog (2026-10-10):** implemented Two-Mode Customer Ordering Architecture (Remote Pre-Ordering `REMOTE` at `order.cafe.pk/[tenantSlug]` vs In-Venue Table QR `IN_VENUE` at `[tenantSlug]/t/[zoneSlug]/[tableNumber]`); refined in-venue UI (removed "NO ACCOUNT NEEDED" pill, removed QR icon from mode button, hid mode toggle in tracker tab, removed table badges, bypassed slot picker and payment proof fields for table orders); updated category carousel to text-only pills with Saffron Amber `#f9b318` Popular styling; streamlined cart header to "Your Order"; updated profile verified status to plain text Electric Cobalt `#1546d9`; ratified Triad Brand Color Palette (`#fd8535`, `#f9b318`, `#1546d9`) and The Velocity Platter brand mark; officially retired and archived `PROTOTYPE.html` per user directive.
> **Changelog (2026-10-09):** ratified modern frontend architecture stack: Next.js 15 (App Router / SSR) + React 19, Tailwind CSS v4, Vaul + Motion gesture physics, Radix UI + Lucide vector SVG primitives, Zustand + TanStack Query v5 caching, and Cloudflare Images CDN.
> **Changelog (2026-10-06):** applied owner brief v6 (v1 remote ordering data model, API, 5 dashboard lanes, acceptance criteria, FDE runbook, draft customer terms, role isolation).

> This file is the authoritative context document for AI-assisted development on this codebase.
> It captures architectural decisions, conventions, domain-specific knowledge, and constraints
> that an AI coding agent needs to produce correct, idiomatic contributions on the first attempt.

## Project Identity

- **Name:** QueueLess (working title)
- **One-liner:** A standalone SaaS platform for in-venue restaurant ordering via QR/NFC tags, optimized for the Pakistani F&B market.
- **What it is NOT:** Not a payment processor. Not a POS replacement. Not a delivery app. Not a reservation system.
- **Resolved (F1):** pre-ordering fulfils via counter pickup at a chosen slot — never delivery — so it does not violate "not a delivery app". See ADR-0007.
- **Core function:** Order-taking and kitchen dispatch layer that sits between the customer's phone and the Kitchen Display System (KDS), with a cashier settlement bridge to legacy POS systems.

## Target Market

- **Primary venues:** Fast-casual youth hubs — specialty third-wave coffee shops (DHA, Gulberg, F-6/F-7), burger bars, bubble tea spots, and university cafeterias (FAST, LUMS, IBA, NUST, SZABIST).
- **Explicitly excluded:** Traditional Pakistani family dining (karahi houses, BBQ restaurants, Do Darya, Burns Road). These venues are hospitality-driven and require in-person captain interaction.
- **Customer demographic:** Tech-savvy youth (18-30), comfortable with QR scanning, who hate waiting to flag down a waiter.

## Architecture Constraints

- **Backend:** Fastify (Node.js/TypeScript)
- **Database:** PostgreSQL with Row-Level Security (RLS) for multi-tenancy
- **Real-time:** WebSockets for KDS state sync and customer order status
- **Frontend (Customer):** Next.js 15 (App Router / SSR) + React 19 Progressive Web App (PWA) with streaming hydration, Workbox service worker caching, and automatic `next/image` AVIF/WebP optimization — zero native app store download
- **Frontend (Staff):** Next.js 15 / React 19 responsive web app (desktop/tablet/phone browsers) sharing design tokens with PWA, running Orders, Payments, Admin tabs on a single screen *(v1 web app; Electron deferred to v2)*
- **UI & Styling:** Tailwind CSS v4 + Liquid Glass tokens, Vaul (iOS-style bottom sheets), Motion (GPU spring physics), Radix UI primitives, Lucide SVG vector icons (strictly zero emojis)
- **State & Data Caching:** Zustand (~1KB client state) + TanStack Query v5 (stale-while-revalidate 0ms cache, optimistic updates)
- **Media Delivery:** Cloudflare Images / Imgix with dynamic resizing and BlurHash/LQIP placeholders
- **Hosting:** Cloud-hosted (AWS/equivalent), no on-premise deployments
- **Offline strategy:** PWA Service Worker caches menu for offline browsing; ordering requires connectivity

## Multi-Tenancy Model

- Shared database, shared schema with `tenant_id` on every table
- PostgreSQL Row-Level Security (RLS) policies enforce isolation at the database engine level
- Application middleware sets `SET LOCAL app.current_tenant_id = ?` inside every transaction
- Superadmin analytics uses a `BYPASSRLS` database role
- Never rely on application-level `WHERE tenant_id = ?` alone; RLS is the enforcement layer
- **Resolved (F2, future):** cross-venue eligibility is enrollment-based via two relations — Affiliation (person↔institution) and Partnership (institution↔venue). **Tenancy rule:** venue tables stay under RLS; profiles, institutions, affiliations and partnerships live in *separate* tables with no `tenant_id`, reachable only via a separate database role and service — venue tables never join them. Only the eligibility result is stored on the order, linked by an opaque ID. A test runs on every change proving venue A cannot read venue B's orders. See ADR-0008.

## Critical Domain Rules

1. **The app never processes payments or holds money.** It may display a venue's payment instructions and record that the venue confirmed a payment. Bills are settled through the restaurant's legacy POS (Candela, Micros, Tossdown, etc.); remote pre-orders are paid directly to the venue's own accounts. *(Reworded per owner brief v2 §4.2. The `operator` role confirms/rejects payment claims; the `admin` adds post-verification voids and the Admin tab.)*
2. **Price snapshotting.** When a customer submits an order, item prices are frozen into `order_items.unit_price_snapshotted`. The staff view always shows the locked-at-submission price, never the current menu price.
3. **Immutable audit log.** The `order_lifecycle_events` table is append-only. The application database role has `REVOKE UPDATE, DELETE` on this table. Every state transition is logged with actor, terminal, and timestamp.
4. **Kitchen verification flow.** In v1 COUNTER_PICKUP, remote pre-orders land in an "UNVERIFIED / HOLD" column as `PENDING_PAYMENT` awaiting the operator's "payment received". In-venue COUNTER_PICKUP walk-up orders skip HOLD. Food is never prepared on an unconfirmed order. *(Post-v1 TABLE_SERVICE: HOLD means runner physically checks the table).* `orders.verified_at` starts the cooking timer. Stale-ticket handling (HOLD escalation, `EXPIRED_UNVERIFIED`/`EXPIRED_UNPAID` auto-expire) is decided — see ADR-0005. All timings per-venue and `owner may override`.
5. **Abuse and exploit defenses (v1).** Remote orders start only after operator/admin payment confirmation and are never anonymous. Features: signed-in profile with verified email, mandatory Pakistani mobile phone, and Argon2id password (no WhatsApp), Cloudflare bot checks, disposable email blocking, max 2 open unpaid (`PENDING_PAYMENT`) orders, order size/value caps, rate limits (random device ID + IP, 5 failed logins lock for 15 min), idempotency key on submit, and a 3-strike system (strikes for `EXPIRED_UNPAID` or a "payment not found" rejection; 3 strikes in 30 days = block remote ordering) with manual admin unblock. Strikes/device flags apply only after the 5-minute undo window. Post-v1: email-code velocity gate for table sessions (replaces WhatsApp OTP).
6. **Venue namespace & Two-Mode Ordering.** Customer entry operates in two distinct modes: (1) **Remote Pre-Ordering (`REMOTE`):** Accessed via `order.cafe.pk/{tenant_slug}` (authenticated customer profile required, pickup break slots scheduled, manual payment reference claims). (2) **In-Venue Table QR Ordering (`IN_VENUE`):** Accessed via `/{tenant_slug}/t/{zone_slug}/{table_number}` (100% anonymous, zero sign-up or profile needed, direct kitchen queue dispatch, physical payment at counter desk; slot picker and payment proof fields completely bypassed).
7. **Venue Ordering Channels.** Supports both `REMOTE` (counter pre-order pickup) and `IN_VENUE` (table QR ordering). In `IN_VENUE` mode, orders route directly to the kitchen with table/zone binding; diners pay cash/card at the counter desk. Note: `PROTOTYPE.html` is officially retired and archived; all active development is strictly in `apps/web`.
8. **First order is held (post-v1).** (TABLE_SERVICE post-v1 only): The first order in a table session goes through mandatory HOLD; later orders in the same session are not held. In v1 (COUNTER_PICKUP), walk-up orders skip HOLD.
9. **Pre-ordering (F1, v1 default).** Pre-orders are COUNTER_PICKUP-only, require a profile (verified email from any provider), and flow through a third KDS queue of scheduled tickets that start at the kitchen start time (pickup minus per-venue prep lead, default 10 min). Status flow: `PENDING_PAYMENT → SCHEDULED → PREPARING → READY → SERVED`. Paid via the venue's own accounts; the customer submits a payment reference (transaction ID primary, screenshot optional); the ticket waits in `PENDING_PAYMENT` until the operator/admin taps "payment received". Orders are same-day only, within venue-set remote-order hours and last-order time; the operator can pause remote orders. Slot cutoff = prep lead + 10 min. A ready order held 30 min past pickup is no-show with no refund (terms shown before payment). Customer can cancel until the kitchen start time; after that no in-app cancel. See ADR-0007.
10. **Discounts are staff-visible only (F2, future).** A discount appears as a "claims SZABIST 10%" badge on the staff view and is applied manually at the legacy POS. It never enters `line_total` (ADR-003) or the order snapshot. Restricted venues are enforced physically by the guard — the app adds no access gate. Verification is by institution-issued email + one-time code; a discount is a Partnership (venue opts in, discount off the venue's price); percentage only at first; affiliations re-verified every 12 months; the order stores a snapshot of the partnership reference and discount percentage (field names planned). See ADR-0008.

## Code & Engineering Conventions

- See [**`CONVENTIONS.md`**](./CONVENTIONS.md) for full coding conventions and style rules.
- See [**`WORKFLOW.md`**](./WORKFLOW.md) for branch taxonomy, pre-flight quality checks, and PR standards.
- TypeScript strict mode, no `any` types. Pre-push gates: `pnpm run check-types` and `pnpm run build`.
- All database queries run inside transactions with RLS context set
- API routes are tenant-scoped via JWT (staff) or session token (customers)
- Environment variables for all secrets; never hardcode credentials
- English and Roman Urdu only. Urdu script is **NEVER** supported.
- All timestamps are stored as `TIMESTAMP WITH TIME ZONE` in UTC

## File Structure Mental Model

```
src/
  api/           # Fastify route handlers grouped by domain
    customer/    # PWA-facing endpoints (menu, cart, order submission)
    kds/         # Kitchen display system endpoints and WebSocket handlers
    cashier/     # Settlement terminal endpoints
    admin/       # Menu management, zone/table config, reports
    auth/        # Staff authentication, customer auth (registration, login, verification, reset)
  db/
    migrations/  # Sequential SQL migration files
    policies/    # RLS policy definitions
    seeds/       # Development seed data
  services/      # Business logic layer (order lifecycle, menu versioning, audit)
  websocket/     # WebSocket connection management and event broadcasting
  utils/         # Shared utilities (tenant context, validation, error handling)
```

## Common Pitfalls

- The app never processes payments or holds money. It may display a venue's payment instructions and record that the venue confirmed a payment. *(Reworded per owner brief v2 §4.2 — F1 pre-ordering involves payment references, never money handling.)*
- Do not reference `menu_items.price` in financial calculations; always use `order_items.unit_price_snapshotted`.
- Do not add `UPDATE` or `DELETE` permissions on `order_lifecycle_events` for any non-superadmin role.
- Do not assume single-floor venues. Always use zone-qualified table references.
- Do not build drag-and-drop floor plan editors. Admin UI for tables is a simple form with batch generation.
- Do not implement thermal printer drivers. KDS is 100% digital tablet-based.
- Do not add Apple Pay / Google Pay integration. Pakistani market uses cash, card terminals, and Raast/SadaPay at the counter.
- Forward-Deployed Engineer (FDE) onboarding replaces self-serve venue creation in v1 per `FDE_RUNBOOK.md`. The FDE manually provisions the venue, enters the menu, configures payment settings, and sets up QRs and screens. The FDE access model is a platform support role scoped to one venue at a time, audit logged, and never uses `BYPASSRLS`.

## Requested Features (Owner Brief, Oct 2026)

- **F1 — Pre-ordering for students (v1).** A student can place an order from home or class for a chosen pickup slot at a COUNTER_PICKUP venue. Pickup-slot fulfilment (not delivery), scheduled KDS queue, paid via the venue's own accounts (`PENDING_PAYMENT → SCHEDULED`), venue-configurable slot capacity and prep lead (default 10 min), cancel until kitchen start, screenshot retention 30 days. Profile required (email, phone, password registration; display name required before first order). See ADR-0007.
- **F2 — Cross-venue affiliation discounts (Phase: future, not v1).** Percentage-based discounts for customers affiliated with an institution, directional across venues via Partnerships. Enrollment-based, verified by institution email + one-time code; cashier-visible badge applied manually at the legacy POS; guard-only restricted venues; separate no-`tenant_id` tables (tenancy rule); discount snapshot on the order; 12-month re-verification. See ADR-0008.
- **F3 — User profiles as perks wallets (v1).** A user can create a profile to unlock perks and discounts; F2 depends on it. Perks wallet, not an ordering identity; in-venue ordering stays anonymous; required only for remote orders (F1). Registration fields: verified email, mandatory Pakistani mobile phone (`+923...`), password (Argon2id). Display name and optional institutional affiliation are deferred and collected after registration (display name required before first remote order). Cross-venue identity tables (`customers`, `email_verification_codes`, `password_reset_tokens`) live isolated behind `app_identity_user` role. See ADR-0009.
