# CLAUDE.md — Project Intelligence File

> This file is the authoritative context document for AI-assisted development on this codebase.
> It captures architectural decisions, conventions, domain-specific knowledge, and constraints
> that an AI coding agent needs to produce correct, idiomatic contributions on the first attempt.

## Project Identity

- **Name:** QueueLess (working title)
- **One-liner:** A standalone SaaS platform for in-venue restaurant ordering via QR/NFC tags, optimized for the Pakistani F&B market.
- **What it is NOT:** Not a payment processor. Not a POS replacement. Not a delivery app. Not a reservation system.
- **Core function:** Order-taking and kitchen dispatch layer that sits between the customer's phone and the Kitchen Display System (KDS), with a cashier settlement bridge to legacy POS systems.

## Target Market

- **Primary venues:** Fast-casual youth hubs — specialty third-wave coffee shops (DHA, Gulberg, F-6/F-7), burger bars, bubble tea spots, and university cafeterias (FAST, LUMS, IBA, NUST, SZABIST).
- **Explicitly excluded:** Traditional Pakistani family dining (karahi houses, BBQ restaurants, Do Darya, Burns Road). These venues are hospitality-driven and require in-person captain interaction.
- **Customer demographic:** Tech-savvy youth (18-30), comfortable with QR scanning, who hate waiting to flag down a waiter.

## Architecture Constraints

- **Backend:** Fastify (Node.js/TypeScript)
- **Database:** PostgreSQL with Row-Level Security (RLS) for multi-tenancy
- **Real-time:** WebSockets for KDS state sync and customer order status
- **Frontend (Customer):** Progressive Web App (PWA) — no native app, no app store download
- **Frontend (KDS/Cashier/Admin):** React web apps optimized for Android tablet browsers
- **Hosting:** Cloud-hosted (AWS/equivalent), no on-premise deployments
- **Offline strategy:** PWA Service Worker caches menu for offline browsing; ordering requires connectivity

## Multi-Tenancy Model

- Shared database, shared schema with `tenant_id` on every table
- PostgreSQL Row-Level Security (RLS) policies enforce isolation at the database engine level
- Application middleware sets `SET LOCAL app.current_tenant_id = ?` inside every transaction
- Superadmin analytics uses a `BYPASSRLS` database role
- Never rely on application-level `WHERE tenant_id = ?` alone; RLS is the enforcement layer

## Critical Domain Rules

1. **No payment processing.** The app never touches money. Bills are settled through the restaurant's legacy POS (Candela, Micros, Tossdown, etc.).
2. **Price snapshotting.** When a customer submits an order, item prices are frozen into `order_items.unit_price_snapshotted`. The cashier terminal always shows the locked-at-submission price, never the current menu price.
3. **Immutable audit log.** The `order_lifecycle_events` table is append-only. The application database role has `REVOKE UPDATE, DELETE` on this table. Every state transition is logged with actor, terminal, and timestamp.
4. **Kitchen verification flow.** Orders land in an "UNVERIFIED / HOLD" column on the KDS. The cook signals a floor runner to physically verify the table before moving the ticket to "ACTIVE COOKING." Food is never prepared on an unverified ticket.
5. **Anti-troll velocity gate.** First order per table session is anonymous and frictionless. A second order within 4 minutes triggers a mandatory WhatsApp OTP. Hard cap of 4 order rounds per table session.
6. **Zone/table namespace.** Table URLs use `/{zone_slug}/{table_number}` structure. Data model always includes `zone_id`. Never use flat table numbers without zone context.
7. **Dual venue modes.** System supports `COUNTER_PICKUP` and `TABLE_SERVICE` modes. Bump mechanics differ: single-bump for counter pickup, two-stage bump (cook "Ready" + runner "Served") for table service.

## Code Conventions

- See CONVENTIONS.md for full details
- TypeScript strict mode, no `any` types
- All database queries run inside transactions with RLS context set
- API routes are tenant-scoped via JWT (staff) or session token (diners)
- Environment variables for all secrets; never hardcode credentials
- All timestamps are stored as `TIMESTAMP WITH TIME ZONE` in UTC

## File Structure Mental Model

```
src/
  api/           # Fastify route handlers grouped by domain
    customer/    # PWA-facing endpoints (menu, cart, order submission)
    kds/         # Kitchen display system endpoints and WebSocket handlers
    cashier/     # Settlement terminal endpoints
    admin/       # Menu management, zone/table config, reports
    auth/        # Staff authentication, WhatsApp OTP
  db/
    migrations/  # Sequential SQL migration files
    policies/    # RLS policy definitions
    seeds/       # Development seed data
  services/      # Business logic layer (order lifecycle, menu versioning, audit)
  websocket/     # WebSocket connection management and event broadcasting
  utils/         # Shared utilities (tenant context, validation, error handling)
```

## Common Pitfalls

- Do not add payment/checkout/billing features. The app is order-only.
- Do not reference `menu_items.price` in financial calculations; always use `order_items.unit_price_snapshotted`.
- Do not add `UPDATE` or `DELETE` permissions on `order_lifecycle_events` for any non-superadmin role.
- Do not assume single-floor venues. Always use zone-qualified table references.
- Do not build drag-and-drop floor plan editors. Admin UI for tables is a simple form with batch generation.
- Do not implement thermal printer drivers. KDS is 100% digital tablet-based.
- Do not add Apple Pay / Google Pay integration. Pakistani market uses cash, card terminals, and Raast/SadaPay at the counter.
