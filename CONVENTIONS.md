# CONVENTIONS.md — Coding Standards & Project Conventions

## Language & Runtime

- **Language:** TypeScript 5.x (strict mode enabled)
- **Runtime:** Node.js 20 LTS
- **Backend Framework:** Fastify 5.x
- **Database:** PostgreSQL 16+
- **ORM / Query Builder:** Drizzle ORM (SQL-first, type-safe, migration-friendly)
- **Package Manager:** pnpm
- **Monorepo:** Turborepo (if multi-package); otherwise flat `src/` structure for MVP

## TypeScript Rules

- `strict: true` in `tsconfig.json` — no exceptions
- Never use `any`. Use `unknown` and narrow with type guards when the type is genuinely unknown.
- Prefer `interface` for object shapes that will be extended; use `type` for unions, intersections, and utility types.
- All function parameters and return types must be explicitly typed. No implicit `any` via missing annotations.
- Use `as const` assertions for literal enums and status strings.
- Barrel exports (`index.ts`) are permitted only at the `src/` top level and inside `src/api/`. Avoid deep barrel chains.

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
| WebSocket event names | `SCREAMING_SNAKE_CASE` | `ORDER_STATE_CHANGED`, `KDS_TICKET_BUMPED` |

## API Design

- RESTful resource naming. Verbs live in HTTP methods, not URLs.
- All endpoints are versioned: `/api/v1/...`
- Tenant context is derived from JWT claims (staff endpoints) or signed session tokens (diner endpoints). Never pass `tenant_id` as a query parameter from the client.
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
    "code": "ORDER_LIMIT_EXCEEDED",
    "message": "Maximum 4 order rounds per table session."
  }
}
```

- HTTP status codes used: `200` (success), `201` (created), `400` (validation), `401` (unauthenticated), `403` (unauthorized / RLS violation), `404` (not found), `409` (conflict / state violation), `429` (rate limited), `500` (server error).

## Database Conventions

- Every table includes: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`, `tenant_id UUID NOT NULL`, `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ DEFAULT NOW()`.
- All timestamps stored as `TIMESTAMP WITH TIME ZONE` in UTC. Frontend converts to local timezone for display.
- Foreign keys always include `ON DELETE CASCADE` or explicit `ON DELETE RESTRICT` — never leave the default ambiguous.
- Indexes are created explicitly for all foreign key columns and any column used in `WHERE` clauses in hot-path queries.
- RLS policies must be defined for every table that contains tenant-scoped data. No exceptions.
- The `order_lifecycle_events` table is append-only. The `app_runtime_user` database role has `REVOKE UPDATE, DELETE` on this table.
- Use `JSONB` sparingly and only for semi-structured data (modifier selections, metadata blobs). Never store relational data in JSON.

## Migration Rules

- Migrations are sequential SQL files: `001_create_tenants.sql`, `002_create_zones_and_tables.sql`, etc.
- Every migration must be idempotent where possible (`CREATE TABLE IF NOT EXISTS`, `DO $$ ... $$` blocks for conditional logic).
- Destructive migrations (dropping columns, tables) require explicit team review and are never auto-applied in production.
- RLS policy changes are tracked as migrations, not applied ad-hoc.

## Authentication & Authorization

- **Staff (KDS, Cashier, Admin):** JWT tokens issued on login. Claims include `tenant_id`, `role` (`admin`, `cashier`, `kds_operator`, `floor_staff`), and `staff_id`.
- **Customers (Diner PWA):** Stateless session tokens signed with the venue's public key. Contain `tenant_id`, `zone_slug`, `table_number`, and `session_id`. No login required for first order.
- **WhatsApp OTP:** Triggered only by the velocity gate (second order within 4 minutes). Uses a third-party SMS/WhatsApp API (e.g., Twilio, local provider). OTP expires in 120 seconds.

## WebSocket Conventions

- WebSocket connections are scoped per terminal/session: one connection per KDS tablet, one per cashier terminal, one per customer phone session.
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

- Server-to-client events: `ORDER_STATE_CHANGED`, `MENU_ITEM_86ED`, `TABLE_SESSION_CLEARED`, `NEW_ORDER_HOLD`.
- Client-to-server events: `KDS_BUMP_TICKET`, `KDS_TRASH_TICKET`, `KDS_VERIFY_TICKET`.

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

- Branch naming: `feature/<short-description>`, `fix/<short-description>`, `chore/<short-description>`.
- Commit messages follow Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- Pull requests require at least one approval before merge.
- `main` branch is always deployable. Feature branches are short-lived.

## Environment Configuration

- All configuration via environment variables. Use `.env.example` as a template with placeholder values.
- Required variables: `DATABASE_URL`, `JWT_SECRET`, `WHATSAPP_API_KEY`, `WHATSAPP_API_URL`, `CLOUDFLARE_R2_BUCKET`, `PORT`.
- Never commit `.env` files. `.env` is in `.gitignore`.

## Logging

- Structured JSON logging via Pino (Fastify default).
- Log levels: `fatal`, `error`, `warn`, `info`, `debug`, `trace`.
- Production runs at `info` level. Development runs at `debug`.
- Every log entry includes `tenant_id` when available in the request context.
- Sensitive data (passwords, tokens, card numbers) is never logged.
