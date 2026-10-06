# FDE_RUNBOOK.md — Forward-Deployed Engineer Onboarding Runbook

> **Changelog (2026-10-06):** created per owner brief v6 (initial venue onboarding, setup steps, mandatory rehearsal, operator training, go-live, and rollback).

## 0. Role Definition & Scope

The Forward-Deployed Engineer (FDE) carries out white-glove onboarding for each pilot venue. The engineer acts as the operational owner for now (decided: `owner may override`). 
- **Security Boundary:** The FDE role is a platform support role scoped strictly to one venue at a time. All administrative actions are audit logged. The FDE **never uses `BYPASSRLS`** on the database.
- **Onboarding Philosophy:** High-touch, on-site setup that guarantees zero operational failure on day one.

---

## 1. Before the Visit (Collect & Confirm)

Collect and confirm all of the following venue details prior to arriving on-site:
- [ ] **Menu Details:** Full menu with categories, item descriptions, base prices, and modifier options (exclusions, add-ons, preferences).
- [ ] **Operating Hours:** Venue remote pre-order opening time (`remote_open_time`) and closing time (`remote_close_time`).
- [ ] **Kitchen Timings:** Prep lead time in minutes (`prep_lead_minutes`, default: 10 min; `owner may override`).
- [ ] **Slot Configuration:** Slot duration in minutes (`slot_minutes`, default: 10 min; `owner may override`) and slot capacity (`slot_capacity`, **no default: must be explicitly set per venue based on kitchen throughput**).
- [ ] **Payment Accounts:** Active payment destination details to show students (Easypaisa, SadaPay, bank transfer account title and account number).
- [ ] **Staff & Screen:** Who will operate the dashboard screen; what physical device is available (desktop PC, laptop, or smartphone); verify venue Wi-Fi / cellular internet connectivity.
- [ ] **Admin Contact:** Identify the designated venue admin (owner or head manager).

---

## 2. Venue Setup (Step-by-Step)

Execute the following sequential setup steps:

1. **Provision Venue Tenant:**
   - Run the internal provisioning CLI script on the backend host (internal engineer command, not exposed via public API):
     ```bash
     pnpm run cli:provision-venue --name "Brewery Cafe Gulberg" --slug "brewery-cafe-gulberg" --admin-name "Manager" --admin-pin "9821"
     ```
   - This seeds the `tenants` record, default `venue_settings`, and the initial `staff_accounts` admin profile.
2. **Enter Menu:**
   - Access the Admin tab (`/admin`) using the admin PIN.
   - Enter all categories, items, prices, and modifiers.
   - Verify every price against the physical menu.
   - Test the "86" toggle on at least one item to confirm out-of-stock propagation.
3. **Configure Payment Methods:**
   - In Admin → Payment Methods, add each approved payment account (Bank, Easypaisa, SadaPay).
   - Carefully verify the account title, account number, and payment instructions with the venue owner.
4. **Configure Venue Settings:**
   - Set `remote_open_time` and `remote_close_time`.
   - Set `prep_lead_minutes` (default 10 min), `slot_minutes` (default 10 min), `slot_capacity` (configured value), and the `price_note` (default: *"Prices are set by the venue."*).
5. **Issue Staff PINs:**
   - Generate distinct PINs for the `operator` (counter/kitchen staff) and `admin` (manager/owner).
   - Hand the physical PIN card securely to the venue owner.
6. **Deploy Physical Counter QR:**
   - Generate the venue Counter QR PDF via Admin → Generate QR (`order.cafe.pk/{tenant_slug}`).
   - Print the QR sheet and mount it in an acrylic stand prominently on the order pickup counter.
7. **Screen Setup:**
   - Open the web browser on the venue's designated desktop or phone screen.
   - Navigate to the staff dashboard URL (`staff.order.cafe.pk`).
   - Log in with operator PIN.
   - Tap **Start shift** once to prime browser web audio permissions.
   - Verify that test audio chimes play correctly.
   - Pin the dashboard web app to the desktop or phone home screen for one-tap access.

---

## 3. Mandatory Rehearsal (Required Before Go-Live)

The engineer must execute a complete end-to-end pilot run on-site:

8. **Happy Path Rehearsal:**
   - Using a smartphone, scan the counter QR and sign in via email code.
   - Place a test order for the earliest selectable slot.
   - Execute a small real money transfer (e.g., Rs. 50 via Easypaisa or bank transfer).
   - Submit the payment claim with the real transaction ID.
   - Verify on the staff dashboard that the order appears in `payments_to_confirm` within 2 seconds with an audible chime.
   - On the staff screen, tap **Confirm**. Verify order transitions to `SCHEDULED` and customer receives confirmation email.
   - Verify order activates into `PREPARING` at `kitchen_start_at`.
   - Tap **Bump** (`READY`) and verify pickup notification.
   - Tap **Hand Over** (`SERVED`).
   - Verify student transaction receipt email arrives.
9. **Unhappy Path Rehearsal:**
   - Test a payment claim with `WRONG_AMOUNT`: operator rejects with reason `WRONG_AMOUNT`; verify no strike is logged and customer is prompted to correct claim.
   - Test a payment claim with `NOT_FOUND`: operator rejects with reason `NOT_FOUND`; verify strike is held pending; trigger **Undo** within 5 minutes and verify claim reverts to `SUBMITTED` with no strike recorded.
   - Test customer order cancellation before `kitchen_start_at`: verify order moves to `VOIDED`, slot capacity is freed, and order appears in `refunds_owed` lane.
   - Test operator "Pause remote orders": toggle pause to ON; verify customer PWA displays paused banner and refuses new order placement with `VENUE_PAUSED`. Unpause before service.

---

## 4. Operator Training (~10 Minutes)

Conduct hands-on training with the counter operator:
- **Confirm vs. Reject:** Explain how to match bank notification SMS / app transaction IDs against claimed numbers before tapping Confirm. Emphasize using `WRONG_AMOUNT` for typos vs `NOT_FOUND` for missing transfers.
- **5-Minute Undo Window:** Show where the Undo button lives and how it corrects accidental taps without penalizing students.
- **Pausing Orders:** Show how to tap "Pause remote orders" if the kitchen is slammed or running low on ingredients.
- **86ing Items:** Demonstrate toggling items out of stock when an ingredient runs out.
- **Refunds Owed Lane:** Show how to check orders in `refunds_owed`, perform manual wallet transfer back to the customer, and tap "Refund done".
- **Offline Protocol:** Explain what to do if the screen shows an offline banner (switch to counter POS verbal queue; orders in flight remain safe in cloud).

---

## 5. Go-Live & Operational Follow-Up

11. **First Service Shadowing:**
    - The FDE remains physically present on-site during the venue's entire first pilot peak service.
    - If permitted by venue, record baseline metrics:
      - Current order error rate (wrong/missing items).
      - Peak-break customer counter queue wait times.
      - Staff count required for order-taking.
12. **Post-Launch Follow-Up:**
    - Check in on-site after **Day 1** to review error logs, rejected payments, and staff feedback.
    - Check in after **Week 1** to inspect dispute audit logs, strike counts, and system performance.
    - Log any edge cases or friction points directly into project issues.

---

## 6. Rollback Procedure

If severe operational issues occur during pilot:
- The operator immediately taps **Pause remote orders** in the dashboard header (or the FDE disables remote orders via admin panel).
- The venue immediately reverts to its normal physical counter ordering process.
- **Zero Lock-In:** Because QueueLess does not intercept POS settlement or touch fiscal receipts, nothing in the cafe's core operations depends on QueueLess. Rollback is instant with zero financial disruption.
