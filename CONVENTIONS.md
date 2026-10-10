# CONVENTIONS.md — Coding Standards & Project Conventions

> **Changelog (2026-10-09):** ratify frontend architecture stack — Next.js 15 (App Router / SSR) + React 19, Tailwind CSS v4, Vaul bottom sheets, Motion (motion/react), Radix UI primitives, Lucide SVG icons, Zustand client state, TanStack Query v5 data caching, Cloudflare Images CDN; enforce strict no-emoji policy.
> **Changelog (2026-10-06):** applied owner brief v6 (HTTP status codes 422 & 503 added; operator and admin staff roles clarified; app_identity_user role for cross-venue identity layer; undo covers confirm and reject; no TRASH in v1).

## Language & Runtime

- **Language:** TypeScript 5.x (strict mode enabled)
- **Runtime:** Node.js 20 LTS
- **Frontend Framework:** Next.js 15 (App Router / Server-Side Rendering) + React 19
- **Styling & Design Tokens:** Tailwind CSS v4 + Liquid Glass CSS variables
- **Sheet Drawers & Physics:** Vaul + Motion (`motion/react`)
- **UI Primitives & Iconography:** Radix UI Primitives + Lucide SVG (Strict No-Emoji Mandate)
- **Client State & Cache:** Zustand (local UI/session) + TanStack Query v5 (server state caching)
- **Backend Framework:** Fastify 5.x
- **Database:** PostgreSQL 16+
- **ORM / Query Builder:** Drizzle ORM (SQL-first, type-safe, migration-friendly)
- **Media Delivery & Optimization:** Cloudflare Images / Imgix CDN + `next/image`
- **Package Manager:** pnpm
- **Monorepo:** Turborepo (`apps/web` customer PWA & dashboard, `apps/api` Fastify backend, `packages/db`, `packages/types`)

## TypeScript Rules

- `strict: true` in `tsconfig.json` — no exceptions
- Never use `any`. Use `unknown` and narrow with type guards when the type is genuinely unknown.
- Prefer `interface` for object shapes that will be extended; use `type` for unions, intersections, and utility types.
- All function parameters and return types must be explicitly typed. No implicit `any` via missing annotations.
- Use `as const` assertions for literal enums and status strings.
- Barrel exports (`index.ts`) are permitted only at the `src/` top level and inside `src/api/`. Avoid deep barrel chains.

## Frontend Architecture & Component Conventions

- **Next.js 15 App Router & Server Components:**
  - Pages and layout containers default to Server Components for instant HTML rendering (<300ms paint) and zero client bundle penalty for static menu catalogs.
  - Mark components with `'use client'` strictly at the boundary of interaction (bottom sheet drawers, cart stores, animated steppers, form handlers).
  - Use `next/image` with BlurHash/LQIP placeholders and Cloudflare Images/Imgix CDN for automatic AVIF/WebP responsive delivery.
- **Gesture Physics & Drawers (Vaul):**
  - All sliding modal sheets (Cart Drawer, Modifier Customizer, Auth Sheet) must use `vaul` (`Drawer.Root`, `Drawer.Portal`, `Drawer.Content`).
  - Enable native velocity tracking, snap points (`['360px', '1']`), and background scale-down (`shouldScaleBackground`).
  - Include an accessible grab handle (`<div className="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto my-2" />`).
- **Motion & Animations (`motion/react`):**
  - Use hardware-accelerated transforms (`translate3d`, `scale`, `opacity`) via Framer Motion / `motion/react`.
  - Prefer spring physics (`transition: { type: 'spring', stiffness: 350, damping: 30 }`) over linear timing functions.
  - Never animate layout-triggering properties (`width`, `height`, `top`, `left`, `margin`). Use `layoutId` for morphing pill tabs and sticky active indicators.
- **Headless UI Primitives & Accessibility (Radix UI):**
  - Implement complex accessible interactions (dialogs, tabs, popovers, dropdowns) using headless `@radix-ui/react-*` primitives.
  - Ensure strict keyboard navigability (Esc to dismiss, Tab trapping, arrow-key tab cycling).
- **Iconography & Strict No-Emoji Mandate:**
  - Icons MUST strictly use Lucide SVG (`lucide-react`) or custom vector SVG curves.
  - **Zero Emojis:** Do not use emoji characters anywhere in UI text, buttons, alerts, badges, or code. Emojis render inconsistently across Android, iOS, Windows, and Linux.
  - Country/region badges use styled text pills (e.g. `PK +92`), not flag emojis.
- **State Management & Data Caching:**
  - **Zustand:** Used for local client state (Cart store `useCartStore`, Active slot `useSlotStore`, Diner session `useAuthStore`). Keep actions colocated with state and avoid monolithic stores.
  - **TanStack Query v5:** Used for server state caching (menu catalog, venue status, active order timeline). Configure `staleTime: 60_000` for menus and optimistic mutations for cart interactions.

## Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| Files & directories | `kebab-case` | `order-lifecycle.ts`, `menu-items/` |
| Interfaces & types | `PascalCase` | `OrderItem`, `TableSession` |
| Functions & variables | `camelCase` | `getActiveOrders`, `tenantId` |
| Database tables | `snake_case` (plural) | `order_items`, `menu_items` |
| Database columns | `snake_case` | `unit_price_snapshotted`, `tenant_id` |
| Environment variables | `SCREAMING_SNAKE_CASE` | `DATABASE_URL`, `JWT_SECRET` |
| API route paths | `kebab-case` | `/api/v1/menu-items`, `/api/v1/order-rounds` |
| WebSocket events | `SCREAMING_SNAKE_CASE` | `ORDER_STATE_CHANGED`, `PAYMENT_CLAIM_SUBMITTED` |

## API Design

- RESTful resource naming. Verbs live in HTTP methods, not URLs.
- All endpoints are versioned: `/api/v1/...`
- Tenant context is derived from JWT claims (staff endpoints) or signed session tokens / customer tokens (customer endpoints). Never pass `tenant_id` as a query parameter from the client.
- Request validation via Fastify JSON Schema or Zod with `fastify-type-provider-zod`.
- All responses follow a consistent envelope:

```json
{
  "success": true,
  "data": { ... },
  "meta": { "timestamp": "2026-10-03T12:00:00Z" }
}
```

- Error responses:

```json
{
  "success": false,
  "error": {
    "code": "CONCURRENT_MODIFICATION",
    "message": "Order was updated by another station."
  }
}
```

- HTTP status codes used: `200` (success), `201` (created), `400` (validation / venue closed or paused / past cutoff), `401` (unauthenticated), `403` (unauthorized / customer blocked / RLS violation), `404` (not found), `409` (conflict / state violation / duplicate transaction / slot full / price changed / undo window closed), `422` (unprocessable entity / 86ed item / item unavailable), `429` (rate limited / too many open orders), `500` (server error), `503` (service unavailable / maintenance / upstream outage). *(422 and 503 added per owner brief v6 §3).*

## Database Conventions

- Every tenant table includes: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`, `tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE`, `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ DEFAULT NOW()`.
- Tables without `tenant_id`: cross-venue identity tables (`customers`, `email_verification_codes`, `password_reset_tokens`) exist outside tenant isolation and belong to the identity layer.
- All timestamps stored as `TIMESTAMP WITH TIME ZONE` in UTC. Frontend converts to local timezone for display.
- Foreign keys always include explicit `ON DELETE CASCADE`, `ON DELETE RESTRICT`, or `ON DELETE SET NULL` — never leave the default ambiguous.
- Indexes are created explicitly for all foreign key columns and any column used in `WHERE` clauses in hot-path queries and scheduler polling.
- RLS policies must be defined for every table that contains tenant-scoped data. No exceptions.
- The `order_lifecycle_events` and `customer_standing_events` tables are append-only. The `app_runtime_user` database role has `REVOKE UPDATE, DELETE` on these tables.
- Use `JSONB` sparingly and only for semi-structured data (modifier selections, metadata blobs). Never store relational data in JSON.

## Database Roles & Access Separation

- **`app_runtime_user` (Tenant Runtime Role):** Standard application database user. Operates with RLS enabled on all tenant tables via `SET LOCAL app.current_tenant_id = ?`. Has `REVOKE UPDATE, DELETE ON order_lifecycle_events, customer_standing_events`. Has **NO ACCESS** to cross-venue identity tables (`customers`, `email_verification_codes`, `password_reset_tokens`).
- **`app_identity_user` (Identity Layer Role):** Isolated database role with exclusive access to the cross-venue identity layer (`customers`, `email_verification_codes`, `password_reset_tokens`). Operates independently of tenant context. The tenant runtime role cannot query identity tables, ensuring cross-venue profile isolation (brief v6 §1.1).

## Migration Rules

- Migrations are sequential SQL files: `001_create_tenants.sql`, `002_create_zones_and_tables.sql`, etc.
- Every migration must be idempotent where possible (`CREATE TABLE IF NOT EXISTS`, `DO $$ ... $$` blocks for conditional logic).
- Destructive migrations (dropping columns, tables) require explicit team review and are never auto-applied in production.
- RLS policy changes are tracked as migrations, not applied ad-hoc.

## Authentication & Authorization

- **Staff (Single Dashboard):** JWT tokens issued on PIN login (`operator`, `admin` roles in v1; `floor_staff` returns post-v1 with TABLE_SERVICE). Claims include `tenant_id`, `role` (`operator`, `admin`), and `staff_id`.
  - `operator`: Sees Orders (kitchen lanes: scheduled, preparing, ready) & Payments tabs (`payments_to_confirm`, `refunds_owed`); confirms/rejects payment claims; moves tickets; marks ready, served, refund done; pauses/unpauses remote orders; restores confirmed or rejected payment within 5-minute undo window (delegated: owner may override). *(Superseded: TRASH ticket — in v1 undo covers confirm and reject; there is no kitchen TRASH in v1; rejecting a claim is the v1 equivalent of discarding an unpaid order; TRASH stays a post-v1 table-service action per owner brief v6 §2.2/§8).*
  - `admin`: All operator capabilities plus Admin tab (venue settings, menu management, 86 toggle, payment methods, staff accounts, blocked customers list, customer block/unblock) and post-verification voids.
  - Forward-Deployed Engineer (FDE) access is a platform support role scoped to one venue at a time, audit logged (never uses `BYPASSRLS`; brief v5 §1.1, brief v6 §5).
- **Customers (Customer PWA):** Stateless session tokens signed with the venue's public key (in-venue anonymous ordering). Remote pre-orders register and sign in via email, mandatory phone, and password (`Authorization: Bearer <token>`; token versioned, password hashed with Argon2id; verified email from any provider; display name and affiliations set afterwards). Cross-venue profile isolation enforced via `app_identity_user` role.
- **Abuse Velocity Gate (Post-v1 TABLE_SERVICE):** Triggered on second order within 4 minutes; requires signing in with email one-time code. *(Supersedes: WhatsApp OTP — WhatsApp is not used anywhere; owner brief v4 §5.4/§6).*

## WebSocket Conventions

- WebSocket connections are scoped per dashboard screen: **one live connection per screen** (running Orders, Payments, Admin tabs inside the single app).
- Events are JSON objects with a `type` field and a `payload` field:

```json
{
  "type": "ORDER_STATE_CHANGED",
  "payload": {
    "orderId": "uuid",
    "newState": "PREPARING",
    "actor": "KDS_STATION_1"
  }
}
```

- Server-to-client events:
  - Customer channel (scoped to customer's own orders): `ORDER_STATE_CHANGED`.
  - Staff channel (scoped to tenant): `PAYMENT_CLAIM_SUBMITTED`, `ORDER_STATE_CHANGED`, `ORDER_STALE` (v3), `MENU_ITEM_86ED`, `REMOTE_ORDERS_PAUSED`. *(TABLE_SERVICE post-v1 retains `ORDER_DELIVERY_OVERDUE`, `TABLE_SESSION_CLEARED`, `NEW_ORDER_HOLD`).*
- Client-to-server / REST actions: `PAYMENT_CONFIRM`, `PAYMENT_REJECT`, `ORDER_UNDO`, `ORDER_READY`, `ORDER_SERVED`, `ORDER_REFUND_DONE`, `REMOTE_ORDERS_PAUSE`. *(Superseded: `KDS_TRASH_TICKET` — no kitchen TRASH in v1; rejecting a claim is the v1 equivalent of discarding an unpaid order; TRASH is post-v1 table-service per brief v6 §2.2/§8).*

## Error Handling

- All errors are caught at the Fastify error handler level. Route handlers throw typed errors; they do not send raw responses on failure.
- Use custom error classes extending a base `AppError` class with `code`, `statusCode`, and `message`.
- Never expose stack traces or internal error details in production responses.
- Log all errors with structured JSON logging (pino, built into Fastify).

## Testing

- Unit tests for business logic in `src/services/` using Vitest.
- Integration tests for API routes using Fastify's `inject()` method.
- Database tests run against a dedicated test database with RLS policies applied.
- No mocking of the database layer in integration tests — use real Postgres with transactions rolled back after each test.

## Git & Version Control

- Refer to [**`WORKFLOW.md`**](./WORKFLOW.md) for the authoritative engineering workflow, branch taxonomy, and PR standards.
- Branch taxonomy: `<type>/<scope>-<short-description>` (`feat/`, `fix/`, `refactor/`, `perf/`, `docs/`, `chore/`).
- Commit messages strictly follow Conventional Commits: `feat(scope):`, `fix(scope):`, `chore(scope):`, `docs(scope):`, `refactor(scope):`.
- Pre-flight quality gates must pass locally before pushing: `pnpm run check-types` and `pnpm run build`.
- On Windows development environments, push with `git -c http.sslVerify=false push origin <branch>`.
- Pull requests must be small (150–350 LoC) and merged via **Squash and Merge** to maintain a clean linear history on `main`.
- `main` branch is continuously deployable; feature branches are short-lived (max 2–3 days).

## Environment Configuration

- All configuration via environment variables. Use `.env.example` as a template with placeholder values.
- Required variables: `DATABASE_URL`, `JWT_SECRET`, `CLOUDFLARE_R2_BUCKET`, `PORT`. *(WhatsApp API variables removed per owner brief v4 — WhatsApp is not used).*
- Never commit `.env` files. `.env` is in `.gitignore`.

## Logging

- Structured JSON logging via Pino (Fastify default).
- Log levels: `fatal`, `error`, `warn`, `info`, `debug`, `trace`.
- Production runs at `info` level. Development runs at `debug`.
- Every log entry includes `tenant_id` when available in the request context.
- Sensitive data (passwords, tokens, card numbers) is never logged.
