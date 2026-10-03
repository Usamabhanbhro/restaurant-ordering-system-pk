# API.md — REST Endpoints & WebSocket Events

All endpoints use standard JSON payloads prefixed with `/api/v1`. Authentication is handled via Bearer JWT tokens for staff and signed stateless session tokens for diners.

---

## 1. Customer PWA Endpoints

### 1.1 `GET /api/v1/menu/:zone_slug/:table_number`
Fetches the active menu for a specific table. Served primarily from Redis cache (`cache:menu:{tenant_id}`).

**Response:**
```json
{
  "success": true,
  "data": {
    "venue_name": "Brewery Cafe Gulberg",
    "session_id": "8f2c-...",
    "table_number": "04",
    "categories": [
      {
        "id": "cat-uuid",
        "name": "Burgers",
        "items": [
          {
            "id": "item-uuid",
            "name_en": "Double Smash Burger",
            "name_roman_urdu": "Double Smash Burger",
            "price": 650.00,
            "is_86ed": false,
            "modifiers": [
              {
                "id": "mod-1",
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

### 1.2 `POST /api/v1/orders`
Submits an order. Uses optimistic locking. Concurrent modifications result in `409 Conflict` with current state details.

**Headers:** `X-Session-Token: <token>`

**Request:**
```json
{
  "session_id": "8f2c...",
  "items": [
    {
      "menu_item_id": "item-uuid",
      "quantity": 1,
      "selected_modifiers": ["mod-1"],
      "free_text_note": "cut in half please"
    }
  ]
}
```

**Responses:**
- `201 Created`: Order queued to `PENDING_VERIFICATION` in the HOLD queue.
- `409 Conflict`: Another terminal updated this order:
```json
{
  "code": "CONCURRENT_MODIFICATION",
  "current_version": 4,
  "current_status": "SERVED",
  "message": "Order was updated by another station."
}
```

### 1.3 `GET /api/v1/orders/:order_id`
Fetches order transaction history and audit events.

---

## 2. Kitchen Display System (KDS) Endpoints

### 2.1 `GET /api/v1/kds/tickets/:order_id/verify`
Verifies and moves an order from HOLD to ACTIVE. Requires optimistic lock matching expected `version`.

**Request:**
```json
{
  "expected_version": 3
}
```

**Responses:**
- `200 OK`: Order moved to `ACTIVE_COOKING`.
- `409 Conflict`: Another station updated the order.

### 2.2 `GET /api/v1/kds/tickets/active`
Fetches all active orders for the tenant. Uses optimistic locking checks.

**Response:**
```json
{
  "success": true,
  "data": {
    "hold": [
      {
        "id": "order-uuid",
        "table_number": "04",
        "status": "PENDING_VERIFICATION",
        "version": 1
      }
    ],
    "cooking": [
      {
        "id": "order-uuid",
        "table_number": "04",
        "status": "PREPARING",
        "version": 3
      }
    ]
  }
}
```

### 2.3 `POST /api/v1/kds/tickets/:order_id/bump`
Marks an order ready/served. Conditional update (`WHERE version = expected_version AND status IN ('PREPARING')`).

### 2.4 `POST /api/v1/kds/tickets/:order_id/trash`
Discards an unverified/fake order, updates status to `VOIDED`, and increments audit event.

---

## 3. Cashier Terminal Endpoints

### 3.1 `GET /api/v1/cashier/tables`
Returns all (active + settled) tables with running totals. Uses optimistic locking checks.

**Response:** Consolidated tab view with time-stamped order rounds.

### 3.2 `POST /api/v1/cashier/tables/:table_id/settle`
Marks table session as settled. Updates order status to `SETTLED`.

---

## 4. Manager / Admin Endpoints

### 4.1 `POST /api/v1/admin/menu/86`
Toggles out-of-stock state for an item.
```json
{
  "menu_item_id": "item-uuid",
  "is_86ed": true
}
```

### 4.2 `GET /api/v1/admin/audit-log/:order_id`
Returns the immutable dispute timeline for a specific order.

### 4.3 `POST /api/v1/admin/orders/:order_id/sync`
Force syncs an order from hold queue to active if KDS sync is stale.

---

## 5. WebSocket Real-Time Events

WebSocket connection on `/ws` with tenant-scoped authentication and channel isolation.

### 5.1 Server-to-Client Events

- `ORDER_HOLD_CREATED`: Broadcast to KDS when a new order arrives in hold column.
- `ORDER_STATE_CHANGED`: Broadcasts state updates with version and actor info.
- `MENU_ITEM_86ED`: Broadcasts to all active diners when sold out item discovered.
- `TABLE_SETTLED`: Broadcasts session closure to diners.
- `ERROR_SEVERITY`: Critical system alerts.

### 5.2 Client-to-Server Events

- `PING`: Heartbeat.
- `RESYNC`: Signals delta replay request with last_seq_id.
- `MARK_FINISHED`: Terminal-specific completion signals.

---

## 6. Verdicts Summary (Technical Grilling Rounds)

**Round 1:**
- **Q1:** Redis caching bypass for public menus; strict RLS for sensitive state.
- **Q2:** Redis Streams with monotonic sequence IDs for role-sync guarantees.
- **Q3:** Schema-constrained JSONB for modifiers using Zod validation.
- **Q4:** Whitelist regex `^[a-zA-Z0-9\s.,!?-]{0,40}$` for SMS injection protection.

**Round 2:**
- **Q1:** Optimistic locking with version column; 409 Conflict handling.
- **Q2:** Atomic `FOR SHARE` check on 86 items; 422 Unprocessable Entity with unavailable_items array.
- **Q3:** Circuit breaker with 60s cooldown; fallback to 86 badge on Kakao/Twilio failure.
- **Q4:** Multi-layer WebSocket isolation: JWT handshake binding + tenant-namespaced Redis channels + runtime tenant validation.

---