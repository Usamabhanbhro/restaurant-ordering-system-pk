# ROADMAP.md — Phased Execution Strategy

QueueLess is designed to win the Pakistani market through phased defensibility. The codebase is easy to clone, but the operational execution and distribution moat are impossible to copy in a short timeframe.

## Phase 1: The Distribution Wedge (Months 1–6)

**Goal:** Establish first-mover advantage via direct sales, physical hardware deployment, and concierge onboarding.

- [ ] Core backend API and real-time WebSocket infrastructure layer
- [ ] PostgreSQL RLS multi-tenant database provisioning
- [ ] Diner PWA frontend (frictionless ordering)
- [ ] Simple KDS tablet frontend (HOLD vs ACTIVE cooking queues)
- [ ] Cashier settlement view
- [ ] AI-assisted concierge menu ingestion tooling (PDF -> Menu schema)
- [ ] Procurement of initial batch of physical NFC/QR acrylic blocks and budget Android tablets
- [ ] **Launch Goal:** Deploy in 10 pilot cafes in Lahore/Islamabad

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
- [ ] Customer loyalty and re-engagement engine powered by verified WhatsApp numbers (captured during bill requests or velocity gates).
- [ ] Predictive AI inventory alerts based on order velocity trends.
- [ ] Unified multi-location managerial reporting (for chains with 3+ branches).
- [ ] **Scale Goal:** Transition from a workflow tool to an essential business intelligence required to survive in the F&B sector.

## Ongoing Technical Maintenance

- **DB Profiling:** Monitor indexing and connection pool behavior on the shared Postgres cluster as tenant count scales.
- **WebSocket Scaling:** Migrate from single-instance in-memory pub/sub to Redis-backed pub/sub for horizontal scalability of WebSocket connections.
- **Hardware Lifecycle:** Define warranty, replacement, and diagnostic processes for fielded KDS tablets and missing/broken NFC tags.
