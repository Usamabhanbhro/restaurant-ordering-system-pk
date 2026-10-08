# API.md — REST Endpoints & WebSocket Events

> **Changelog (2026-10-06):** applied owner brief v6 (v1 remote ordering API: customer, staff, and admin routes; WebSocket events; abuse controls; error codes 422 & 503; supersessions).

All endpoints are versioned under `/api/v1`, use standard JSON payloads, and follow the consistent response envelope:

```json
{
  "success": true,
  "data": { ... },
  "meta": { "timestamp": "2026-10-06T12:00:00Z" }
}
```

Error responses always return:

```json
{
  "success": false,
  "error": {
    "code": "CONCURRENT_MODIFICATION",
    "message": "Order was updated by another station."
  }
}
```

Authentication:
- **Customer routes:** Customer Bearer token (`Authorization: Bearer <token>`). Sent with `X-Device-Id: <uuid>` on all customer requests.
- **Staff routes:** Staff JWT token (`Authorization: Bearer <jwt>`) issued on PIN login with claims `tenant_id`, `role` (`operator` or `admin`), and `staff_id`.
- **Public routes:** Unauthenticated (menu, slots, venue details, auth sign-in endpoints).

---

## 1. Customer Routes (v1 Remote Ordering)

### 1.1 `GET /api/v1/venues/:tenant_slug`
- **Visibility:** Public
- **Purpose:** Fetches venue status, operating hours, open/paused/closed state, venue announcement message, and `price_note`.
- **Response:**
```json
{
  "success": true,
  "data": {
    "name": "Brewery Cafe Gulberg",
    "slug": "brewery-cafe-gulberg",
    "timezone": "Asia/Karachi",
    "is_open": true,
    "remote_paused": false,
    "remote_open_time": "08:00:00",
    "remote_close_time": "22:00:00",
    "price_note": "Prices are set by the venue."
  }
}
```

### 1.2 `GET /api/v1/venues/:tenant_slug/menu`
- **Visibility:** Public (Cacheable in Redis & Service Worker)
- **Purpose:** Fetches full categorized menu and current `menu_version`.
- **Response:**
```json
{
  "success": true,
  "data": {
    "menu_version": 12,
    "categories": [
      {
        "id": "cat-uuid",
        "name": "Burgers",
        "items": [
          {
            "id": "item-uuid",
            "name_en": "Double Smash Burger",
            "name_roman_urdu": "Double Smash Burger",
            "description": "Double beef patty with cheddar cheese",
            "base_price": 650.00,
            "is_86ed": false,
            "modifiers": [
              {
                "id": "mod-uuid",
                "name_en": "Extra Cheese",
                "name_roman_urdu": "Ziada Cheese",
                "price_delta": 100.00,
                "type": "ADD_ON"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### 1.3 `GET /api/v1/venues/:tenant_slug/slots`
- **Visibility:** Public
- **Purpose:** Returns selectable pickup slots with remaining capacity for today. A slot is selectable if venue is open, not paused, `slot_start >= now + prep_lead_minutes + 10 minutes` (cutoff), and `slot_start < remote_close_time`.
- **Response:**
```json
{
  "success": true,
  "data": {
    "date": "2026-10-06",
    "slots": [
      {
        "slot_start": "2026-10-06T13:30:00+05:00",
        "slot_end": "2026-10-06T13:40:00+05:00",
        "remaining_capacity": 4
      }
    ]
  }
}
```

### 1.4 `POST /api/v1/auth/register`
- **Visibility:** Public (Rate limited; bot check required)
- **Purpose:** Create customer account with email, phone number, and password.
- **Request:**
```json
{
  "email": "student@gmail.com",
  "phone": "03001234567",
  "password": "Password123!",
  "bot_token": "cf-turnstile-token"
}
```
- **Validation Rules:**
  - `email`: Valid email format (any provider; `.edu.pk` required only for institutional discounts).
  - `phone`: Required Pakistani mobile format `^(\+92|0)?3[0-9]{9}$`.
  - `password`: Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 digit.
- **Response (`201 Created`):**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "customer": {
      "id": "cust-uuid",
      "email": "student@gmail.com",
      "phone": "03001234567",
      "display_name": null,
      "email_verified": false
    }
  }
}
```
- Dispatches a 6-digit email verification code to the customer's email address.

### 1.5 `POST /api/v1/auth/login`
- **Visibility:** Public (Rate limited; bot check required)
- **Purpose:** Sign in with email or phone number and password.
- **Request:**
```json
{
  "identifier": "student@gmail.com",
  "password": "Password123!",
  "bot_token": "cf-turnstile-token"
}
```
- **Responses:**
  - `200 OK`: Returns `{ "token": "jwt-token", "customer": { "id": "uuid", "email": "student@gmail.com", "phone": "03001234567", "display_name": "Ahmad Ali", "email_verified": true } }`
  - `401 Unauthorized`: `INVALID_CREDENTIALS` (locks after 5 consecutive failed attempts for 15 minutes).

### 1.6 `POST /api/v1/auth/verify-email`
- **Auth:** Customer Bearer Token
- **Purpose:** Verifies email address via 6-digit code sent upon registration.
- **Request:** `{ "code": "849201" }`
- **Responses:**
  - `200 OK`: `{ "email_verified": true }`
  - `400 Bad Request`: `INVALID_CODE` (max 5 failed attempts) or `CODE_EXPIRED` (10-minute validity).

### 1.7 `POST /api/v1/auth/forgot-password` & `POST /api/v1/auth/reset-password`
- **Visibility:** Public (Rate limited)
- **Purpose:** Request password reset code to verified email, and submit new password.
- **Forgot Request:** `{ "email": "student@gmail.com", "bot_token": "cf-turnstile-token" }`
- **Reset Request:** `{ "email": "student@gmail.com", "code": "849201", "new_password": "NewPassword123!" }`

### 1.8 `GET /api/v1/customers/me` & `PATCH /api/v1/customers/me`
- **Auth:** Customer Bearer Token
- **Purpose:** Read or update customer profile. Used during onboarding to set `display_name` (or update phone).
- **Request (PATCH):** `{ "display_name": "Ahmad Ali" }`
- **Requirement for Orders:** `display_name` must be set before placing a pre-order so staff can call out the ticket name at the counter.

### 1.9 `DELETE /api/v1/customers/me`
- **Auth:** Customer Bearer Token
- **Purpose:** Account deletion request. Sets `deleted_at`; data purged per retention schedule.

### 1.10 `POST /api/v1/venues/:tenant_slug/orders`
- **Auth:** Customer Bearer Token
- **Headers:** `X-Device-Id: <uuid>`
- **Purpose:** Creates a remote pre-order in `PENDING_PAYMENT`. Reserves slot capacity atomically.
- **Request:**
```json
{
  "pickup_slot_start": "2026-10-06T13:30:00+05:00",
  "menu_version": 12,
  "idempotency_key": "client-gen-uuid-or-nonce",
  "items": [
    {
      "menu_item_id": "item-uuid",
      "quantity": 1,
      "selected_modifiers": ["mod-uuid"],
      "free_text_note": "cut in half please"
    }
  ]
}
```
- **Response (`201 Created`):**
```json
{
  "success": true,
  "data": {
    "order_id": "ord-uuid",
    "status": "PENDING_PAYMENT",
    "pickup_at": "2026-10-06T13:30:00+05:00",
    "kitchen_start_at": "2026-10-06T13:20:00+05:00",
    "claim_deadline_at": "2026-10-06T13:15:00+05:00",
    "subtotal": 750.00,
    "payment_methods": [
      {
        "id": "pm-uuid",
        "kind": "EASYPAISA",
        "label": "Easypaisa Counter",
        "account_title": "Brewery Cafe",
        "account_number": "03001112233",
        "instructions": "Send exact amount and enter txn ID"
      }
    ]
  }
}
```
- **Error Responses:**
  - `400 VENUE_CLOSED` / `400 VENUE_PAUSED`: Venue is not accepting orders.
  - `400 PAST_CUTOFF`: Selected slot is earlier than now + prep lead + 10 min.
  - `403 CUSTOMER_BLOCKED`: Customer is blocked at this venue (3 strikes in 30 days).
  - `409 SLOT_FULL`: Slot capacity reached concurrent booking limit.
  - `409 PRICE_CHANGED`: Menu prices changed; returns current prices for confirmation.
  - `422 ITEM_UNAVAILABLE`: Item marked 86ed; returns `unavailable_items`.
  - `429 TOO_MANY_OPEN_ORDERS`: Customer already has 2 open orders in `PENDING_PAYMENT`.
  - `429 RATE_LIMITED`: Exceeded 5 order submissions per 10 minutes.

### 1.9 `POST /api/v1/uploads/payment-screenshots`
- **Auth:** Customer Bearer Token
- **Purpose:** Request a signed upload URL for payment receipt screenshot.
- **Request:** `{ "filename": "receipt.png", "mime_type": "image/png" }` (JPEG or PNG, max 5 MB).
- **Response:** `{ "upload_url": "https://storage...", "key": "screenshots/tenant/key.png", "expires_in": 300 }`.

### 1.10 `POST /api/v1/orders/:order_id/payment-claims`
- **Auth:** Customer Bearer Token
- **Headers:** `X-Device-Id: <uuid>`
- **Purpose:** Submit payment proof for an order in `PENDING_PAYMENT`.
- **Request:**
```json
{
  "payment_method_id": "pm-uuid",
  "transaction_id": "TXN9876543210",
  "amount": 750.00,
  "screenshot_key": "screenshots/tenant/key.png"
}
```
- **Responses:**
  - `201 Created`: Claim submitted; order stays `PENDING_PAYMENT`; payments lane alerted.
  - `409 DUPLICATE_TRANSACTION`: Transaction ID already used on an active claim.
  - `409 CLAIM_NOT_ALLOWED`: Order is not in `PENDING_PAYMENT` or past deadline.

### 1.11 `POST /api/v1/orders/:order_id/cancel`
- **Auth:** Customer Bearer Token
- **Purpose:** Customer cancels order before `kitchen_start_at`.
- **Responses:**
  - `200 OK`: Order voided (`CUSTOMER_CANCEL`); slot released; if claim was confirmed, `refund_owed` set to `true`.
  - `409 CANCEL_WINDOW_CLOSED`: Order has reached `kitchen_start_at` or later.

### 1.12 `GET /api/v1/orders/:order_id` & `GET /api/v1/orders?open=true`
- **Auth:** Customer Bearer Token
- **Purpose:** View own orders and customer-safe status timeline (1. Awaiting payment confirmation, 2. Confirmed/scheduled, 3. Being prepared, 4. Ready for pickup, 5. Collected, or Cancelled/expired with neutral wording).

---

## 2. Staff Routes (v1 Remote Ordering Dashboard)

All staff routes require a Staff JWT token with role `operator` or `admin`.

### 2.1 `POST /api/v1/staff/login`
- **Role:** Any (`operator` or `admin`)
- **Purpose:** Authenticates staff member with venue slug, display name, and PIN.
- **Request:** `{ "tenant_slug": "brewery-cafe-gulberg", "display_name": "Cashier Station", "pin": "1234" }`
- **Responses:**
  - `200 OK`: Returns `{ "token": "jwt-token", "role": "operator", "display_name": "Cashier Station" }`.
  - `401 INVALID_PIN`: 5 failed attempts locks the account for 5 minutes.

### 2.2 `GET /api/v1/staff/orders/active`
- **Role:** `operator`, `admin`
- **Purpose:** Fetches orders divided into the five unified dashboard lanes:
  - `payments_to_confirm`: `PENDING_PAYMENT` orders with submitted payment claims.
  - `scheduled`: Confirmed orders waiting for `kitchen_start_at`.
  - `preparing`: Orders currently being prepared (`PREPARING`).
  - `ready`: Orders ready for customer counter pickup (`READY`).
  - `refunds_owed`: Cancelled/voided orders where payment was confirmed (`refund_owed = true`).

### 2.3 `POST /api/v1/staff/payment-claims/:claim_id/confirm`
- **Role:** `operator`, `admin`
- **Purpose:** Confirms payment claim. Transitions order from `PENDING_PAYMENT` to `SCHEDULED` (or immediately to `PREPARING` marked late if past `kitchen_start_at`).
- **Request:** `{ "expected_version": 1 }`
- **Responses:**
  - `200 OK`: Claim `CONFIRMED`, order `SCHEDULED`, customer notified via WebSocket and email.
  - `409 CONCURRENT_MODIFICATION`: Another staff member modified this ticket.

### 2.4 `POST /api/v1/staff/payment-claims/:claim_id/reject`
- **Role:** `operator`, `admin`
- **Purpose:** Rejects payment claim.
- **Request:** `{ "reason": "NOT_FOUND" | "WRONG_AMOUNT", "expected_version": 1 }`
- **Notes:**
  - `WRONG_AMOUNT`: No strike; student can submit a new claim before the cutoff.
  - `NOT_FOUND`: Triggers strike only after the 5-minute undo window closes. A second `NOT_FOUND` on the same order voids it (`PAYMENT_REJECTED`).

### 2.5 `POST /api/v1/staff/orders/:order_id/undo`
- **Role:** `operator`, `admin`
- **Purpose:** Undoes the last confirm (moves order back from `SCHEDULED` to `PENDING_PAYMENT`) or last reject (moves claim back to `SUBMITTED`).
- **Condition:** Must be invoked within the undo window (default 5 minutes, venue-configurable 5–10 min).
- **Responses:**
  - `200 OK`: Action reverted; pending strikes cancelled; audit event `PAYMENT_ACTION_UNDONE`.
  - `409 UNDO_WINDOW_CLOSED`: Undo window has elapsed.

### 2.6 `POST /api/v1/staff/orders/:order_id/ready`
- **Role:** `operator`, `admin`
- **Purpose:** Bumps order from `PREPARING` to `READY`. Customer alerted for pickup.

### 2.7 `POST /api/v1/staff/orders/:order_id/served`
- **Role:** `operator`, `admin`
- **Purpose:** Marks order handed over to customer. Moves to terminal state `SERVED`.

### 2.8 `POST /api/v1/staff/orders/:order_id/refund-done`
- **Role:** `operator`, `admin`
- **Purpose:** Marks manual bank/wallet refund completed for an order in `refunds_owed`. Sets `refund_owed = false`, `refund_done_at = NOW()`, appends `REFUND_MARKED_DONE`.

### 2.9 `POST /api/v1/staff/remote-orders/pause`
- **Role:** `operator`, `admin`
- **Purpose:** Pauses or unpauses remote order intake.
- **Request:** `{ "paused": true }`

### 2.10 `POST /api/v1/admin/orders/:order_id/void`
- **Role:** `admin` (restricted from operator)
- **Purpose:** Administrative void of an order post-verification. If claim was confirmed, sets `refund_owed = true`.
- **Request:** `{ "reason": "Kitchen equipment failure", "expected_version": 3 }`

---

## 3. Admin Routes (Admin Only)

All routes require staff JWT with `role: 'admin'`.

### 3.1 `GET /api/v1/admin/venue-settings` & `PATCH /api/v1/admin/venue-settings`
- **Purpose:** Read and update venue settings: `remote_open_time`, `remote_close_time`, `prep_lead_minutes`, `slot_minutes`, `slot_capacity`, `claim_deadline_minutes`, `noshow_hold_minutes`, `undo_window_minutes`, `price_note`.

### 3.2 Menu Management (Categories, Items, Modifiers)
- `POST /api/v1/admin/categories`, `PATCH /api/v1/admin/categories/:id`, `DELETE /api/v1/admin/categories/:id`
- `POST /api/v1/admin/menu-items`, `PATCH /api/v1/admin/menu-items/:id`, `DELETE /api/v1/admin/menu-items/:id`
- `POST /api/v1/admin/modifiers`, `PATCH /api/v1/admin/modifiers/:id`, `DELETE /api/v1/admin/modifiers/:id`
- **Rule:** Every category, menu item, or modifier change automatically increments `venue_settings.menu_version`.

### 3.3 `POST /api/v1/admin/menu/86`
- **Purpose:** Instantly toggles out-of-stock state for a menu item.
- **Request:** `{ "menu_item_id": "uuid", "is_86ed": true }`
- **Broadcast:** Triggers `MENU_ITEM_86ED` on WebSocket.

### 3.4 Payment Methods Management
- `GET /api/v1/admin/payment-methods`
- `POST /api/v1/admin/payment-methods`
- `PATCH /api/v1/admin/payment-methods/:id`
- `DELETE /api/v1/admin/payment-methods/:id`

### 3.5 Staff Accounts Management
- `GET /api/v1/admin/staff-accounts`
- `POST /api/v1/admin/staff-accounts`: Create operator or admin PIN account.
- `PATCH /api/v1/admin/staff-accounts/:id`: Reset PIN, change role, or toggle `is_active`.

### 3.6 Customer Standing & Blocking
- `GET /api/v1/admin/customers/blocked`: Returns list of blocked customers.
- `POST /api/v1/admin/customers/:customer_ref/block`: Manually block a customer.
- `POST /api/v1/admin/customers/:customer_ref/unblock`: Manually unblock a customer.

### 3.7 `GET /api/v1/admin/audit-log/:order_id`
- **Purpose:** Returns the chronological, immutable dispute trail for an order from `order_lifecycle_events`.

---

## 4. WebSocket Real-Time Events

WebSocket connection on `/ws` with channel authentication and isolation.

### 4.1 Channels & Scope
- **Customer Channel:** Bound to customer's own connection; receives events only for orders matching customer's profile token.
- **Staff Channel:** Bound to venue (`tenant_id`); single live connection per screen.

### 4.2 Events Matrix
| Event Name | Direction | Channel | Trigger / Purpose |
|---|---|---|---|
| `ORDER_STATE_CHANGED` | Server → Client | Customer & Staff | Order transitions state (`PENDING_PAYMENT`, `SCHEDULED`, `PREPARING`, `READY`, `SERVED`, `VOIDED`) |
| `PAYMENT_CLAIM_SUBMITTED` | Server → Client | Staff | New payment claim submitted; triggers sound alert and dashboard counter |
| `ORDER_STALE` | Server → Client | Staff | Alert when ticket in hold exceeds threshold (v3) |
| `MENU_ITEM_86ED` | Server → Client | Staff & Customer | Item marked out of stock |
| `REMOTE_ORDERS_PAUSED` | Server → Client | Staff & Customer | Remote ordering paused or resumed by staff |

---

## 5. Abuse Controls & Rate Limiting (Brief v6 §3.5)

| Endpoint / Action | Rule & Limit (Delegated: Owner May Override) | Violation Action |
|---|---|---|
| `/auth/email-code` | Max 3 requests per email per 15 minutes; max 10 requests per IP per hour | `429 RATE_LIMITED` |
| `/auth/register` & `/auth/login` | Cloudflare Turnstile bot check (`bot_token`) | `400 BOT_CHALLENGE_FAILED` |
| `/auth/login` | Max 5 failed password attempts per 15 minutes | Account locked for 15 min; `401 INVALID_CREDENTIALS` |
| `/auth/verify-email` | Max 5 wrong attempts per code | Code invalidated; `400 CODE_EXPIRED` |
| Order Creation | Max 5 submissions per customer per 10 minutes | `429 RATE_LIMITED` |
| Open Orders | Max 2 open orders in `PENDING_PAYMENT` per customer | `429 TOO_MANY_OPEN_ORDERS` |
| Payment Claims | Transaction ID uniqueness (`payment_claims_txn_uq`) | `409 DUPLICATE_TRANSACTION` |
| Strike Accumulation | Strike issued ONLY on `NOT_FOUND` rejection surviving 5-min undo window | 3 strikes in 30 days blocks customer at that venue |

*(In-process rate limiting is sufficient for v1).*

---

## 6. Post-v1 Table Service Endpoints (Deferred)

The following endpoints remain specified for post-v1 table service (TABLE_SERVICE venue mode):
- `GET /api/v1/menu/:zone_slug/:table_number`: In-venue table QR menu fetch.
- `POST /api/v1/kds/tickets/:order_id/verify`: Table order verification by cook & runner.
- `POST /api/v1/kds/tickets/:order_id/trash`: Discards unverified fake in-venue order.
- `GET /api/v1/staff/tables`: Running table sessions with active totals.
- `POST /api/v1/staff/tables/:table_id/settle`: Table session settlement.

---

## 7. Supersessions & Conflict Resolutions (Brief v6 §8)

| Earlier Reference | Brief v6 Status |
|---|---|
| v3 §2.3 / v4 §5.2: `EXPIRED_UNPAID` voids at kitchen start; strike on expiry | Replaced by `EXPIRED_NO_CLAIM` and `EXPIRED_UNREVIEWED`. Unreviewed claims expire at `pickup_at`, NOT `kitchen_start_at`; late confirmation starts order immediately. Students never struck due to slow staff. |
| v4 §5.2 strike triggers | Strikes originate ONLY from a `NOT_FOUND` rejection that survives the undo window. |
| v5 §2.1 "last-order time" | `remote_open_time` and `remote_close_time`. Last order time follows dynamically from `slot_start >= now + prep_lead_minutes + 10 min`. |
| v3/v5 undo for "trashed ticket" | In v1 undo covers confirm and reject; there is no kitchen TRASH. TRASH is a post-v1 table-service action. |
| v3 §3.3 refund note | Specified in §2.2/§2.8 (`refunds_owed` lane, `POST /staff/orders/:order_id/refund-done`). |