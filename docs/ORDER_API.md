# Order API Documentation

## Endpoints

### Public Endpoints

#### 1. Create Order
```
POST /api/orders
```

Create a new order from a table.

**Request Body:**
```json
{
  "tableNumber": "5",
  "paymentMethod": "NONE",
  "items": [
    {
      "menuId": 1,
      "qty": 2
    },
    {
      "menuId": 3,
      "qty": 1
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Order created successfully",
  "data": {
    "id": 1,
    "tableNumber": "5",
    "paymentMethod": "NONE",
    "paymentStatus": "UNPAID",
    "orderStatus": "PENDING",
    "total": 50000,
    "items": [
      {
        "id": 1,
        "menuId": 1,
        "qty": 2,
        "subtotal": 36000,
        "menu": {
          "id": 1,
          "name": "Nasi Goreng Ayam",
          "price": 18000,
          "category": {
            "id": 1,
            "name": "Nasi Goreng"
          }
        }
      }
    ],
    "createdAt": "2025-12-05T...",
    "updatedAt": "2025-12-05T..."
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "tableNumber": "5",
    "items": [
      {"menuId": 1, "qty": 2},
      {"menuId": 15, "qty": 2}
    ]
  }'
```

#### 2. Get Order by ID
```
GET /api/orders/:id
```

Get order details by order ID.

**Example:**
```bash
curl http://localhost:3000/api/orders/1
```

#### 3. Get Orders by Table
```
GET /api/orders/table/:tableNumber
```

Get all orders for a specific table.

**Example:**
```bash
curl http://localhost:3000/api/orders/table/5
```

#### 4. Cancel Order
```
POST /api/orders/:id/cancel
```

Cancel an order (only if not paid or done).

**Example:**
```bash
curl -X POST http://localhost:3000/api/orders/1/cancel
```

### Protected Endpoints (Admin/Kasir)

#### 5. List All Orders
```
GET /api/orders
```

**Auth Required:** Admin or Kasir

**Query Parameters:**
- `status` (optional): Filter by order status (PENDING, PAID, PROCESSING, READY, DONE, CANCELLED)
- `paymentStatus` (optional): Filter by payment status (UNPAID, PENDING, PAID, FAILED, CANCELLED)
- `limit` (optional): Number of records (default: 50)
- `offset` (optional): Offset for pagination (default: 0)

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/orders?status=PENDING&limit=20"
```

#### 6. Update Order Status
```
PATCH /api/orders/:id/status
```

**Auth Required:** Admin or Kasir

**Request Body:**
```json
{
  "orderStatus": "PROCESSING"
}
```

**Valid statuses:** PENDING, PAID, PROCESSING, READY, DONE, CANCELLED

**Example:**
```bash
curl -X PATCH http://localhost:3000/api/orders/1/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderStatus": "PROCESSING"}'
```

#### 7. Update Payment Status
```
PATCH /api/orders/:id/payment
```

**Auth Required:** Admin or Kasir

**Request Body:**
```json
{
  "paymentStatus": "PAID",
  "paymentMethod": "CASH"
}
```

**Valid payment statuses:** UNPAID, PENDING, PAID, FAILED, CANCELLED
**Valid payment methods:** QRIS, CASH, NONE

**Example:**
```bash
curl -X PATCH http://localhost:3000/api/orders/1/payment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paymentStatus": "PAID", "paymentMethod": "CASH"}'
```

#### 8. Get Order Statistics
```
GET /api/orders/stats/summary
```

**Auth Required:** Admin only

Get order statistics including total orders, orders by status, and today's revenue.

**Response:**
```json
{
  "status": "success",
  "message": "Statistics retrieved successfully",
  "data": {
    "totalOrders": 45,
    "ordersByStatus": {
      "pending": 5,
      "processing": 3,
      "ready": 2,
      "done": 35
    },
    "unpaidOrders": 8,
    "todayRevenue": 1250000
  }
}
```

## Order Flow

### Customer Flow:
1. Customer scans QR code → opens menu with table number
2. Customer selects items → creates order (POST /api/orders)
3. Order created with status: `PENDING`, payment: `UNPAID`
4. Customer can view order (GET /api/orders/:id)
5. Customer can cancel before payment (POST /api/orders/:id/cancel)

### Kitchen/Cashier Flow:
1. Kasir sees new orders (GET /api/orders?status=PENDING)
2. Customer pays → Kasir updates payment (PATCH /api/orders/:id/payment)
3. Order status auto-changes to `PAID`
4. Kitchen updates status to `PROCESSING` → `READY` → `DONE`

## Order Status Flow

```
PENDING → PAID → PROCESSING → READY → DONE
   ↓
CANCELLED
```

## Payment Status Flow

```
UNPAID → PENDING → PAID
   ↓        ↓
FAILED  CANCELLED
```

## Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Items array is required and must not be empty",
  "details": null
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Order not found",
  "details": null
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Unauthenticated",
  "details": null
}
```

## Business Rules

1. **Creating Order:**
   - Must have at least one item
   - All menu items must be available
   - Total is calculated automatically

2. **Canceling Order:**
   - Cannot cancel paid orders
   - Cannot cancel completed orders
   - Auto-updates both orderStatus and paymentStatus to CANCELLED

3. **Payment Update:**
   - When payment status becomes PAID, order status auto-updates to PAID
   - Creates payment log automatically

4. **Order Status:**
   - Only Admin/Kasir can update order status
   - Status progression: PENDING → PAID → PROCESSING → READY → DONE

## Integration Example

### Complete order flow:
```javascript
// 1. Create order
const order = await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tableNumber: '5',
    items: [
      { menuId: 1, qty: 2 },
      { menuId: 15, qty: 1 }
    ]
  })
});

const { data } = await order.json();
console.log('Order ID:', data.id);
console.log('Total:', data.total);

// 2. Customer checks order
const orderDetail = await fetch(`/api/orders/${data.id}`);

// 3. Kasir marks as paid
await fetch(`/api/orders/${data.id}/payment`, {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    paymentStatus: 'PAID',
    paymentMethod: 'CASH'
  })
});

// 4. Kitchen updates status
await fetch(`/api/orders/${data.id}/status`, {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ orderStatus: 'PROCESSING' })
});
```
