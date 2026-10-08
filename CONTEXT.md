# QueueLess Context

> **Changelog (2026-10-06):** applied owner brief v5 (operator/admin roles, single staff dashboard, remote hours/cutoffs/no-show, undo covers rejected payments).

QueueLess is an order-only QR/NFC ordering and kitchen-management platform for Pakistani fast-casual venues. It takes an order from a customer's phone to the kitchen display, then hands settlement to the venue's legacy POS. It never touches money.

## Venue & Space

**Venue**:
A single restaurant or café location with its own menu, staff, and table layout.
_Avoid_: tenant, restaurant, store

**Zone**:
A named area of a venue's floor, used to namespace tables (e.g. "Rooftop", "Ground").
_Avoid_: section, area, floor

**Counter QR**:
The primary v1 customer entry point (`order.cafe.pk/{tenant_slug}`), placed on the cafe counter. Works from anywhere, does not prove presence. Walk-up customers use the same flow and pick the earliest slot. (Owner brief v4 §3.)

**Table (Post-v1)**:
A physical customer unit with a QR/NFC tag, always referenced zone-qualified (`{tenant_slug}/t/{zone_slug}/{table_number}`).

**Forward-Deployed Engineer (FDE)**:
Sets up the venue before it goes live: creates venue, enters menu manually, configures payment instructions, prints and places QRs, sets up screen. Replaces self-serve onboarding in v1. (Owner brief v4 §2.2.)

**Table Session**:
The period a table is occupied by a party, opened on first menu load and closed by the cashier's settle or by an idle timeout (default 30 min, configurable per venue; "idle" means no new order). TABLE_SERVICE mode only. Belongs to the table, not to a person — a new party scanning before settle joins the existing session. Pre-orders have no table and therefore no table session. In-venue COUNTER_PICKUP orders skip HOLD and have no table session — the customer is at the counter, receives a pickup number, and pays on pickup.

## Affiliations & Discounts

**Institution**:
A body such as a university whose members and venue agreements create cross-venue perks (e.g. SZABIST). (ADR-0008)

**Affiliation**:
A verified relationship between a person and an institution (e.g. enrolled at SZABIST). What makes a customer eligible for an institution's discounts.
_Avoid_: membership

**Partnership**:
A directional discount agreement between an institution and a venue — the venue honours a discount for that institution's affiliates.
_Avoid_: affiliation (that word is the person↔institution link)

## Menu

**Menu Item**:
A sellable product with a base price, bilingual names (`name_en`, `name_roman_urdu`), and optional modifiers.
_Avoid_: product

**Modifier**:
A per-item customization, one of exclusion (allergy/omit), add-on (paid), or preference (cooking detail).

**86**:
To mark a menu item out of stock so it disappears from the live menu immediately.
_Avoid_: disable, hide

**Menu Version**:
A monotonically increasing revision of a venue's menu, attached to each order so price drift between what the customer saw and current pricing can be detected.

## Orders & Kitchen

**Order Round**:
One submission from a customer's phone, appended to the running tab of a table session. The unit that becomes a kitchen ticket.
_Avoid_: order (when meaning a single submission)

**Order**:
The domain entity — an order round plus its lifecycle trajectory. Prices and modifier choices are snapshotted into it at submission and are immutable.

**Price Snapshot**:
The frozen copies of item base price, modifier `price_delta`s, and computed `line_total` stored in an order at submission. Never recomputed from live menu prices.

**Ticket**:
The kitchen's view of an order, displayed on the KDS. Tickets sit in HOLD until verified, then move to ACTIVE COOKING.

**HOLD**:
The KDS queue for unverified submissions. Meaning is venue-mode dependent: in TABLE_SERVICE, a ticket waits for a runner to physically check the table; for a remote pre-order at a COUNTER_PICKUP venue, HOLD is the `PENDING_PAYMENT` state awaiting the cashier's "payment received". In-venue COUNTER_PICKUP orders skip HOLD.

**Verified at**:
`orders.verified_at` — set when a ticket leaves HOLD; starts the cooking timer. The KDS timers (green/amber/red) measure cooking time from this point, not time in queue. (Owner brief v3 §2.1.)

**VERIFY & COOK**:
The cook's single-tap action moving a ticket from HOLD to ACTIVE COOKING, after a floor runner has physically checked the table. In TABLE_SERVICE it asks "who checked?" — a one-tap pick from the runner list — and writes a `TABLE_CHECKED` audit event with the runner as actor. (Owner brief v3 §2.5.)

**Pre-order statuses**:
`PENDING_PAYMENT` (HOLD for remote orders, awaiting the staff's "payment received") → `SCHEDULED` (paid, waiting for the kitchen start time = pickup minus prep lead, default 10 min) → `PREPARING` → `READY` → `SERVED`. A ready order held 30 min past pickup is no-show with no refund. Expiry uses `VOIDED` with a reason code (`EXPIRED_UNVERIFIED` / `EXPIRED_UNPAID`) — no new status. (Owner brief v3 §3.3/§2.3 and v5 §2.2.)

**Order cancelled**:
A fourth customer state with neutral wording and no reason shown; applies to a trash, an expiry, or a customer cancel while the order is in HOLD. A restored ticket returns the phone to its previous state. (Owner brief v3 §2.4.)

**Bump**:
The cook's single-tap action marking a ticket ready — directly ready for counter-pickup venues, or "plated" awaiting delivery for table-service venues.

**Straight-up vs. staged completion**:
Counter-pickup venues complete in one bump; table-service venues require two — cook "plated", then runner "delivered".

**Trash / Reject**:
The discard action for a HOLD ticket (prank/empty, duplicate, wrong order) or the reject action for a payment claim. A soft void with an undo window (5 min default, configurable within the owner's 5–10 range) and a one-tap reason picker; both `operator` and `admin` restore; a restored trash returns to HOLD, a restored rejected payment returns to `PENDING_PAYMENT`, each with a fresh HOLD timer. Strikes/device flags apply only after the window closes. (Owner brief v5 §1.3; ADR-0006.)

**Settle**:
The cashier's action closing a table session after punching the tab into the legacy POS. Terminates the customer's PWA session for that table.
_Avoid_: clear, checkout, close out

## Staff & Terminals

**Customer**:
Anyone placing an order — via the counter QR (v1 remote pre-ordering, requires a profile) or in-venue table scan (post-v1, anonymous).
_Avoid_: diner, user, guest

**Payment reference**:
For a remote pre-order, the transaction ID (primary proof) or screenshot (optional) the customer submits to show they paid the venue outside the app. The `operator` confirms or rejects it (reason-coded); a confirm moves the ticket from `PENDING_PAYMENT` to `SCHEDULED`. Screenshots are deleted 30 days after the pickup date; the transaction ID is kept. (Owner brief v3 §3.3 and v5 §1/§2.3.)

**Pre-order**:
An order placed for a chosen pickup slot at a `COUNTER_PICKUP` venue. Orders are same-day only, within venue-set remote hours and last-order time; the operator can pause. Slot cutoff = prep lead + 10 min. The venue configures slot length and a maximum orders-per-slot (a full slot cannot be selected); the kitchen starts the ticket at the kitchen start time (pickup minus prep lead, default 10 min). Paid via the venue's own accounts (bank, Easypaisa, SadaPay) — the customer pays outside the app and enters a transaction ID or uploads a screenshot; the ticket moves `PENDING_PAYMENT → SCHEDULED` when the operator confirms. The customer can cancel until the kitchen start time; after that there is no in-app cancel (a confirmed payment shows a "refund owed" flag for the operator). A ready order held 30 min past pickup is no-show with no refund. The app never processes or holds money. Requires a profile.
_Avoid_: remote order, online order

**Profile**:
A perks wallet and remote ordering identity. Holds entitlements (e.g. an affiliation discount) for the operator/admin to see; not used for in-venue ordering (in-venue ordering stays anonymous). Registration fields: verified email (any provider; institution-issued for F2), mandatory phone number, and password (Argon2id). Display name and affiliations are collected afterwards. No WhatsApp.
_Avoid_: account, login

**Legacy POS**:
The venue's existing settlement terminal (Candela, Micros, Tossdown, custom .NET). The system never replaces it and never talks to it in v1.

**Staff Dashboard**:
The single unified web app (v1) showing Orders, Payments, and Admin tabs on one screen (desktop/phone browser). One live connection per screen. *(Supersedes: separate KDS app, cashier terminal, and Electron delivery — Electron is v2.)*

**Operator**:
Staff role (v1) that sees Orders and Payments tabs, confirms/rejects payment claims, moves tickets through kitchen lanes, trashes HOLD tickets/new payments, and restores within the 5-minute undo window. Cannot void post-verification or access the Admin tab.

**Admin**:
Staff role (v1) with all operator capabilities plus the Admin tab (menu, 86 toggle, venue settings, remote-order hours, unblocking) and post-verification voids. Sign-in via admin PIN.

**Floor Runner / FOH** (Post-v1):
The staff member who physically verifies tables when the kitchen signals and, in table-service venues, delivers food and taps "delivered".

**BOH**:
Back-of-house — the cooks working the KDS.

## Money & Fraud

**Tab**:
A table session's running total of all order rounds' subtotals. What the cashier reads and re-keys. The app calculates no tax — venues set menu prices and the app shows the price exactly as entered, with a per-venue configurable note on cart and payment screens (default "Prices are set by the venue", changeable to e.g. "Includes tax" or "Tax added at the counter"). (Owner brief v3 §3.6.)
_Avoid_: bill, check, total

**Bill request**:
The customer's verbal ask to settle; settlement always happens at the legacy POS, never in the app.

**Velocity gate**:
The anti-troll control (post-v1 TABLE_SERVICE) requesting an email code sign-in on a second order from the same session within 4 minutes. *(Supersedes: WhatsApp OTP — WhatsApp is not used; owner brief v4 §5.4).*

**Audit log**:
The append-only `order_lifecycle_events` trail — every state transition recorded with actor, terminal, and timestamp. Restores are new rows, not mutations.