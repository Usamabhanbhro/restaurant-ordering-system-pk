# SRS.md — Software Requirements Specification

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for QueueLess, an in-venue restaurant digital ordering and kitchen management platform for the Pakistani market.

### 1.2 Scope
QueueLess enables customers to browse menus and order at their table via a zero-install Progressive Web App (PWA). It provides a digital Kitchen Display System (KDS) for back-of-house (BOH) staff to verify and track preparation, and a Cashier Settlement View to bridge orders to existing on-premise Point of Sale (POS) systems.

---

## 2. Functional Requirements (FR)

### 2.1 Customer PWA (Diner Interface)
- **FR-1.1:** System shall load the venue menu when a customer scans a table's QR/NFC tag without requiring authentication or account creation.
- **FR-1.2:** System shall allow customers to customize items using defined modifiers and a single free-text note (maximum 40 characters).
- **FR-1.3:** System shall provide real-time updates of order state across 3 distinct phases:
  1. `Order Received / Checking Table`
  2. `Kitchen Preparing`
  3. `Order Ready / Food on its way`
- **FR-1.4:** System shall support multi-round ordering by appending subsequent orders to the active table session.
- **FR-1.5:** System shall cache the full menu using Service Workers so diners can view items if internet drops mid-visit.

### 2.2 Kitchen Display System (KDS)
- **FR-2.1:** KDS shall display a dual-zone partition:
  - **Left 25%:** "HOLD / UNVERIFIED" queue for incoming submissions.
  - **Right 75%:** "ACTIVE COOKING" queue for verified tickets.
- **FR-2.2:** KDS shall feature high-contrast modifier pill tags (Red: Exclusions, Green: Add-ons, Amber: Preferences, Slate: Free-text note).
- **FR-2.3:** System shall provide single-tap ticket operations:
  - `VERIFY & COOK`: Moves ticket from HOLD to ACTIVE.
  - `BUMP / READY`: Marks order ready or served.
  - `TRASH / EMPTY`: Discards unverified fake orders and flags session.
- **FR-2.4:** KDS shall show color-coded timers (Green: <=10 min, Amber: 10-20 min, Red: >20 min).

### 2.3 Cashier Settlement Terminal
- **FR-3.1:** System shall display all active tables with a consolidated running tab (subtotal of all completed rounds).
- **FR-3.2:** System shall display snapshotted prices from the time of order placement, ignoring any subsequent menu price updates.
- **FR-3.3:** System shall allow cashiers to tap `[Mark Settled / Clear Table]`, which clears the active session and opens the table for the next party.

### 2.4 Manager & Admin Features
- **FR-4.1:** Admin panel shall support one-click "86ing" (marking items out-of-stock) to hide them from the live customer menu immediately.
- **FR-4.2:** Admin panel shall provide batch QR code generation per zone (Ground, Rooftop, etc.) with downloadable PDF sheets.
- **FR-4.3:** "Dispute Inspector" shall display a chronological, immutable event trail of every action taken on an order (placed, verified, bumped, voided).

### 2.5 Security & Abuse Throttling
- **FR-5.1 (Velocity Gate):** If a second order is submitted from the same table within 4 minutes, the system shall pause and require a 1-tap WhatsApp OTP verification before routing to the kitchen.
- **FR-5.2 (Session Limit):** System shall enforce a hard maximum of 4 distinct order rounds per table session. Further rounds require server assistance.

---

## 3. Non-Functional Requirements (NFR)

### 3.1 Performance
- **NFR-1.1:** Customer PWA first contentful paint (FCP) must be under 1.5 seconds on a 4G connection.
- **NFR-1.2:** Order dispatch to the KDS tablet screen must have an end-to-end latency of under 500ms via WebSockets.

### 3.2 Reliability & Availability
- **NFR-2.1:** Backend infrastructure must target 99.9% uptime.
- **NFR-2.2:** Tablets must recover order state automatically on reconnect following power/load shedding interruptions without data loss.

### 3.3 Security & Multi-Tenancy
- **NFR-3.1:** PostgreSQL Row-Level Security (RLS) must be active on all tenant-specific tables to physically prohibit cross-tenant data leaks.
- **NFR-3.2:** Audit logs in `order_lifecycle_events` must be write-only (no update, no delete) for standard runtime accounts.
