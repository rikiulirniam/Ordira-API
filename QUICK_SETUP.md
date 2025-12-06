# Quick Setup & Testing Guide - Payment System

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

Dependencies installed:
- `midtrans-client` - Midtrans payment gateway
- `nodemailer` - Email service

---

### Step 2: Configure Environment

Copy dan edit `.env`:

```bash
cp .env.example .env
```

**Minimal Configuration:**

```env
# Required untuk basic functionality
DATABASE_URL="postgresql://postgres:password@localhost:5432/db_ordira?schema=public"
JWT_SECRET="your-secret-key"
PORT=3000

# Required untuk payment features
APP_URL="http://localhost:3000"
MIDTRANS_SERVER_KEY="SB-Mid-server-xxx"
MIDTRANS_CLIENT_KEY="SB-Mid-client-xxx"

# Required untuk email receipts
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="youremail@gmail.com"
SMTP_PASSWORD="your-app-password"
```

---

### Step 3: Setup Midtrans (5 minutes)

1. **Register Sandbox Account**
   - Visit: https://dashboard.sandbox.midtrans.com/register
   - Verify email
   - Login

2. **Get API Keys**
   - Go to: Settings → Access Keys
   - Copy `Server Key` dan `Client Key`
   - Paste ke `.env`

3. **Setup Notification URL (Optional untuk testing)**
   - Settings → Configuration
   - Payment Notification URL: `https://your-domain.com/api/payment/notification`
   - Skip untuk testing lokal, nanti bisa pake ngrok

---

### Step 4: Setup Gmail SMTP (3 minutes)

1. **Enable 2FA**
   - Google Account → Security → 2-Step Verification
   - Enable

2. **Create App Password**
   - Google Account → Security → App passwords
   - Select "Mail" and generate
   - Copy password to `.env` sebagai `SMTP_PASSWORD`

**Alternative (Faster):** Gunakan Mailtrap untuk testing
```env
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=2525
SMTP_USER="your-mailtrap-user"
SMTP_PASSWORD="your-mailtrap-pass"
```

---

### Step 5: Database Migration

```bash
# Generate Prisma Client
npx prisma generate

# Run migration
npx prisma migrate dev

# Seed database (optional)
npm run seed
```

---

### Step 6: Start Server

```bash
npm run dev
```

Server running di: `http://localhost:3000`

---

## 🧪 Testing Payment Flow

### Complete Test Scenario:

#### 1. Login as Kasir

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "kasir",
    "password": "kasir123"
  }'
```

**Save the token!**

---

#### 2. Create Order with Note

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "tableNumber": "5",
    "items": [
      {
        "menuId": 1,
        "qty": 2,
        "note": "Pedas sedang, tanpa bawang"
      },
      {
        "menuId": 2,
        "qty": 1,
        "note": "Es lebih banyak"
      }
    ],
    "customerEmail": "customer@example.com"
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "tableNumber": "5",
    "paymentStatus": "UNPAID",
    "total": 44000,
    "items": [...]
  }
}
```

**Save the orderId!**

---

#### 3. Create Payment Transaction

```bash
curl -X POST http://localhost:3000/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "customerEmail": "customer@example.com"
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "token": "abc123-def456",
    "redirectUrl": "https://app.sandbox.midtrans.com/snap/v2/vtweb/abc123"
  }
}
```

---

#### 4. Open Payment Page

Copy `redirectUrl` dan buka di browser:

```
https://app.sandbox.midtrans.com/snap/v2/vtweb/abc123
```

**Choose Payment Method:**
- GoPay (instant success)
- QRIS (scan code)
- Credit Card: `4811 1111 1111 1114`, CVV: `123`, Exp: any future date

---

#### 5. Complete Payment

Di Midtrans page:
1. Select payment method
2. Complete payment
3. Success page akan muncul

**Backend akan otomatis:**
- Update order status → PAID
- Create PaymentLog
- Send email receipt

---

#### 6. Check Email

Buka inbox email customer:
- Subject: "Payment Receipt - Order #1"
- HTML formatted receipt
- Includes order details dengan notes
- Total payment

---

#### 7. Verify Payment Status

```bash
curl http://localhost:3000/api/payment/status/1
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "orderId": 1,
    "paymentStatus": "PAID",
    "paymentMethod": "GOPAY",
    "total": 44000
  }
}
```

---

## 🎯 Testing Kasir Features

### Toggle Menu Availability

```bash
# Login as Kasir first, then:

# Mark menu as unavailable (habis)
curl -X PATCH http://localhost:3000/api/kasir/menus/1/availability \
  -H "Authorization: Bearer YOUR_KASIR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isAvailable": false}'

# Mark menu as available again
curl -X PATCH http://localhost:3000/api/kasir/menus/1/availability \
  -H "Authorization: Bearer YOUR_KASIR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isAvailable": true}'
```

---

## 📋 Postman Collection

Import collection untuk testing:

```bash
__tests__/postman/Ordira_Complete.postman.json
```

**Includes:**
- 30 endpoints
- Pre-configured environments
- Auto-set token from login
- Payment flow examples

**How to use:**
1. Import JSON ke Postman
2. Set environment variables (base_url, etc)
3. Run "Auth → Login" first
4. Token auto-saved ke environment
5. Test payment flow

---

## 🔍 Troubleshooting

### Payment not working?

**Check:**
1. Midtrans keys benar? → Check `.env`
2. Order status masih UNPAID? → Check dengan GET `/api/payment/status/:id`
3. Server running? → Check console logs

**Common Errors:**

**401 Unauthorized from Midtrans:**
```
Solution: Check MIDTRANS_SERVER_KEY di .env
```

**Email not sent:**
```
Solution: Check SMTP configuration, try Mailtrap for testing
```

**Notification not received:**
```
Solution: Normal untuk localhost, gunakan ngrok atau test manual
```

---

### Webhook Testing (Advanced)

**Untuk test webhook di localhost:**

1. **Install ngrok:**
```bash
npm install -g ngrok
```

2. **Start ngrok:**
```bash
ngrok http 3000
```

3. **Copy HTTPS URL:**
```
https://abc123.ngrok.io
```

4. **Update Midtrans:**
- Dashboard → Settings → Configuration
- Notification URL: `https://abc123.ngrok.io/api/payment/notification`

5. **Test payment:**
- Notification akan masuk otomatis
- Check console logs

---

## 📊 Database Check

### View orders in Prisma Studio:

```bash
npx prisma studio
```

Open `http://localhost:5555`

**Check:**
- Order table → paymentStatus updated?
- OrderItem → notes saved?
- PaymentLog → transaction logged?

---

## 🎓 Next Steps

After testing:

1. **Production Setup:**
   - Change Midtrans keys to production
   - Update `isProduction: true` in `src/services/midtransService.js`
   - Setup production SMTP

2. **Frontend Integration:**
   - Use `/api/payment/create` endpoint
   - Redirect to `redirectUrl`
   - Handle payment callback

3. **Monitoring:**
   - Setup error logging (Sentry, etc)
   - Monitor payment failures
   - Track email delivery

---

## 📚 Documentation

Full documentation:
- [PAYMENT_API.md](./docs/PAYMENT_API.md) - Complete payment docs
- [KASIR_API.md](./docs/KASIR_API.md) - Kasir features
- [README.md](./README.md) - General setup

---

## ✅ Quick Test Checklist

- [ ] Dependencies installed
- [ ] `.env` configured
- [ ] Midtrans sandbox account created
- [ ] Gmail SMTP configured
- [ ] Database migrated
- [ ] Server running
- [ ] Create order with notes ✓
- [ ] Create payment transaction ✓
- [ ] Complete payment at Midtrans ✓
- [ ] Email received ✓
- [ ] Payment status verified ✓
- [ ] Kasir toggle menu availability ✓

---

## 💡 Pro Tips

1. **Fast Testing:** Use GoPay di Midtrans sandbox (instant success)
2. **Email Testing:** Mailtrap lebih cepat dari Gmail untuk development
3. **Debug:** Check `console.log` di `src/services/midtransService.js`
4. **Postman:** Auto-save token dengan tests tab
5. **Database:** Gunakan Prisma Studio untuk visual debugging

---

**Total Setup Time: ~15 minutes**

Happy coding! 🚀
