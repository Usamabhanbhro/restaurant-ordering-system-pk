# ROADMAP.md — Phased Execution Strategy

> **Changelog (2026-10-06):** applied owner brief v6 (v1 remote ordering scope locked; open items from brief v6 §10 updated in Open Decisions).

QueueLess is designed to win the Pakistani market through phased defensibility. The codebase is easy to clone, but the operational execution and distribution moat are impossible to copy in a short timeframe.

> **No committed timeline (owner brief v2 §1):** this is a pet project and the FYP comes first. The month ranges below are directional, not commitments.

## Phase 1: The Distribution Wedge (Months 1–6)

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

## Phase 2: Operational Lock-In (Months 7–12)

**Goal:** Embed the software deeply into daily F&B operations to make switching costs existential for the venue owner.

- [ ] "Dispute Inspector" Owner Dashboard (exposing the immutable audit log)
- [ ] Advanced KDS routing (Barista station vs Hot Line station splitting)
- [ ] Self-serve Admin Panel for day-2 menu edits (price changes, 86ing items)
- [ ] Dual-venue mode toggle configurations (Counter pickup vs Table delivery)
- [ ] Offline resilience enhancements (PWA service worker rollout, static PDF fallback deployment pipeline)
- [ ] Advanced velocity-gate troll defense monitoring
- [ ] **Growth Goal:** Expand to 100+ venues, demonstrating near-zero churn due to operational dependency.

## Phase 3: Platform Moat (Months 12–24)

**Goal:** Leverage network effects to offer value no single-venue software competitor can match.

- [ ] Automated cross-venue operational benchmarking (e.g., "Your average ticket time at 8 PM is 14% slower than the Gulberg average").
- [ ] Customer loyalty and re-engagement engine powered by verified phone numbers (captured during bill requests or velocity gates).
- [ ] Predictive AI inventory alerts based on order velocity trends.
- [ ] Unified multi-location managerial reporting (for chains with 3+ branches).
- [ ] **Scale Goal:** Transition from a workflow tool to an essential business intelligence required to survive in the F&B sector.
- [ ] **F2 — Cross-venue affiliation discounts (Phase: future — NOT v1, low priority):** percentage-based discounts keyed to a customer's affiliation (e.g. enrolled at SZABIST), directional across venues via Partnerships. Decided: enrollment-based, verified by institution email + one-time code; cashier-visible badge applied manually at the legacy POS; restricted venues enforced physically (no app gate); affiliation data in separate no-`tenant_id` tables (tenancy rule); discount snapshot on the order; 12-month re-verification. Requires F3 (profiles). See ADR-0008.

- [ ] **F1 — Pre-ordering for students (v1):** a student can order from home or class for a chosen pickup slot at a COUNTER_PICKUP venue. Pickup-slot fulfilment (not delivery), scheduled KDS queue, paid via the venue's own accounts (`PENDING_PAYMENT → SCHEDULED`); venue-configurable slot capacity and prep lead (default 10 min); cancel until kitchen start; screenshot retention 30 days; customer account required (email, phone, password registration; display name required before first order). See ADR-0007.
- [ ] **F3 — User profiles as perks wallets (v1):** profile creation to unlock perks and discounts; prerequisite for F2. Perks wallet, not ordering identity; in-venue ordering stays anonymous; required only for remote orders (F1); registration fields: verified email, mandatory Pakistani mobile phone (`+923...`), password (Argon2id); display name and optional institutional affiliation deferred to onboarding/first order; password-authenticated. See ADR-0009.

## Candidate Success Metrics (Non-Binding, owner brief v4 §7)

*Ideas for evaluation; non-binding, not requirements. Baselines to be measured at pilot venue.*

- **Accuracy:** order error rate (wrong or missing items per 100 orders).
- **Timeliness:** on-time pickup rate (share of scheduled orders READY by the pickup time); median and 90th-percentile order-to-ready time; peak-break counter wait.
- **Adoption:** share of orders placed through the app; repeat ordering rate; sign-up to first-order conversion.
- **Payment and abuse health:** median time from payment submission to cashier confirmation; unpaid/expired order rate; strike and block counts; accidental-trash undo rate.
- **Reliability:** uptime; time the venue's screen was disconnected.
- **Business:** orders per venue per day; weekly active venues; whether the pilot venue agrees to a paid plan.

## Ongoing Technical Maintenance

- **DB Profiling:** Monitor indexing and connection pool behavior on the shared Postgres cluster as tenant count scales.
- **WebSocket Scaling:** Migrate from single-instance in-memory pub/sub to Redis-backed pub/sub for horizontal scalability of WebSocket connections.
- **Hardware Lifecycle:** Define warranty, replacement, and diagnostic processes for fielded screens and counter QRs.

## Risks & assumptions

- A KDS running in a smartphone browser may not alert reliably when the screen is off or locked (technical risk).
- The forward-deployed engineer (FDE) model does not scale beyond a handful of pilot venues.
- Abuse and exploit defenses are untested until real-world use.
- No validation with a real venue yet; the Rs 20k/month price and the "cuts staff" pitch are untested assumptions.
- A venue's internet reliability is the venue owner's responsibility. A backend outage remains our problem (SRS NFR-2.1, 99.9%).
- Cross-university discounts have limited real-world reach (guards and access rules stop students from visiting other campuses), so F2 stays low priority.

## Open Decisions

Per owner brief v6 §10:

1. **Per-venue data retention values** — retention value open (fixed exception: payment screenshots deleted after 30 days).
2. **Email provider** — select email delivery provider; record in `PRIVACY.md` as processor once chosen.
3. **Dashboard layout on a phone** — responsive mobile layout design for phone screens.
4. **Slot capacity has no default; it is set per venue by the engineer** — venue-specific operational tuning.
5. **Every delegated number in this brief needs confirmation at a real venue** — prep lead time (default 10 min), slot length (default 10 min), claim deadline (default 15 min), no-show hold (default 30 min), undo window (default 5 min), rate limits, and strike thresholds.
6. **External: counsel review** of `PRIVACY.md`, `TERMS_DRAFT.md`, and `LEGAL_REVIEW_NOTES.md`.
