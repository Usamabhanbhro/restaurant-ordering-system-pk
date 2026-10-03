# API.md — REST Endpoints & WebSocket Events

All REST endpoints use standard JSON payloads and are prefixed with `/api/v1`. Authentication is handled via Bearer JWT tokens for staff, and signed stateless session tokens for diners.

---

## 1. Customer PWA Endpoints

### 1.1 `GET /api/v1/menu/:zone_slug/:table_number`
Fetches the active digital menu for a specific table.

- **Response:**
```json
{
  "success": true,
  "data": {
    "venue_name": "Brewery Cafe Gulberg",
    "zone": "Rooftop Patio",
    "table_number": "04",
    "session_id": "8f2c-...",
    "categories": [
      {
        "id": "cat-uuid",
        "name": "Burgers",
        "items": [
          {
            "id": "item-uuid",
            "name": "Double Smash Burger",
            "description": "Two beef patties with secret sauce",
            "price": 650.00,
            "is_86ed": false,
            "modifiers": [
              { "id": "mod-1", "name": "Extra Cheese", "price_delta": 100.00, "type": "ADD_ON" },
              { "id": "mod-2", "name": "No Onion", "price_delta": 0.00, "type": "EXCLUSION" }
            ]
          }
        ]
      }
    ]
  }
}
```

### 1.2 `POST /api/v1/orders`
Submits an order round for the current session.

- **Headers:** `X-Session-Token: <token>`
- **Request Body:**
```json
{
  "session_id": "8f2c-...",
  "items": [
    {
      "menu_item_id": "item-uuid",
      "quantity": 1,
      "selected_modifiers": ["mod-1", "mod-2"],
      "free_text_note": "Cut in half please"
    }
  ]
}
```
- **Responses:**
  - `201 Created`: Order queued to HOLD.
  - `429 Too Many Requests`: Velocity gate triggered; requires WhatsApp verification.

---

## 2. Kitchen Display System (KDS) Endpoints

### 2.1 `GET /api/v1/kds/tickets`
Fetches active and unverified tickets for the KDS tablet.

### 2.2 `POST /api/v1/kds/tickets/:order_id/verify`
Moves an order from `PENDING_VERIFICATION` to `PREPARING`.

### 2.3 `POST /api/v1/kds/tickets/:order_id/bump`
Marks an active ticket as `READY` (Counter Pickup) or `SERVED` (Table Service).

### 2.4 `POST /api/v1/kds/tickets/:order_id/trash`
Discards a fake/empty ticket, cancels the order, and flags the session.

---

## 3. Cashier Terminal Endpoints

### 3.1 `GET /api/v1/cashier/tables`
Returns a list of all active tables with their consolidated running totals and order histories.

### 3.2 `POST /api/v1/cashier/tables/:table_id/settle`
Marks a table session as settled and resets the table state to available.

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

---

## 5. WebSocket Real-Time Events

WebSockets run on `/ws` with channel subscriptions per tenant and role.

### 5.1 Server-to-Client Events

- `ORDER_HOLD_CREATED`: Broadcast to KDS when a new order arrives.
- `ORDER_STATE_CHANGED`: Broadcast to Customer PWA and Cashier terminal when an order state updates.
- `MENU_ITEM_86ED`: Broadcast to all active customer sessions to immediately gray out sold-out items.
- `TABLE_SETTLED`: Broadcast to the diner PWA when their session has been closed out.

### 5.2 Client-to-Server Events

- `PING`: Standard heartbeat keep-alive.
