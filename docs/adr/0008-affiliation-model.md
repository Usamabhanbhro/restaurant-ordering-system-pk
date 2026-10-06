# Affiliation is enrollment-based, with two relations (F2, future)

> **Changelog (2026-10-06):** applied owner brief v4 — F2 remains post-v1 future feature; institution email required to verify affiliation.

Cross-venue discounts are keyed to a customer's **affiliation** with an institution (e.g. enrolled at SZABIST), not to where they have previously ordered — usage cannot prove enrollment, and anyone could order once to qualify. Affiliation therefore requires verification through a profile (F3).

The model has two distinct relations, not one:
- **Affiliation** — person ↔ institution (verified membership).
- **Partnership** — institution ↔ venue (a directional discount agreement: the venue honours the institution's affiliates).

The provisional terms "Institution"/"Affiliation"/"Partnership" are the working vocabulary.

Restricted venues (e.g. the SZABIST canteen) are enforced **physically by the guard** — the app adds no access gate. The discount is a staff-visible badge ("claims SZABIST 10%") applied manually at the legacy POS.

**Resolved operational decisions (delegated, per-venue configurable, `owner may override`):**
- **Verification:** by an institution-issued email address, confirmed with a one-time code.
- **Discount types:** percentage only at first; fixed-amount and others later.
- **Funding and opt-in:** a discount is a Partnership between an institution and a venue; the venue must opt in, and the discount comes off the venue's own price.
- **Multiple/expiring affiliations:** a profile can hold several affiliations; each is re-verified every **12 months** by default.
- **Discount on the order:** the order stores a snapshot of the partnership reference and discount percentage. Item prices and `line_total` stay pre-discount (ADR-003 unchanged). The staff badge shows the discount and the operator/admin applies it manually at the POS. Field names are for the schema owner to propose, marked "planned".

**Tenancy rule:** every venue table stays under RLS unchanged. Profiles, institutions, affiliations and partnerships live in *separate* tables with no `tenant_id`, reachable only through a separate database role and service. Venue tables never join to them. On an order, the server asks the cross-venue layer for eligibility and stores only the *result* on the order, linked by an opaque ID. A test runs on every change that tries to read venue B's orders as venue A and must fail.
