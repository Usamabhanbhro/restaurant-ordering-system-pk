<div align="center">

# ⚡ QueueLess

### Modern In-Venue Pre-Ordering & Kitchen Management for Pakistan's F&B Market

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5.x-000000?style=for-the-badge&logo=fastify&logoColor=white)](https://fastify.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-SQL--First-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![Node.js](https://img.shields.io/badge/Node.js-20_LTS-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](#-license)

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-the-problem-space">Problem Space</a> •
  <a href="#-core-features">Features</a> •
  <a href="#-system-architecture">Architecture</a> •
  <a href="#-order-lifecycle">Order Lifecycle</a> •
  <a href="#-unified-staff-dashboard-lanes">Dashboard</a> •
  <a href="#-documentation-index">Documentation</a> •
  <a href="#-quickstart--development">Quickstart</a>
</p>

</div>

---

> **Changelog (2026-10-06):** applied owner brief v6 (v1 remote ordering data model, API, 5 dashboard lanes, acceptance criteria, FDE runbook, draft customer terms).

---

## 📖 Overview

**QueueLess** is an order-only digital ordering and kitchen management system built specifically for the Pakistani fast-casual dining and university cafeteria landscape. It digitizes the customer journey from browsing the menu to kitchen preparation and counter pickup — **without replacing the restaurant's existing Point of Sale (POS), payment bank accounts, or staff hierarchy.**

Designed for high-density student hubs (FAST, LUMS, IBA, NUST, SZABIST) and specialty third-wave cafes (DHA, Gulberg, Islamabad F-Sectors), QueueLess allows customers to skip 20-minute counter queues by scheduling same-day pickup slots and verifying payments directly with venue staff.

---

## 🎯 The Problem Space

### Why Western POS Solutions Fail in Pakistan

In the Pakistani F&B ecosystem, restaurant and cafeteria owners fiercely protect their legacy cash registers (**Candela**, **Micros**, **Tossdown**) because:
1. **Fiscal Integration & Tax Audits:** The POS is directly wired into federal (FBR) and provincial tax systems. Replacing it introduces severe regulatory friction.
2. **Payment Rail Drop-Off:** Western platforms (Toast, Square) enforce upfront credit card or Apple Pay checkout. In Pakistan, card payment drop-off exceeds **80%**. Diners pay via cash, debit POS swipes, Raast QR, or wallet transfers (**Easypaisa**, **SadaPay**).
3. **Staff Dynamics:** Kitchen cooks, runners, and cashiers operate on established division of labor. Systems requiring tablet typing or full ERP overhaul are immediately abandoned.

### The QueueLess Solution: The Non-Invasive Digital Sidecar

QueueLess acts as an **order intake and kitchen dispatch sidecar**:
- **Zero POS Replacement:** Sits alongside existing hardware; completed orders are bridged verbally or manually recorded.
- **Direct Venue Payments:** Customers pay the venue directly into its own bank/wallet accounts. QueueLess never handles, processes, or holds funds.
- **Physical Counter Pickup:** Counter pickup model (not delivery) focused on same-day scheduled break times.

---

## ✨ Core Features (v1 Remote Ordering)

### 📱 Customer Progressive Web App (PWA)
- **Zero App Store Download:** Instant-loading mobile browser experience accessed via `order.cafe.pk/{tenant_slug}` or counter acrylic QR.
- **Streamlined Customer Account Creation:** Fast signup via email, Pakistani mobile phone, and password (profile per [ADR-0009](./docs/adr/0009-profile-perks-wallet.md)), with display name and institutional affiliations gathered after registration.
- **Intelligent Slot Scheduling:** Dynamic slot calculation based on venue operating hours, prep lead time, and atomic slot capacity counters.
- **Transparent 5-Stage Timeline:** Live status tracking with real-time WebSocket updates and email notifications.
- **Graceful Cancellation:** One-tap cancellation before kitchen start time (`kitchen_start_at`) with automatic refund queueing.

### 🖥️ Unified Staff Web Dashboard
- **Single-Screen Web App:** Responsive desktop and smartphone web app serving kitchen, cashier, and management roles simultaneously.
- **Five Operational Lanes:** Dedicated swimlanes for `payments_to_confirm`, `scheduled`, `preparing`, `ready`, and `refunds_owed`.
- **Shift Audio Alerts:** Single-tap **Start shift** enables browser web audio chimes and page title flashing for incoming claims.
- **5-Minute Undo Window:** Mistakes can be reverted within 5 minutes (undo confirm or undo reject) before strikes or status finalize.
- **No Kitchen TRASH in v1:** Discarding fake/unpaid remote orders is handled through payment claim rejection.

### 🛡️ Multi-Layer Abuse & Fraud Defenses
- **Bot Mitigation:** Cloudflare Turnstile bot gating on sign-in and order placement.
- **Open Unpaid Caps:** Maximum 2 open orders in `PENDING_PAYMENT` per customer.
- **Strict Rate Limits:** In-process rate limiting on login attempts (5 failed attempts locks account for 15 min), verification codes (3/15 min email, 10/hr IP), and order submission (5/10 min).
- **Fair Strike Policy:** Strikes accrue **only** on `NOT_FOUND` payment rejections that survive the 5-minute undo window. 3 strikes in 30 days automatically blocks remote ordering at that venue.
- **Anti-Duplication:** Unique constraints on transaction IDs (`payment_claims_txn_uq`) and client idempotency keys (`orders_idem_uq`).

### ⚙️ Background Scheduler Engine
- **Autonomous In-Process Worker:** Runs on a 30-second interval in Node.js.
- **Automated Lifecycle Processing:** Moves scheduled orders to `PREPARING` at `kitchen_start_at`, voids unreviewed claims at `pickup_at`, marks uncollected orders `NO_SHOW` at 30 minutes past pickup, and purges payment screenshots after 30 days.

---

## 🏗️ System Architecture

### Multi-Tenant Database & Role Isolation

```
                              [ Customer PWA ] (Mobile Browser)
                                      │
                              HTTPS / WebSockets
                                      │
                                      ▼
        ┌───────────────────────────────────────────────────────────────┐
        │               Load Balancer & Edge Proxy (Cloudflare)         │
        └──────────────────────────────┬────────────────────────────────┘
                                       │
                           ┌───────────┴───────────┐
                           ▼                       ▼
                ┌─────────────────────┐ ┌─────────────────────┐
                │ Public Read Path    │ │ Sensitive State Path│
                │ / Redis Cache       │ │ / RLS Transaction   │
                └─────────────────────┘ └─────────────────────┘
                                       │
                           PostgreSQL Connection Pool
                                       │
                                       ▼
        ┌───────────────────────────────────────────────────────────────┐
        │            Fastify Backend Application (Node.js)              │
        │   Customer Module │ KDS Module │ Payments │ 30s Scheduler     │
        └──────────────────────────────┬────────────────────────────────┘
                                       │
                                       ▼
        ┌───────────────────────────────────────────────────────────────┐
        │                      PostgreSQL 16 Database                   │
        │  ┌─────────────────────────────────────────────────────────┐  │
        │  │ Tenant Tables (venue_settings, orders, payment_claims)   │  │
        │  │ Protected by app_runtime_user + Strict RLS              │  │
        │  ├─────────────────────────────────────────────────────────┤  │
        │  │ Cross-Venue Identity (customers, verification, pwd_reset) │  │
        │  │ Isolated behind app_identity_user role (No tenant_id)   │  │
        │  └─────────────────────────────────────────────────────────┘  │
        └───────────────────────────────────────────────────────────────┘
```

- **Tenant Isolation:** Enforced via PostgreSQL Row-Level Security (`SET LOCAL app.current_tenant_id = ?`).
- **Identity Privacy:** Customer profiles live in separate tables without `tenant_id` and are queryable **only** by the `app_identity_user` role. Venue tables hold only opaque `customer_ref` UUIDs and display name snapshots.

---

## 🔄 Order Lifecycle

The customer lifecycle progresses across 5 distinct sequential stages:

```mermaid
stateDiagram-v2
    [*] --> PENDING_PAYMENT: Customer submits order (Slot reserved)
    
    state PENDING_PAYMENT {
        [*] --> AwaitingClaim: Waiting for customer payment
        AwaitingClaim --> ClaimSubmitted: Customer enters Txn ID
        ClaimSubmitted --> ClaimSubmitted: Wrong amount (resubmit allowed)
    }

    PENDING_PAYMENT --> SCHEDULED: Operator confirms payment claim
    PENDING_PAYMENT --> VOIDED: Expired (no claim by deadline / unreviewed at pickup)
    PENDING_PAYMENT --> VOIDED: Customer cancels before kitchen start

    SCHEDULED --> PREPARING: Scheduler triggers at kitchen_start_at
    SCHEDULED --> VOIDED: Customer cancels (refund_owed = true)
    
    PREPARING --> READY: Cook bumps ticket (Ready at counter)
    
    READY --> SERVED: Staff marks handed over (Collected)
    READY --> VOIDED: Uncollected at pickup + 30 min (NO_SHOW, no refund)

    SERVED --> [*]
    VOIDED --> [*]
```

---

## 🖥️ Unified Staff Dashboard Lanes

The staff interface is organized into five operational swimlanes:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ QueueLess Staff Dashboard — Brewery Cafe Gulberg                         [Shift Active 🔔] [Admin]│
├────────────────────┬────────────────────┬────────────────────┬──────────────────┬────────────────┤
│ PAYMENTS TO CONFIRM│     SCHEDULED      │     PREPARING      │      READY       │  REFUNDS OWED  │
├────────────────────┼────────────────────┼────────────────────┼──────────────────┼────────────────┤
│ ORDER #108 (13:30) │ ORDER #105 (13:20) │ ORDER #102 (13:10) │ ORDER #99 (13:00)│ ORDER #97      │
│ Ahmad Ali          │ Hamza Khan         │ Bilal Tariq        │ Sara Noor        │ Usman Riaz     │
│ Rs. 750.00         │ Rs. 450.00         │ Rs. 1,200.00       │ Rs. 650.00       │ Rs. 850.00     │
│ Easypaisa: 987654  │ Starts in: 4 mins  │ Elapsed: 6 mins    │ Ready: 2 mins    │ Reason: Cancel │
│                    │                    │                    │                  │ Bank: 12345678 │
│ [CONFIRM] [REJECT] │ [UNDO CONFIRM]     │ [BUMP READY]       │ [SERVED]         │ [REFUND DONE]  │
└────────────────────┴────────────────────┴────────────────────┴──────────────────┴────────────────┘
```

---

## 📚 Documentation Index

The QueueLess platform is fully documented across architectural, functional, operational, and legal specifications:

| Document | Purpose & Scope |
|---|---|
| [**`CLAUDE.md`**](./CLAUDE.md) | Authoritative AI development context, market constraints, and anti-patterns. |
| [**`CONVENTIONS.md`**](./CONVENTIONS.md) | TypeScript, Fastify API design, HTTP codes, and database role isolation standards. |
| [**`DESIGN.md`**](./DESIGN.md) | Product vision, UX wireframes, lane hierarchy, and offline degraded mode behavior. |
| [**`ARCHITECTURE.md`**](./ARCHITECTURE.md) | Component topology, state transitions, scheduler engine, and disaster recovery. |
| [**`SCHEMA.md`**](./SCHEMA.md) | PostgreSQL 16 table schemas, constraints, indexes, and Row-Level Security policies. |
| [**`API.md`**](./API.md) | Comprehensive REST route specifications, WebSocket events, and error envelopes. |
| [**`SRS.md`**](./SRS.md) | Software Requirements Specification with 26 verifiable acceptance criteria. |
| [**`ROADMAP.md`**](./ROADMAP.md) | Phased execution roadmap (Phase 1–3), risk register, and open venue decisions. |
| [**`FDE_RUNBOOK.md`**](./FDE_RUNBOOK.md) | Forward-Deployed Engineer runbook: venue provisioning, rehearsal, and training. |
| [**`TERMS_DRAFT.md`**](./TERMS_DRAFT.md) | Draft customer terms presented prior to payment (for legal counsel review). |
| [**`PRIVACY.md`**](./PRIVACY.md) | Data protection, retention policies, and cross-venue identity disclosure. |
| [**`LEGAL_REVIEW_NOTES.md`**](./LEGAL_REVIEW_NOTES.md) | Pakistani regulatory review notes (FBR, SBP, PECA, Consumer Protection). |

---

## 🛠️ Tech Stack

| Domain | Technology | Rationale |
|---|---|---|
| **Runtime** | Node.js 20 LTS | High-throughput asynchronous event loop with native fetch and crypto. |
| **Language** | TypeScript 5.x (Strict) | End-to-end type safety with zero implicit `any`. |
| **API Framework** | Fastify 5.x | High-performance JSON serialization and schema validation. |
| **Database** | PostgreSQL 16+ | Native Row-Level Security (RLS), atomic transactions, and CITEXT. |
| **Data Layer** | Drizzle ORM | SQL-first, zero-overhead type-safe query builder. |
| **In-Memory Store** | Redis | High-speed menu read cache and real-time Pub/Sub channels. |
| **Real-Time** | WebSockets (`ws`) | Bidirectional sub-500ms ticket synchronization. |
| **Edge & CDN** | Cloudflare | DDoS mitigation, Turnstile bot detection, and static PDF fallbacks. |

---

## 🚀 Quickstart & Development

### Prerequisites
- **Node.js** 20.x LTS or higher
- **pnpm** 9.x or higher
- **PostgreSQL** 16+ (with `pgcrypto` and `citext` extensions)
- **Redis** 7+

### 1. Clone & Install
```bash
git clone https://github.com/your-org/restaurant-ordering-system-pk.git
cd restaurant-ordering-system-pk
pnpm install
```

### 2. Environment Configuration
Copy the template environment file and configure local credentials:
```bash
cp .env.example .env
```

Ensure the following variables are configured in `.env`:
```ini
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/queueless_dev"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-development-jwt-secret-min-32-chars"
CLOUDFLARE_TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA"
```

### 3. Database Migration & Seeding
Run idempotent database migrations with Row-Level Security policies:
```bash
pnpm run db:migrate
pnpm run db:seed
```

### 4. Start Development Server
```bash
pnpm run dev
```
The Fastify server starts on `http://localhost:3000` with hot-reloading.

### 5. Run Verification & Test Suite
Execute the Vitest test suite including automated RLS tenant isolation checks:
```bash
pnpm run test
```

---

## 🤝 Forward-Deployed Engineering (FDE) Workflow

In v1, venue onboarding is high-touch and concierge-driven. The Forward-Deployed Engineer executes the structured onboarding protocol detailed in [**`FDE_RUNBOOK.md`**](./FDE_RUNBOOK.md):

1. **Pre-Visit Audit:** Collect menu pricing, slot duration, prep lead time, and payment accounts.
2. **Venue Provisioning:** Seed tenant and admin accounts via secure internal CLI script.
3. **Hardware & QR Placement:** Mount counter acrylic QR stand (`order.cafe.pk/{tenant_slug}`).
4. **Mandatory On-Site Rehearsal:** Execute real end-to-end money transfer and happy/unhappy path tests.
5. **Staff Training:** 10-minute training on confirm/reject, 5-minute undo, and refunds management.

---

## 🗺️ Roadmap & Status

- **Phase 1 (Months 1–6): The Distribution Wedge** *(Active)*
  - Remote Pre-ordering & counter pickup via PWA.
  - Unified Staff Web Dashboard with 5 lanes.
  - Direct venue payment verification (Easypaisa, SadaPay, Bank).
  - High-touch FDE venue onboarding.
- **Phase 2 (Months 7–12): Operational Lock-In**
  - Dispute Inspector UI for owners.
  - Multi-station kitchen routing (Barista vs Hot Line).
  - Post-v1 Table Service (`TABLE_SERVICE` mode with runner verification).
- **Phase 3 (Months 12–24): Platform Moat**
  - Cross-venue affiliation discount partnerships (F2 / [ADR-0008](./docs/adr/ADR-0008.md)).
  - Predictive kitchen inventory and prep alerts.

See [**`ROADMAP.md`**](./ROADMAP.md) for full delivery milestones and risk analysis.

---

## 📄 License

This repository and its documentation are proprietary and confidential. Unauthorized copying, distribution, or commercial modification is strictly prohibited.

---

<div align="center">
  <sub>Built with precision for the Pakistani F&B ecosystem. Managed by the QueueLess Engineering Team.</sub>
</div>
