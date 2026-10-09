# HANDOFF.md — QueueLess Developer & Architecture Handoff

> **Date:** October 9, 2026  
> **Project:** QueueLess (In-Venue Digital Pre-Ordering & Kitchen Sidecar)  
> **Target Market:** Pakistan Fast-Casual Dining & University Cafeterias (FAST, LUMS, IBA, NUST, SZABIST, DHA, Gulberg)  
> **Repository:** `https://github.com/Usamabhanbhro/restaurant-ordering-system-pk.git`  
> **Current Branch:** `main` (clean working tree, synced with remote)  
> **Local Prototype:** `http://localhost:8080/PROTOTYPE.html`

---

## 1. Executive Summary & Commercial Proposition

QueueLess is an order-only digital pre-ordering and kitchen management system built specifically for Pakistan's high-density fast-casual dining and university cafeteria ecosystem. It solves the 20-minute counter queue problem during university class breaks and office lunch rushes by providing:

1. **Remote Pre-Ordering with Scheduled Counter Pickup:** Diners schedule specific pickup slots (e.g. `13:30`, `13:45`) and pay the venue directly.
2. **Unified Single-Screen Staff Web App:** A responsive web dashboard serving kitchen, cashier, and management simultaneously without requiring specialized hardware.
3. **The Non-Invasive Digital Sidecar Model:**
   - **Zero POS Replacement:** Operates alongside legacy fiscal cash registers (**Candela**, **Micros**, **Tossdown**) without disrupting FBR/PRA tax audit wiring.
   - **Direct Venue Payments:** Customers pay the venue directly into its own merchant bank or mobile wallet accounts (**Easypaisa**, **JazzCash**, **SadaPay**, **Nayapay**, **Raast QR**, **Meezan Bank**). QueueLess never handles, escrows, or processes card rails.
   - **Physical Counter Pickup:** Focused on same-day scheduled break times, strictly eliminating delivery logistics overhead.

---

## 2. Ratified Production Tech Stack

To deliver world-class aesthetic polish (benchmarked against **Starbucks**, **Uber Eats**, and **Buy Bao**) while ensuring instant load times (<300ms) on Pakistani 3G/4G cellular connections (Jazz, Zong, Telenor), the client and backend stack has been ratified across six pillars:

| Layer | Ratified Technology | Key Architectural Rationale |
|---|---|---|
| **Frontend Framework** | **Next.js 15 (App Router) + React 19** | **Server-Side Rendering (SSR) & Streaming:** Renders menu catalog HTML on the server. When scanning a counter QR, diners see a fully painted menu in `<300ms` before client JS hydrates. `next/image` with BlurHash/LQIP placeholders eliminates Cumulative Layout Shift (CLS). |
| **Styling & Design Tokens** | **Tailwind CSS v4 + Liquid Glass Tokens** | **Zero Runtime Overhead:** Compiles to ultra-lean static CSS. Native hardware-accelerated translucent filters (`backdrop-filter: blur(20px) saturate(180%)`) paired with diffuse ambient shadows and crisp 1px borders (`border: 1px solid rgba(255,255,255,0.2)`). |
| **Gesture Physics & Drawers** | **Vaul + Motion (`motion/react`)** | **Native Touch Mechanics:** iOS-grade drag tracking, velocity-aware dismissal, snap points, and background scale-down for Cart, Modifier, and Auth sheets. GPU spring transforms (`translate3d`) for tab morphs and steppers. |
| **UI Primitives & Icons** | **Radix UI Primitives + Lucide SVG** | **Accessible Headless Foundation:** WAI-ARIA keyboard navigation, focus trapping, and screen-reader compliance. 100% scalable vector SVGs adhering strictly to the **Strict No-Emoji Mandate**. |
| **State & Cache Management** | **Zustand + TanStack Query v5** | **0ms Optimistic UI:** TanStack Query caches menu and venue status with stale-while-revalidate; Zustand powers a lightweight client state store (`useCartStore`, `useSlotStore`, `useAuthStore`) with zero re-render overhead. |
| **Real-Time & Media Delivery** | **WebSocket Hub (`ws`) + Cloudflare Images / Imgix** | Dedicated low-latency WebSocket connection for 5-stage order progress timeline and kitchen KDS tickets. Cloudflare Images dynamically resizes payment screenshots and food cutouts under a 45KB budget. |
| **Backend Framework** | **Fastify 5.x + TypeScript 5.x Strict** | High-throughput, low-overhead Node.js 20 LTS runtime with JSON schema route validation and Pino structured JSON logging. |
| **Database & ORM** | **PostgreSQL 16+ + Drizzle ORM** | SQL-first, type-safe schema with strict multi-tenant Row-Level Security (RLS) policies and append-only audit lifecycle tables. |

---

## 3. Core Architectural Constraints & Invariants

All future implementation work must strictly honor the following non-negotiable architectural commandments:

### 3.1 Strict No-Emoji Mandate
- **Rule:** No Unicode emojis shall be used anywhere in the codebase (UI components, button labels, toasts, badges, navigation pills, mock data, wireframes, or documentation) unless explicitly requested by the user.
- **Enforcement:**
  - Icons: Always use Lucide vector SVGs or custom SVG paths with deliberate stroke and fill.
  - Region & Country Identifiers: Use standard typographic badges (e.g., `PK +92`), never flag emojis.
  - Status Dots: Use CSS circular badges (`bg-emerald-500`, `bg-[#EF5A30]`).
  - Labels & Documentation: Use clean text or bracket labels (e.g. `[Search]`, `[Copy]`, `[Skip]`).

### 3.2 Database Role & Access Separation
- **`app_runtime_user` (Tenant Runtime Role):** Standard application database user. Operates with RLS enabled on all tenant tables via `SET LOCAL app.current_tenant_id = ?`. Has `REVOKE UPDATE, DELETE ON order_lifecycle_events, customer_standing_events`. Has **NO ACCESS** to cross-venue identity tables.
- **`app_identity_user` (Identity Layer Role):** Isolated database role with exclusive access to cross-venue identity tables (`customers`, `email_verification_codes`, `password_reset_tokens`). Operates outside tenant context to prevent customer profile leakage across competing venues.

### 3.3 Zero Payment Handling
- QueueLess generates no merchant payment gateway transactions and holds no customer funds.
- Payments are direct-to-venue bank/wallet transfers with transaction ID claims and screenshot uploads.
- Kitchen release is gated on manual cashier confirmation (`PAYMENT_CONFIRM`).

### 3.4 5-Minute Undo Window & Strike Policy
- Mistaken cashier actions (`PAYMENT_CONFIRM` or `PAYMENT_REJECT`) can be undone within a **5-minute window**.
- Strikes accrue **only** on `NOT_FOUND` payment rejections that survive the 5-minute undo window.
- 3 strikes in 30 days automatically blocks remote ordering for that customer at that specific venue.

### 3.5 Windows SSL Verification Flag for Git
- On Windows Schannel SSL environments, git pushes fail with SSL verification errors.
- Always execute git push via:
  ```powershell
  git -c http.sslVerify=false push origin main
  ```

---

## 4. Interactive Prototype Feature Inventory (`PROTOTYPE.html`)

The interactive single-file application prototype at [`PROTOTYPE.html`](file:///f:/projects/restaurant-ordering-system-pk/PROTOTYPE.html) demonstrates the end-to-end user and staff experience:

### 4.1 Opening Splash Screen (Starbucks Ambiance • Apple Fluid Motion)
- **Starbucks Hospitality:**
  - Calm, warm cafe radial canvas (`#FFF3EC` to `#FFFBF8` to `#FFFFFF`).
  - Dynamic time-of-day greeting badge (*"Good morning"* / *"Good afternoon"* / *"Good evening"*).
  - Bottom venue grounding pill (*"Brewery Cafe Gulberg • 10m Pickup"*).
- **Apple Motion Craft:**
  - Critically damped spring entry (`cubic-bezier(0.16, 1, 0.3, 1)`): Emblem surfaces from `scale(0.92)` to `scale(1.0)` in 0.52s (never `scale(0)`).
  - Ceramic glaze specular sheen sweeps smoothly across the emblem in 1.1s.
  - Optical typographic stagger: Wordmark **Queue**<span className="text-[#EF5A30]">**Less**</span> and uppercase tagline (*"FAST PRE-ORDER & PICKUP"*) arrive with 160ms stagger.
  - Continuous spatial exit: Elevates (`scale(1.03) translateY(-8px)`) while fading out in 360ms.
  - Complete user agency: Tapping anywhere immediately dismisses the splash into the menu.
  - Replay triggers: Integrated into the top header bar (`[Splash]`) and the Customer Profile tab.

### 4.2 Customer Progressive Web App (PWA)
- **Discovery & Catalog:**
  - Sticky category pills with vector Lucide icons (*Popular*, *Burgers*, *Specialty Coffee*, *Quick Bites*, *Refreshers*).
  - Split card food layouts: English + Roman Urdu titles, weight badges, pricing, and high-contrast `+` pill buttons.
- **Customization Bottom Sheet (Vaul):**
  - Radio selections (Milk options), multi-select add-ons/exclusions, and 40-character kitchen note field (`^[a-zA-Z0-9\s.,!?'-]{0,40}$`).
- **Pickup Slot Scheduling:**
  - Horizontal chip carousel with capacity indicators (*Available*, *Filling Fast*, *Full*).
- **Pakistani Manual Payment Checkout:**
  - Venue account selector (Easypaisa, JazzCash, SadaPay, Meezan Bank) with one-tap copy account number.
  - Transaction ID input, proof screenshot preview, and terms acceptance.
- **5-Stage Order Progress Tracker:**
  - Visual status node stepper (`PENDING_PAYMENT` -> `SCHEDULED` -> `PREPARING` -> `READY` -> `SERVED`).
  - One-tap cancellation before `kitchen_start_at` with automatic refund queueing.
- **Campus Perks & University Discounts:**
  - 10% discount badge for students at FAST-NUCES, LUMS, IBA, and NUST.
- **Customer Auth Sheet:**
  - Email, mandatory Pakistani phone prefix pill (`PK +92`), Google and Facebook social login buttons, and post-signup display name callout prompt.

### 4.3 Staff Unified KDS & Cashier Dashboard
- **5 Operational Swimlanes:**
  - `PAYMENTS` (New claims awaiting cashier verification)
  - `SCHEDULED` (Confirmed orders waiting for auto-cook time)
  - `PREPARING` (Active kitchen cooking lane with 6m prep timer)
  - `READY` (Prepared orders awaiting counter pickup)
  - `REFUNDS` (Cancelled orders requiring manual cashier payback)
- **Responsive Small-Screen Layout:**
  - Viewports `< 1024px` display a smooth horizontal swipeable kanban board (`min-w-[240px]` per lane).
  - Viewports `>= 1024px` snap into an expansive 5-column dashboard grid.
- **Shift Audio Alerts:**
  - Synthesized Web Audio chime (`playChime()`) on incoming claims.
- **5-Minute Undo Window:**
  - Interactive toast with countdown timer enabling undo of confirm or reject.
- **Day-2 Admin Controls:**
  - Toggle 86 out-of-stock items in real time.
  - Pause/unpause venue remote orders during peak in-store rush.

---

## 5. Viewport Responsiveness Verification Matrix

Tested via the automated Chrome DevTools browser QA suite across three primary form factors:

| Viewport | Dimensions | Customer PWA Experience | Staff KDS Experience | Split View (`Both Views`) | QA Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Standard Mobile** | `390 × 844` (iPhone / Android) | **100% Native Feel:** Zero horizontal overflow; touch targets `> 44px`; Liquid Glass bottom dock sits flush above home indicator. | **Swipeable Kanban:** Horizontal flex scroll with 240px columns ensures full ticket legibility. | Auto-defaults to standalone Customer PWA on small screens. | **Verified Pass** |
| **Tablet** | `768 × 1024` (iPad / Air) | **Clean:** Centered mobile container preview with dark ambient borders. | **Optimal Density:** 240px–280px lanes; all action buttons (*Confirm*, *BUMP*) fit without truncation. | 430px PWA + flexible KDS dashboard side-by-side. | **Verified Pass** |
| **Desktop Monitor** | `1920 × 1080` (Full HD / KDS Display) | **Centered Phone Frame Preview** | **Superior:** Expansive 364px lanes with maximum ticket readability and real-time lane counters. | **Flawless:** 430px live phone simulator alongside 1454px KDS dashboard. | **Verified Pass** |

---

## 6. Project Documentation Index

The following specifications serve as the single sources of truth across the project:

- [`ARCHITECTURE.md`](file:///f:/projects/restaurant-ordering-system-pk/ARCHITECTURE.md): System architecture, 6 frontend pillars, backend services, database schema topology, and security model.
- [`DESIGN.md`](file:///f:/projects/restaurant-ordering-system-pk/DESIGN.md): Product design document, color palette tokens, typography scales, Section 3.0 Opening Splash Screen specification, and Strict No-Emoji Policy.
- [`CONVENTIONS.md`](file:///f:/projects/restaurant-ordering-system-pk/CONVENTIONS.md): TypeScript standards, Server vs Client component boundaries, Vaul/Motion rules, Radix UI conventions, and error handling.
- [`CLAUDE.md`](file:///f:/projects/restaurant-ordering-system-pk/CLAUDE.md): Architecture constraints, operational commands, and git guidelines.
- [`README.md`](file:///f:/projects/restaurant-ordering-system-pk/README.md): Repository overview, product badges, feature summary, and architecture ASCII diagrams.
- [`FDE_RUNBOOK.md`](file:///f:/projects/restaurant-ordering-system-pk/FDE_RUNBOOK.md): Forward-Deployed Engineer venue onboarding runbook (acrylic counter QR stand deployment, staff PIN setup, payment configuration).
- [`docs/adr/`](file:///f:/projects/restaurant-ordering-system-pk/docs/adr/): Architectural Decision Records (ADR-0001 through ADR-0009 covering identity isolation, strike policy, slot scheduling, and customer profile perks).

---

## 7. Immediate Production Next Steps

For the development team taking over the implementation phase:

1. **Turborepo Monorepo Initialization:**
   - Scaffold workspace:
     - `apps/web`: Next.js 15 (App Router) + React 19 (Customer PWA & Staff KDS)
     - `apps/api`: Fastify 5.x REST & WebSocket server
     - `packages/db`: Drizzle ORM PostgreSQL schema & migrations
     - `packages/types`: Shared TypeScript interfaces and Zod validation schemas
2. **Database Migration Execution:**
   - Run Drizzle migrations to establish tenant tables (`tenants`, `venue_settings`, `menu_items`, `orders`, `order_items`, `payment_claims`, `order_lifecycle_events`).
   - Run identity migrations under `app_identity_user` role (`customers`, `email_verification_codes`, `password_reset_tokens`).
   - Apply Row-Level Security policies on all tenant-scoped tables.
3. **Next.js 15 Route Architecture:**
   - `/app/[tenantSlug]`: Customer PWA with Server Component menu catalog HTML rendering (<300ms paint) and client boundaries for Vaul drawers, cart state, and opening splash.
   - `/kds/[tenantSlug]`: Unified Staff Dashboard with WebSocket connection to Fastify real-time hub.
4. **Cloudflare Services Setup:**
   - Configure Cloudflare Turnstile bot verification on customer sign-in and checkout endpoints.
   - Configure Cloudflare Images bucket for payment verification screenshots (with 30-day auto-purge worker).

---

*Handoff document prepared and ratified on 2026-10-09.*
