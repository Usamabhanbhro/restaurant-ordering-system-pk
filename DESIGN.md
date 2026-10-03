# DESIGN.md — Product Design Document

## 1. Product Vision

QueueLess is a lean, Pakistan-market-specific, order-only QR/NFC system that digitizes the path from a customer scanning a table tag to a kitchen cook reading the ticket on a mounted Android tablet — without replacing the restaurant's existing POS, payment flow, or staff hierarchy.

The product deliberately stops at order dispatch and kitchen display. It does not process payments, generate tax receipts, manage reservations, or handle delivery logistics. This constraint is the product's greatest strength: it can be deployed alongside any legacy POS system without disruption.

## 2. Stakeholder Map & Design Principles

### 2.1 The Customer (Diner)

**Context:** A 22-year-old university student at a specialty coffee shop in Gulberg, Lahore. They scan the QR code on the acrylic table block, browse the menu, and submit their order from their phone.

**Design principles:**
- Zero friction to first order. No app download, no account creation, no login. Pure anonymous PWA.
- The menu must load in under 2 seconds on a mid-range Android phone over 4G.
- Three-state order tracking is the only feedback surface: "Order Received — Table Being Checked" (amber), "Kitchen Preparing" (green), "Ready / Served" (completion banner with vibration).
- Multi-round ordering is seamless. On a second QR scan, the app detects an active table session and appends to the running tab. No "Add to existing order?" prompts.
- WhatsApp number capture is deferred to bill-request time as an optional loyalty incentive, never forced upfront.

### 2.2 The Line Cook (BOH)

**Context:** A cook on the hot line during Friday 8:30 PM rush. Standing in front of a 10-inch Android tablet mounted in a splash-proof bracket. Hands are greasy. Kitchen is loud.

**Design principles:**
- The KDS uses a dark-background, high-contrast UI with large touch targets (minimum 48x48dp).
- The screen is partitioned: 25% left column for "UNVERIFIED / HOLD" tickets (pulsing amber), 75% main area for "ACTIVE COOKING" tickets.
- Each ticket card displays in descending priority: Zone pill badge (e.g., `[ROOFTOP]`), Table number, elapsed timer, item names, modifier pills (red = exclusion/allergy, green = paid add-on, amber = cooking preference, slate = free-text note).
- Timer color codes: Green (0-10 min), Amber (10-20 min), Red (20+ min).
- Single-tap to move ticket from HOLD to ACTIVE (after floor runner verification).
- Single-tap to BUMP ticket as "Ready" (counter pickup mode) or "Plated" (table service mode).
- Single-tap to TRASH a ticket (prank/empty table). Device fingerprint is silently flagged.
- Urdu/English bilingual symbol tags for universal recognition.
- No text input required from the cook. Ever.

### 2.3 The Floor Runner / Waiter (FOH)

**Context:** A floor staff member managing 8-12 tables during peak hours. They do not carry a dedicated device (MVP). The cook yells to them for table verification.

**Design principles:**
- The waiter's role in the digital flow is minimal: physically verify a table when the kitchen signals, and (in TABLE_SERVICE mode) tap "Served" on the pass/expo tablet after food delivery.
- In TABLE_SERVICE mode, a shared expo tablet at the kitchen pass shows tickets in "PLATED — AWAITING DELIVERY" state. The runner taps "Delivered" after dropping the tray. This triggers the customer's completion notification.
- In COUNTER_PICKUP mode, the runner has no digital role. The single cook bump is sufficient.

### 2.4 The Cashier

**Context:** Sitting at the counter with the restaurant's legacy POS desktop terminal (Candela, Micros, Tossdown, or a custom .NET build). They also have a browser tab open to your cashier settlement web view.

**Design principles:**
- The cashier terminal (`cashier.cafe.pk`) shows all "Active" tables with running session totals.
- Expanding a table card reveals time-stamped order rounds with itemized lists, quantities, modifiers, and snapshotted prices.
- The cashier reads the itemized total, punches it into the legacy POS to generate the FBR/PRA tax receipt, and taps "Mark Settled / Clear Table" in the web app.
- Clearing the table releases it to "Open" state and terminates the customer's PWA session for that table.
- The cashier never modifies order contents. No edit, no void. Voids are manager-only actions logged in the audit trail.

### 2.5 The Restaurant Owner / Manager

**Context:** Reviews daily operations after closing. Concerned about food waste, staff accountability, and table turnover speed.

**Design principles:**
- The owner dashboard shows: daily order volume, average ticket time (submission to served), void/trash log with actor attribution, and the "Dispute Inspector" chronological audit trail per order.
- The admin panel supports: menu management (add/edit/remove items, toggle modifiers, 86-toggle for out-of-stock), zone and table configuration (batch generation with QR PDF download), staff account management (PIN-based login for KDS/cashier roles), and venue mode toggle (COUNTER_PICKUP vs TABLE_SERVICE).
- Menu price changes display a warning: "X tables have active sessions viewing earlier prices. New pricing applies to new sessions only."

## 3. Physical Hardware Design

### 3.1 Acrylic Table Block

- Dimensions: approximately 10cm x 10cm x 2cm standing acrylic block.
- **Front face:** High-contrast printed QR code + embedded anti-metal NFC NTAG216 chip. URL: `order.cafe.pk/t/{zone_slug}/{table_number}`.
- **Reverse face:** Emergency backup static QR code labeled "Backup Menu — Scan if App is Down." URL: `static-menu.cafe.pk/{tenant_slug}.pdf` (hosted on Cloudflare Pages, fully decoupled from application backend).
- Material must be heat-resistant, spill-proof, and weighted at the base to prevent toppling.

### 3.2 Kitchen Display Tablet

- Budget 10-inch Android tablet (Redmi Pad SE or equivalent, Rs. 20,000-25,000).
- Enclosed in a splash-proof wall-mount bracket positioned at cook eye level.
- Connected to venue Wi-Fi backed by a 4G SIM router on a 12V mini UPS battery.
- Runs the KDS web app in Chrome kiosk mode (full-screen, no address bar).

## 4. Customer PWA User Flow

```
[Scan QR / Tap NFC]
       │
       ▼
[Menu loads instantly — no login, no download]
       │
       ▼
[Browse categories, tap items, select modifiers]
       │
       ▼
[Review cart — subtotal shown (exclusive of tax)]
       │
       ▼
[Submit Order]
       │
       ▼
[Status Screen State 1: "Order Received — Checking Table" (Amber)]
       │
       ▼ (Cook verifies and moves ticket to ACTIVE)
[Status Screen State 2: "Kitchen Preparing" (Green)]
       │
       ▼ (Cook bumps ticket)
[Status Screen State 3: "Ready for Pickup" or "Food on its way to your table"]
       │
       ▼ (Optional: Second round scan — appends to running tab)
       │
       ▼
[Customer requests bill verbally — settles at legacy POS counter]
```

## 5. KDS Ticket Card Visual Hierarchy

```
┌──────────────────────────────────────────────────────┐
│ [ROOFTOP] TABLE 04                    ORDER #104     │
│ Elapsed: 8 mins  ██████████░░░░░░░░   [GREEN]       │
├──────────────────────────────────────────────────────┤
│                                                      │
│  [1] DOUBLE SMASH BURGER                             │
│      [NO ONION]  [+EXTRA CHEESE]  [WELL DONE]       │
│      📝 "cut in half please"                         │
│                                                      │
│  [2] ICED CARAMEL LATTE                              │
│      [OAT MILK]  [LESS SUGAR]                        │
│                                                      │
├──────────────────────────────────────────────────────┤
│  [ ✓ VERIFY & COOK ]         [ ✕ TRASH / EMPTY ]    │
└──────────────────────────────────────────────────────┘
```

Modifier pill color legend: Red = exclusion/allergy, Green = paid add-on, Amber = cooking preference, Slate = free-text note.

## 6. Offline & Degraded Mode Design

| Failure Scenario | Customer Experience | Staff Action |
|---|---|---|
| Backend server down | PWA shows cached menu (read-only) with yellow "Offline" banner | Waiter takes verbal orders as usual |
| Venue Wi-Fi down (4G SIM router active) | No change — KDS tablets and customer phones use 4G | None required |
| Complete power outage (pre-generator) | Customer scans backup QR on reverse of acrylic block for static PDF menu | Verbal ordering until power restores |
| KDS tablet battery dies | Orders queue in cloud; tablet pulls all pending tickets on reconnection | Cook uses backup station tablet or verbal relay |
