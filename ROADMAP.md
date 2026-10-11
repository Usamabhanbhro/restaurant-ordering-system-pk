# ROADMAP.md — Engineering Progress & Phased Execution Strategy

> **Changelog (2026-10-11):** reviewed and adjusted customer ordering UI on staged screens for remote pre-ordering and in-venue table QR; standardized sheet dismissal on swipe-down gesture by removing redundant close buttons across ItemCustomizerSheet and CustomerAuthSheet; simplified venue payment block in CartDrawer to display only the payment method name without account/phone numbers or redundant "Venue Direct" tags; implemented automatic smooth scroll-into-view for same-day counter pickup terms agreement errors; updated mode toggle to a clean, non-nested segmented background style without inner rings and hid the toggle on in-venue table QR screens; added structured DoorDash-inspired staged settings panel to ProfileTab across Account, Preferences, Support, More, and app version footer.  
> **Changelog (2026-10-10 - Session 3):** executed visual fix pass across customer screens; standardized mode toggle to concise "In-Venue" label without table numbers; removed in-venue table context banner from menu header; styled completed preparation timeline steps in Electric Cobalt `#1546d9` with white checkmark icons; eliminated total price and item price leaks from OrderProgressTracker; removed "Active" badge and icon clutter from PerksTab; converted Platform Member Discounts in ProfileTab from peach card to plain, unadorned text; eradicated decorative `Zap` and `Sparkles` embellishments across all customer surfaces and standardized branding on "The Velocity Platter" vector mark; cleaned institutional suffixes from mock customer names.  
> **Changelog (2026-10-10 - Session 2):** streamlined customer recovery flow (auto-advancing 6-digit OTP, dedicated `RESET_PASSWORD` state, removed 3-step segment indicator and action buttons in recovery); polished in-venue digital order ticket (simplified header to "Order Ticket", single visible price, removed redundant counter settlement body text, Electric Cobalt `#1546d9` timeline styling); simplified in-venue mode toggle to "In-Venue"; removed table mode banner from ProfileTab; refined Perks tab (removed extra button and zero platform fee promo block, generalized discounts to "Platform Member Discounts" across participating venues, removed institutional names across CartDrawer, ProfileTab, and PerksTab, standardized on generic `PROMO50`).
> **Changelog (2026-10-10):** ratified Two-Mode Customer Ordering Architecture (Remote Pre-Ordering `REMOTE` vs In-Venue Table QR `IN_VENUE`); implemented table route `[tenantSlug]/t/[zoneSlug]/[tableNumber]` with anonymous ordering and counter settlement; refined in-venue header (removed "NO ACCOUNT NEEDED" pill), mode toggle button (removed QR icon, hidden in tracker tab), cart drawer (streamlined header to "Your Order", removed table badges, bypassed slot picker and payment proof fields for table orders), category carousel (text-only pills, Saffron Amber `#f9b318` Popular styling), and profile tab (Electric Cobalt `#1546d9` plain text Verified); ratified Triad Brand Color Palette (`#fd8535`, `#f9b318`, `#1546d9`) and synchronized The Velocity Platter brand mark; officially retired and archived `PROTOTYPE.html` per user directive; verified monorepo quality gates (`check-types` and `build` clean at commit `91f2f5f`).  
> **Changelog (2026-10-09):** added granular Engineering Progress & Sitting Tracker for v1 web app implementation; logged completed architecture specifications, interactive prototype, minimal splash screen refinement, and developer handoff; mapped out modular development sittings across Turborepo monorepo packages.  
> **Changelog (2026-10-06):** applied owner brief v6 (v1 remote ordering scope locked; open items from brief v6 §10 updated in Open Decisions).

QueueLess is designed to win the Pakistani market through phased defensibility. The codebase is easy to clone, but the operational execution and distribution moat are impossible to copy in a short timeframe.

> **No committed timeline (owner brief v2 §1):** this is a pet project and the FYP comes first. The month ranges below are directional, not commitments.

---

## 1. Engineering Progress & Sitting Tracker (v1 Web App)

Because building a full-stack, multi-tenant digital ordering and KDS sidecar cannot happen in a single sitting, engineering work is broken into self-contained development sittings.

### 1.1 Completed Milestones (What We Have Done)

- [x] **Comprehensive Architecture & System Specifications**
  - [x] System Architecture Document ([ARCHITECTURE.md](file:///f:/projects/restaurant-ordering-system-pk/ARCHITECTURE.md)) defining sidecar model, 6 frontend pillars, multi-tenant PostgreSQL RLS topology, and dual-role database security.
  - [x] Database Schema Specification ([SCHEMA.md](file:///f:/projects/restaurant-ordering-system-pk/SCHEMA.md)) defining all tables, types, append-only audit lifecycle logs, and indexes.
  - [x] API Specification ([API.md](file:///f:/projects/restaurant-ordering-system-pk/API.md)) detailing REST endpoints, status codes (including 422, 503), and WebSocket event structures.
  - [x] Architectural Decision Records ([docs/adr/](file:///f:/projects/restaurant-ordering-system-pk/docs/adr/)) ADR-0001 through ADR-0009 approved.
  - [x] Forward-Deployed Engineer Runbook ([FDE_RUNBOOK.md](file:///f:/projects/restaurant-ordering-system-pk/FDE_RUNBOOK.md)) for pilot venue acrylic counter QR stand onboarding.
  - [x] Legal & Privacy Drafts ([PRIVACY.md](file:///f:/projects/restaurant-ordering-system-pk/PRIVACY.md), [TERMS_DRAFT.md](file:///f:/projects/restaurant-ordering-system-pk/TERMS_DRAFT.md), [LEGAL_REVIEW_NOTES.md](file:///f:/projects/restaurant-ordering-system-pk/LEGAL_REVIEW_NOTES.md)).

- [x] **Frontend Architecture & Design System Ratification (`64cab69`)**
  - [x] Ratified stack: Next.js 15 (App Router / SSR) + React 19, Tailwind CSS v4, Liquid Glass tokens, Vaul bottom sheets, Motion (`motion/react`) spring physics, Radix UI primitives, Lucide SVG vector icons.
  - [x] Codified and strictly enforced the **Strict No-Emoji Policy** across all code, tests, UI badges, mock data, and documentation ([CONVENTIONS.md](file:///f:/projects/restaurant-ordering-system-pk/CONVENTIONS.md), [DESIGN.md](file:///f:/projects/restaurant-ordering-system-pk/DESIGN.md)).

- [x] **Interactive Full-Stack Prototype (`PROTOTYPE.html` — Officially Retired & Archived)**
  - [x] *Status:* Served its mission as initial zero-dependency interactive proof of concept; officially retired from active updates per user directive on 2026-10-10. All subsequent features, UI polish, and architecture are implemented exclusively in the Next.js 15 Turborepo monorepo (`apps/web`).
  - [x] Complete simulated Customer PWA flow: category navigation, split food cards, Roman Urdu subtitles, scheduled slot selection, Pakistani manual payment proof upload, 5-stage order progress timeline.
  - [x] Customer authentication bottom sheet: email, mandatory Pakistani mobile phone (`PK +92`), password, social auth options (`17260a7`).
  - [x] Unified 5-lane Staff KDS: `PAYMENTS`, `SCHEDULED`, `PREPARING`, `READY`, `REFUNDS` with synthesized Web Audio chime (`playChime()`).
  - [x] 5-minute cashier undo window with countdown toast for confirm/reject mistakes.
  - [x] Responsive small-screen optimization: swipeable horizontal kanban board for mobile browsers (<1024px) and 5-column desktop grid (`42bf2c9`).
  - [x] Multi-viewport Chrome DevTools QA verification ([customer_menu_screenshot.png](file:///f:/projects/restaurant-ordering-system-pk/customer_menu_screenshot.png)).

- [x] **Ultra-Minimalist Splash Screen (`bd7c3d8`)**
  - [x] Replaced multi-element greeting and venue footer with an ultra-minimal, high-impact launch screen.
  - [x] Solid brand orange background (`#fd8535`).
  - [x] Pure white (`#FFFFFF`) The Velocity Platter vector emblem centered on canvas with zero extraneous typography.
  - [x] Apple critically damped spring entrance (`cubic-bezier(0.16, 1, 0.3, 1)` scaling `0.92 -> 1.0` in `0.52s`).
  - [x] Tap-to-dismiss instant agency with 1.8s auto-transition.
  - [x] Visual verification recorded ([splash_screen_screenshot.png](file:///f:/projects/restaurant-ordering-system-pk/splash_screen_screenshot.png)).

- [x] **Developer & Architecture Handoff & Scaffolding Plan (`0079a85`)**
  - [x] Developer Handoff Document ([HANDOFF.md](file:///f:/projects/restaurant-ordering-system-pk/HANDOFF.md)) with current system state, invariants, and environment notes.
  - [x] Multi-phase, subphase-by-subphase Turborepo implementation plan ratified ([plan_scaffold_turborepo_monorepo.md](file:///C:/Users/MUET/.gemini/antigravity/brain/ef0f97ab-ba9b-4db7-b01a-4ad2a2a6be0c/plan_scaffold_turborepo_monorepo.md)).

---

### 1.2 Development Sittings (What Needed To Be Done)

To maintain focus and avoid burnout across sessions, work is organized into 7 distinct development sittings:

#### Sitting 1: Monorepo Foundation & Workspace Setup (`e557de1` - COMPLETED)
*Focus: Establish the Turborepo workspace skeleton and shared compilation pipelines.*
- [x] Initialize `pnpm-workspace.yaml` (`apps/*`, `packages/*`).
- [x] Create root `package.json` with pinned `pnpm@12.6.0` and scripts (`build`, `dev`, `lint`, `check-types`, `clean`).
- [x] Configure `turbo.json` caching pipeline for builds, type checks, and persistent dev daemons.
- [x] Update `.gitignore` for Turborepo and Next.js artifacts.
- [x] Scaffold `packages/tsconfig` with base, Next.js, and Node shared tsconfigs.

#### Sitting 2: Shared Domain Types & Contracts (`packages/types` - `e557de1` - COMPLETED)
*Focus: Single source of truth for interfaces, enums, and Zod validation schemas.*
- [x] Define canonical domain enums (`OrderStatus`, `PaymentMethod`, `PaymentClaimStatus`, `SlotStatus`, `StaffRole`).
- [x] Implement Zod schemas for order creation, modifier selections, Pakistani phone numbers (`^\+92[3][0-9]{9}$`), and transaction claims.
- [x] Enforce the Strict Zero-Emoji Rule across all enum labels, badges, and test fixtures.
- [x] Setup build and type export maps for internal package consumption.

#### Sitting 3: Multi-Tenant Database Layer (`packages/db` - `e557de1` - COMPLETED)
*Focus: PostgreSQL 16 schema definitions, Drizzle ORM setup, and dual-role security.*
- [x] Configure `drizzle.config.ts` and database connection factories with the `postgres` driver.
- [x] Implement dual-connection topologies: `app_runtime_user` (tenant tables with RLS) vs `app_identity_user` (isolated cross-venue identities).
- [x] Author tenant schema (`tenants`, `venue_settings`, `menu_items`, `orders`, `order_items`, `payment_claims`).
- [x] Author append-only lifecycle event tables (`order_lifecycle_events`, `customer_standing_events`).
- [x] Author cross-venue customer identity schema (`customers`, `email_verification_codes`, `password_reset_tokens`).

#### Sitting 4: Backend Fastify API & WebSocket Hub (`apps/api` - Foundation Complete)
*Focus: REST API endpoints and real-time push infrastructure.*
- [x] Setup Fastify 5.x application shell with TypeScript strict configuration.
- [x] Register core plugins: `@fastify/cors`, structured Pino JSON logging, `@fastify/sensible` (422, 503 error handlers).
- [x] Register `@fastify/websocket` and implement real-time broadcast hub (KDS swimlane events & order status timeline).
- [x] Implement `GET /health` with runtime service metadata.
- [x] Implement public menu catalog endpoint with stale-while-revalidate caching headers.
- [x] Implement order intake and cashier claim submission endpoints.

#### Sitting 5: Next.js 15 Customer PWA (`apps/web` - COMPLETED & HARDENED)
*Focus: Mobile web ordering experience for diners across Remote and In-Venue Table QR modes.*
- [x] Initialize Next.js 15 (App Router) + React 19 app shell with Server Components for <300ms paint.
- [x] Configure Tailwind CSS v4 and Liquid Glass CSS tokens (`backdrop-filter: blur(20px)`).
- [x] Ratify Triad Brand Color Palette: Kinetic Orange (`#fd8535`), Saffron Amber (`#f9b318`), Electric Cobalt (`#1546d9`), Warm Cream Canvas (`#FFFBF8`), and Deep Slate (`#1e293b`).
- [x] Standardize on The Velocity Platter brand logo (`brand/queueless-svg.svg`), eliminating legacy SpeedCup vectors.
- [x] Port verified minimal `#fd8535` splash screen component (`SplashScreen.tsx`) with Apple spring entrance.
- [x] Setup client cache & state: Zustand stores (`cartStore`, `authStore`, `slotStore`, `orderStore`, `venueStore`) + TanStack Query v5 provider (`QueryProvider.tsx`).
- [x] Implement Two-Mode Customer Ordering Architecture:
  - [x] Remote Pre-Ordering (`REMOTE`) at `order.cafe.pk/[tenantSlug]` with customer auth, scheduled slots, and in-app payment claims.
  - [x] In-Venue Table QR Ordering (`IN_VENUE`) at `/[tenantSlug]/t/[zoneSlug]/[tableNumber]` with anonymous ordering, direct kitchen dispatch, and counter settlement.
- [x] Implement interactive bottom sheets using `vaul`: item modifier customizer (`ItemCustomizerSheet.tsx`), cart & checkout drawer (`CartDrawer.tsx`), customer auth sheet (`CustomerAuthSheet.tsx`).
- [x] Cart drawer polish: streamlined header to "Your Order" (removed store icons, item counts, and welcome text); pure white drawer surface; removed "Table Order" badge and `#04` square block.
- [x] Selective table order bypassing: pickup slot scheduler and manual payment proof upload sections completely hidden for table orders with direct counter cash/card settlement.
- [x] Category carousel & food cards: text-only category pills (icons removed); Saffron Amber (`#f9b318`) Popular pill and food card badge; Kinetic Orange (`#fd8535`) active category pills.
- [x] Live Order Tracker tab refinements: top-right cart button conditionally hidden (`activeTab === "status"`); mode toggle and in-venue header hidden while tracking orders; slot details hidden on table tickets.
- [x] In-venue digital ticket & timeline polish: simplified header to "Order Ticket"; single visible price line in ticket summary; redundant counter settlement body text removed; Preparation Timeline Step 1 icon and title styled in Electric Cobalt `#1546d9`.
- [x] Customer account recovery & verification flow: removed 3-step segment indicator and action buttons in recovery panel; added instant 6-digit OTP auto-advance; implemented dedicated `RESET_PASSWORD` state without Profile or Details step labels.
- [x] In-venue entry toggle simplified: button text updated to "In Venue"; zero QR icons; removed in-venue table mode banner from Profile tab.
- [x] Perks & discount promotion polish: removed extra button and zero platform fee promo block from Perks tab; rewrote student/campus promos into generic "Platform Member Discounts"; eradicated university names across CartDrawer, ProfileTab, and PerksTab, standardizing on generic `PROMO50`.
- [x] Profile tab: Electric Cobalt (`#1546d9`) plain text "Verified" badge (green pill and checkmark removed); opening splash replay trigger.
- [x] Quality gate validation: `pnpm run check-types` (0 errors across 4 packages) and `pnpm run build` (clean Next.js 15 production build).

#### Sitting 6: Unified Staff KDS Dashboard (`apps/web`)
*Focus: Responsive kitchen and cashier dashboard.*
- [ ] Implement 5 operational swimlanes: `PAYMENTS`, `SCHEDULED`, `PREPARING`, `READY`, `REFUNDS`.
- [ ] Implement responsive view modes: horizontal swipeable kanban for small mobile screens (<1024px) and full 5-column grid for tablets and desktop KDS displays (>=1024px).
- [ ] Implement 5-minute cashier undo toast with countdown progress bar.
- [ ] Implement Web Audio alert chime on incoming payment claims.
- [ ] Implement Day-2 admin controls: toggle 86 out-of-stock items and pause remote venue orders.

#### Sitting 7: Verification, Production Hardening & Pilot Launch
*Focus: Automated quality gates, performance profiling, and venue onboarding.*
- [ ] Run full workspace validation: `pnpm run check-types` and `pnpm run build` across all packages.
- [ ] Conduct multi-device Chrome DevTools audit (LCP, responsiveness, tap targets, contrast).
- [ ] Verify Cloudflare Turnstile bot verification on auth/checkout endpoints.
- [ ] Execute FDE Runbook to onboard pilot venue with acrylic counter QR stands.

---

## 2. Commercial & Distribution Roadmap (Phased Business Strategy)

### Phase 1: The Distribution Wedge (Months 1–6)

**Goal:** Establish first-mover advantage via direct sales, physical hardware deployment, and concierge onboarding.

- [ ] Core backend API and real-time WebSocket infrastructure layer (COUNTER_PICKUP mode)
- [ ] PostgreSQL RLS multi-tenant database provisioning
- [ ] Customer PWA frontend with remote pre-ordering (F1) and email-OTP profile sign-in (F3)
- [ ] Venue-level counter QR setup (`order.cafe.pk/{tenant_slug}`)
- [ ] Staff app delivered as responsive web app (desktop & phone browsers); Electron moved to v2
- [ ] Simple KDS (HOLD / PENDING_PAYMENT, scheduled queue, ACTIVE cooking queue)
- [ ] Cashier view with payment confirmation / rejection flow
- [ ] Forward-deployed engineer (FDE) onboarding workflow (manual menu entry, payment configuration)
- [ ] Core abuse and exploit defenses (verified email profile, Cloudflare bot check, open unpaid limit, rate limits, strikes system)
- [ ] Audit log written (no dispute inspector UI yet)
- [ ] **Launch Goal:** Deploy in pilot cafes with FDE onboarding
- [ ] *(Post-v1)*: TABLE_SERVICE features (table tags, runner verification, table sessions with 30-min idle timeout, delivery-overdue alerts)

### Phase 2: Operational Lock-In (Months 7–12)

**Goal:** Embed the software deeply into daily F&B operations to make switching costs existential for the venue owner.

- [ ] "Dispute Inspector" Owner Dashboard (exposing the immutable audit log)
- [ ] Advanced KDS routing (Barista station vs Hot Line station splitting)
- [ ] Self-serve Admin Panel for day-2 menu edits (price changes, 86ing items)
- [ ] Dual-venue mode toggle configurations (Counter pickup vs Table delivery)
- [ ] Offline resilience enhancements (PWA service worker rollout, static PDF fallback deployment pipeline)
- [ ] Advanced velocity-gate troll defense monitoring
- [ ] **Growth Goal:** Expand to 100+ venues, demonstrating near-zero churn due to operational dependency.

### Phase 3: Platform Moat (Months 12–24)

**Goal:** Leverage network effects to offer value no single-venue software competitor can match.

- [ ] Automated cross-venue operational benchmarking (e.g., "Your average ticket time at 8 PM is 14% slower than the Gulberg average").
- [ ] Customer loyalty and re-engagement engine powered by verified phone numbers (captured during bill requests or velocity gates).
- [ ] Predictive AI inventory alerts based on order velocity trends.
- [ ] Unified multi-location managerial reporting (for chains with 3+ branches).
- [ ] **Scale Goal:** Transition from a workflow tool to an essential business intelligence required to survive in the F&B sector.
- [ ] **F2 — Cross-venue affiliation discounts (Phase: future — NOT v1, low priority):** percentage-based discounts keyed to a customer's affiliation (e.g. enrolled at SZABIST), directional across venues via Partnerships. Decided: enrollment-based, verified by institution email + one-time code; cashier-visible badge applied manually at the legacy POS; restricted venues enforced physically (no app gate); affiliation data in separate no-`tenant_id` tables (tenancy rule); discount snapshot on the order; 12-month re-verification. Requires F3 (profiles). See ADR-0008.

- [ ] **F1 — Pre-ordering for students (v1):** a student can order from home or class for a chosen pickup slot at a COUNTER_PICKUP venue. Pickup-slot fulfilment (not delivery), scheduled KDS queue, paid via the venue's own accounts (`PENDING_PAYMENT → SCHEDULED`); venue-configurable slot capacity and prep lead (default 10 min); cancel until kitchen start; screenshot retention 30 days; customer account required (email, phone, password registration; display name required before first order). See ADR-0007.
- [ ] **F3 — User profiles as perks wallets (v1):** profile creation to unlock perks and discounts; prerequisite for F2. Perks wallet, not ordering identity; in-venue ordering stays anonymous; required only for remote orders (F1); registration fields: verified email, mandatory Pakistani mobile phone (`+923...`), password (Argon2id); display name and optional institutional affiliation deferred to onboarding/first order; password-authenticated. See ADR-0009.

---

## 3. Candidate Success Metrics (Non-Binding, owner brief v4 §7)

*Ideas for evaluation; non-binding, not requirements. Baselines to be measured at pilot venue.*

- **Accuracy:** order error rate (wrong or missing items per 100 orders).
- **Timeliness:** on-time pickup rate (share of scheduled orders READY by the pickup time); median and 90th-percentile order-to-ready time; peak-break counter wait.
- **Adoption:** share of orders placed through the app; repeat ordering rate; sign-up to first-order conversion.
- **Payment and abuse health:** median time from payment submission to cashier confirmation; unpaid/expired order rate; strike and block counts; accidental-trash undo rate.
- **Reliability:** uptime; time the venue's screen was disconnected.
- **Business:** orders per venue per day; weekly active venues; whether the pilot venue agrees to a paid plan.

---

## 4. Ongoing Technical Maintenance

- **DB Profiling:** Monitor indexing and connection pool behavior on the shared Postgres cluster as tenant count scales.
- **WebSocket Scaling:** Migrate from single-instance in-memory pub/sub to Redis-backed pub/sub for horizontal scalability of WebSocket connections.
- **Hardware Lifecycle:** Define warranty, replacement, and diagnostic processes for fielded screens and counter QRs.

---

## 5. Risks & Assumptions

- A KDS running in a smartphone browser may not alert reliably when the screen is off or locked (technical risk).
- The forward-deployed engineer (FDE) model does not scale beyond a handful of pilot venues.
- Abuse and exploit defenses are untested until real-world use.
- No validation with a real venue yet; the Rs 20k/month price and the "cuts staff" pitch are untested assumptions.
- A venue's internet reliability is the venue owner's responsibility. A backend outage remains our problem (SRS NFR-2.1, 99.9%).
- Cross-university discounts have limited real-world reach (guards and access rules stop students from visiting other campuses), so F2 stays low priority.

---

## 6. Open Decisions

Per owner brief v6 §10:

1. **Per-venue data retention values** — retention value open (fixed exception: payment screenshots deleted after 30 days).
2. **Email provider** — select email delivery provider; record in `PRIVACY.md` as processor once chosen.
3. **Dashboard layout on a phone** — responsive mobile layout design for phone screens.
4. **Slot capacity has no default; it is set per venue by the engineer** — venue-specific operational tuning.
5. **Every delegated number in this brief needs confirmation at a real venue** — prep lead time (default 10 min), slot length (default 10 min), claim deadline (default 15 min), no-show hold (default 30 min), undo window (default 5 min), rate limits, and strike thresholds.
6. **External: counsel review** of `PRIVACY.md`, `TERMS_DRAFT.md`, and `LEGAL_REVIEW_NOTES.md`.
