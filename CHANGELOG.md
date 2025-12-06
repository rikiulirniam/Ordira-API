# Changelog - v2.0.0

## 🎉 Major Features Added (December 2025)

### 1. 💳 Midtrans Payment Gateway Integration

**Files Created:**
- `src/services/midtransService.js` - Midtrans API integration
- `src/controllers/paymentController.js` - Payment endpoints
- `src/routes/paymentRoutes.js` - Payment routes

**Features:**
- ✅ Snap API integration (sandbox mode)
- ✅ Create payment transaction
- ✅ Webhook notification handler
- ✅ Payment status tracking
- ✅ Multiple payment methods support (GoPay, QRIS, Credit Card, Bank Transfer, etc)

**Endpoints:**
- `POST /api/payment/create` - Create payment transaction
- `POST /api/payment/notification` - Webhook for Midtrans notifications
- `GET /api/payment/status/:orderId` - Check payment status

---

### 2. 📧 Automated Email Receipts

**Files Created:**
- `src/services/emailService.js` - Email sending service with HTML templates

**Features:**
- ✅ Automated receipt sending after successful payment
- ✅ HTML formatted emails with styling
- ✅ Complete order details in email
- ✅ Item notes included in receipt
- ✅ SMTP configuration support (Gmail, Mailgun, SendGrid, etc)

**Receipt Includes:**
- Order ID and table number
- Payment method and status
- Order items with quantities
- Custom notes per item
- Grand total

---

### 3. 📝 Order Item Notes

**Schema Changes:**
```prisma
model OrderItem {
  id      Int     @id @default(autoincrement())
  orderId Int
  menuId  Int
  qty     Int
  price   Decimal @db.Decimal(10, 2)
  note    String? // ← NEW: Custom note per item
  
  order   Order   @relation(...)
  menu    Menu    @relation(...)
}
```

**Features:**
- ✅ Add custom notes to each order item
- ✅ Customer can specify preferences (e.g., "Pedas sedang", "Tanpa bawang")
- ✅ Notes included in email receipt
- ✅ Visible to kitchen/kasir

**Usage:**
```json
{
  "tableNumber": "5",
  "items": [
    {
      "menuId": 1,
      "qty": 2,
      "note": "Pedas sedang, tanpa bawang"
    }
  ]
}
```

---

### 4. 📧 Customer Email in Orders

**Schema Changes:**
```prisma
model Order {
  id            Int           @id @default(autoincrement())
  tableNumber   String?
  customerEmail String?       // ← NEW: For sending receipts
  paymentStatus PaymentStatus @default(UNPAID)
  paymentMethod PaymentMethod @default(NONE)
  total         Decimal       @db.Decimal(10, 2)
  // ...
}
```

**Features:**
- ✅ Store customer email with order
- ✅ Used for sending payment receipts
- ✅ Optional field (can be null)

---

### 5. 🔄 Simplified Payment Status

**Before:**
```prisma
enum PaymentStatus {
  UNPAID
  PENDING
  PAID
  FAILED
  CANCELLED
}
```

**After:**
```prisma
enum PaymentStatus {
  UNPAID    // Order belum dibayar
  PAID      // Pembayaran berhasil
  CANCELLED // Order/pembayaran dibatalkan
}
```

**Migration:** `20251206081430_add_note_email_and_update_payment_status`

**Rationale:**
- Simplified flow
- PENDING and FAILED combined into existing statuses
- Clearer for end users

---

### 6. 📋 Kasir Menu Availability Management

**Files Created:**
- `src/controllers/kasirController.js` - Kasir-specific features
- `src/routes/kasirRoutes.js` - Kasir routes

**Features:**
- ✅ Kasir can mark menu as available/unavailable
- ✅ Real-time availability control
- ✅ Menu remains visible but shows as "Habis" when unavailable
- ✅ Prevents orders for unavailable items

**Endpoint:**
- `PATCH /api/kasir/menus/:id/availability` - Toggle menu availability

**Use Case:**
- Menu habis → Set `isAvailable: false`
- Restock → Set `isAvailable: true`

---

## 🔧 Bug Fixes

### Fixed in orderService.js:
- ❌ Removed duplicate `updateOrderStatus` function
- ❌ Fixed incomplete `updatePaymentStatus` function
- ❌ Fixed broken `cancelOrder` function
- ❌ Removed extra closing brackets

### Fixed in orderController.js:
- ❌ Removed duplicate `getOrderStats` function
- ❌ Fixed duplicate export statements

---

## 📦 Dependencies Added

```json
{
  "midtrans-client": "^1.3.1",
  "nodemailer": "^6.9.x"
}
```

---

## 🗄️ Database Migrations

### Migration: `20251206081430_add_note_email_and_update_payment_status`

**Changes:**
1. Added `note` field to `OrderItem` (String, optional)
2. Added `customerEmail` field to `Order` (String, optional)
3. Removed `PENDING` and `FAILED` from `PaymentStatus` enum
4. Updated existing enum to only have: `UNPAID`, `PAID`, `CANCELLED`

**Migration SQL:**
```sql
-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN "note" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "customerEmail" TEXT;

-- AlterEnum
ALTER TYPE "PaymentStatus" DROP VALUE 'PENDING';
ALTER TYPE "PaymentStatus" DROP VALUE 'FAILED';
```

---

## 📚 Documentation Added

**New Documentation Files:**
- `docs/PAYMENT_API.md` - Complete payment system documentation
- `docs/KASIR_API.md` - Kasir features documentation
- `QUICK_SETUP.md` - Quick setup guide for testing

**Updated Documentation:**
- `README.md` - Added payment features and updated tech stack
- `.env.example` - Added Midtrans and SMTP configuration

---

## 🧪 Testing

**Postman Collection Updated:**
- `__tests__/postman/Ordira_Complete.postman.json`
- Added payment endpoints
- Added kasir endpoints
- Total: 30 endpoints organized in 8 folders

**Test Coverage:**
- ✅ Order creation with notes
- ✅ Payment transaction creation
- ✅ Payment notification webhook
- ✅ Email sending
- ✅ Kasir menu availability toggle

---

## ⚙️ Configuration Changes

### New Environment Variables:

```env
# Application URL
APP_URL=http://localhost:3000

# Midtrans Configuration
MIDTRANS_SERVER_KEY=SB-Mid-server-xxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxx

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## 🔐 Security Updates

- ✅ Midtrans signature validation for webhooks
- ✅ Server Key kept server-side only
- ✅ Email credentials in environment variables
- ✅ Payment notification endpoint secured with signature check

---

## 🚀 Performance Improvements

- ✅ Async email sending (doesn't block payment processing)
- ✅ Efficient database queries with Prisma includes
- ✅ Single transaction for payment updates

---

## 📊 API Changes Summary

### New Endpoints:
- `POST /api/payment/create`
- `POST /api/payment/notification`
- `GET /api/payment/status/:orderId`
- `PATCH /api/kasir/menus/:id/availability`

### Modified Endpoints:
- `POST /api/orders` - Now accepts `customerEmail` and `note` per item

### Response Format Changes:
- Order response now includes `customerEmail`
- OrderItem response now includes `note`

---

## 🔄 Breaking Changes

### PaymentStatus Enum:
**Before:** 5 values (UNPAID, PENDING, PAID, FAILED, CANCELLED)  
**After:** 3 values (UNPAID, PAID, CANCELLED)

**Impact:**
- Existing orders with PENDING or FAILED status need manual review
- Frontend should update status handling
- No automatic migration of existing data

**Migration Strategy:**
- PENDING → UNPAID
- FAILED → CANCELLED

---

## 📈 Statistics

**Files Added:** 7
- midtransService.js
- emailService.js
- paymentController.js
- kasirController.js
- paymentRoutes.js
- kasirRoutes.js
- Ordira_Complete.postman.json

**Files Modified:** 5
- schema.prisma
- orderService.js
- orderController.js
- routes/index.js
- .env.example

**Documentation:** 3 new, 1 updated
- PAYMENT_API.md (new)
- KASIR_API.md (new)
- QUICK_SETUP.md (new)
- README.md (updated)

**API Endpoints:** +4 new endpoints

---

## 🎯 Next Steps / Roadmap

### Recommended for Production:

1. **Security:**
   - [ ] Add rate limiting to payment endpoints
   - [ ] Implement CSRF protection
   - [ ] Add request logging for payments

2. **Features:**
   - [ ] Payment retry mechanism
   - [ ] Refund support
   - [ ] Payment analytics dashboard
   - [ ] Email queue with retry

3. **Monitoring:**
   - [ ] Payment failure alerts
   - [ ] Email delivery tracking
   - [ ] Transaction monitoring dashboard

4. **Testing:**
   - [ ] Unit tests for payment service
   - [ ] Integration tests for payment flow
   - [ ] Email sending tests

---

## 🐛 Known Issues

- Webhook notification requires HTTPS (use ngrok for localhost testing)
- Gmail SMTP may have rate limits (consider dedicated email service for production)
- Midtrans sandbox has test limitations (not all payment methods work exactly like production)

---

## 👥 Contributors

- Riki - Full stack implementation

---

## 📅 Release Date

December 6, 2025

---

## 🔖 Version

**v2.0.0** - Major release with payment gateway integration

**Previous:** v1.0.0 - Basic order management system

---

## 📞 Support

For issues or questions:
- Check `QUICK_SETUP.md` for setup help
- Check `docs/PAYMENT_API.md` for payment documentation
- Check `docs/KASIR_API.md` for kasir features

---

**Full Changelog:** v1.0.0 → v2.0.0
