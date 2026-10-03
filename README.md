# QueueLess (Restaurant Ordering System)

A digital restaurant ordering and kitchen management system optimized for the Pakistani F&B market.

QueueLess digitizes the path from a customer scanning a table tag to a kitchen cook reading the ticket, without replacing the restaurant's existing POS, payment flow, or staff hierarchy.

## The Problem Space

Pakistani restaurants rely heavily on legacy desktop POS systems (Candela, Tossdown, Micros) and cash/Raast payments. Modern table ordering apps (like Toast or Square) require direct POS integration, hardware lock-in, and upfront digital payments via Apple Pay/credit cards, which see >80% drop-off in this market.

QueueLess solves this by decoupling order-taking from payment settlement. It is an **order-only** pipeline designed specifically for fast-casual youth hubs (specialty cafes, university cafeterias, burger bars).

## Core Features

- **Anonymous Frictionless Ordering:** Customers scan an NFC/QR tag and order immediately via a zero-download PWA. No sign-up required.
- **Velocity-Triggered Troll Defense:** A mandatory WhatsApp OTP gate only triggers if a suspicious number of orders are submitted from the same table within a 4-minute window.
- **Tablet-Based Kitchen Display System (KDS):** Station-split tickets with color-coded modifier pills and a two-stage verification flow to prevent cooking fake orders.
- **Cashier Settlement Bridge:** A lightweight web terminal that lets cashiers read the table's digital tab and manually punch it into the legacy POS for tax generation.
- **Immutable Audit Trail:** An append-only lifecycle event log to resolve disputes over voided tickets and unserved food.
- **Dual Offline Fallback:** PWA Service Worker caching + a dual-sided physical acrylic tag with a static Cloudflare PDF menu backup.

## Documentation Index

The system's architecture and design decisions are exhaustively documented:

1. [CLAUDE.md](./CLAUDE.md) — Authoritative intelligence file for AI agents (identity, market, constraints).
2. [CONVENTIONS.md](./CONVENTIONS.md) — Coding standards, API design, and TypeScript rules.
3. [DESIGN.md](./DESIGN.md) — Product vision, UX flows, stakeholder requirements, and hardware specs.
4. [ARCHITECTURE.md](./ARCHITECTURE.md) — Technical foundations, component interactions, and data model.
5. [SCHEMA.md](./SCHEMA.md) — PostgreSQL table definitions and Row-Level Security (RLS) implementation.
6. [API.md](./API.md) — REST endpoints and WebSocket event definitions.
7. [SRS.md](./SRS.md) — Detailed Software Requirements Specification (functional & non-functional).
8. [ROADMAP.md](./ROADMAP.md) — Phased execution plan (Distribution → Lock-in → Platform).

## Tech Stack

- **Backend:** Node.js, TypeScript, Fastify
- **Database:** PostgreSQL (with Row-Level Security)
- **ORM:** Drizzle ORM
- **Real-time:** WebSockets
- **Frontend:** React (for KDS, Cashier, Admin pages), PWA (for customer menu)
- **Hosting:** Cloud-native deployment
