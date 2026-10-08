# Privacy Policy (Draft)

> **Changelog (2026-10-06):** applied owner brief v4 (profile email from any provider; device hash used for rate limits & ban-evasion matching; strikes disclosure); applied owner brief v5 (random device ID, IP address, order history, retention rules, legal research annex).

> **Status: DRAFT — pending counsel review.** This document lists only the data categories the product is documented to collect. It does not state legal conclusions. See `LEGAL_REVIEW_NOTES.md` for research findings and questions for counsel. Verify against Pakistani data-protection law (including the PECA 2016 and any applicable PTA/DRAP guidance) before publishing.

## Data Categories

QueueLess collects the following data categories in the normal course of operation:

| Category | Details | Notes |
|---|---|---|
| Verified email | One verified email per profile (any provider; institution-issued email used only to claim a discount affiliation, F2). | Verified via 6-digit verification code. |
| Phone number | Mandatory mobile phone number provided at registration. | Stored in identity layer for account authentication and operational venue contact. |
| Password hash | One-way cryptographic hash of customer account password. | Hashed with Argon2id; plain passwords are never stored, transmitted in logs, or retrievable. |
| Display name | Profile field gathered during onboarding or first order. | Displayed on counter pickup ticket and staff KDS for customer callout. |
| Affiliations | Future feature (F2). | Requires a profile and an institution-issued email to claim. |
| Random device ID | Random identifier stored in the browser; paired with IP address for rate limits and ban-evasion matching. | No browser fingerprinting in v1. |
| IP address | Collected solely for rate limiting and abuse detection. | Disclosed alongside random device ID. |
| Payment transaction ID | Primary proof submitted by the customer for remote pre-orders (F1). | Retained indefinitely as operational proof; never processed by QueueLess. |
| Payment screenshot | Optional upload as backup proof of payment. | Deleted **30 days** after the pickup date. |
| Order history | Completed, cancelled, expired, or trashed order records. | Retained as long as needed per venue; period TBD per venue. |
| Strike and block records | Audit logs of operator/admin blocks, unblocks, and strike accumulations against profiles. | Retained as long as needed per venue; period TBD per venue. |
| Audit events | Immutable, append-only logs of all state transitions, payment confirmations/rejections, strikes, and administrative actions. | Retained as long as needed per venue; period TBD per venue. |

## Data Retention

- Personal and order data are retained **as long as needed**, with the specific retention period set **per venue and not yet decided**.
- The only fixed retention rule is: **payment screenshots are deleted 30 days after the pickup date.**

## What We Do Not Collect

- Payment card numbers, bank credentials, or any payment processing data.
- Plaintext passwords (passwords are hashed irreversibly using Argon2id with unique salt).
- WhatsApp numbers for authentication (WhatsApp is not used).

## Cross-Border Data Processing

If QueueLess's chosen cloud hosting region or its email service provider is located outside Pakistan, personal data may be transferred across borders. This fact must be disclosed in the published policy and is flagged for counsel review under question 4 in `LEGAL_REVIEW_NOTES.md`.

This draft must be reviewed by a legal professional before any customer-facing use.
