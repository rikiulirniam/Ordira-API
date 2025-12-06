# Payment & Midtrans Integration Guide

## Overview
Integrasi dengan Midtrans Payment Gateway (Sandbox) untuk menerima pembayaran elektronik dan mengirim struk otomatis via email.

---

## Configuration

### 1. Environment Variables
Tambahkan ke `.env`:

```env
# Midtrans Sandbox
MIDTRANS_SERVER_KEY=SB-Mid-server-xxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxx

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Application URL
APP_URL=http://localhost:3000
```

### 2. Midtrans Setup

1. **Daftar Sandbox Account**
   - Buka: https://dashboard.sandbox.midtrans.com/
   - Register akun baru
   - Verifikasi email

2. **Get API Keys**
   - Login ke dashboard
   - Settings → Access Keys
   - Copy `Server Key` dan `Client Key`
   - Paste ke `.env`

3. **Setup Notification URL**
   - Settings → Configuration
   - Payment Notification URL: `https://your-domain.com/api/payment/notification`
   - Untuk development, gunakan ngrok untuk expose localhost

### 3. Email Setup (Gmail)

1. **Enable 2-Factor Authentication**
   - Google Account → Security → 2-Step Verification

2. **Create App Password**
   - Google Account → Security → App passwords
   - Generate password untuk "Mail"
   - Copy password ke `.env` sebagai `SMTP_PASSWORD`

---

## API Endpoints

### 1. Create Payment Transaction

**Endpoint:** `POST /api/payment/create`

**Description:** Membuat transaksi pembayaran Midtrans untuk order yang sudah dibuat.

**Request Body:**
```json
{
  "orderId": 1,
  "customerEmail": "customer@example.com"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Payment transaction created successfully",
  "data": {
    "token": "abc123-def456-ghi789",
    "redirectUrl": "https://app.sandbox.midtrans.com/snap/v2/vtweb/abc123"
  }
}
```

**Usage:**
```bash
curl -X POST http://localhost:3000/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "customerEmail": "customer@example.com"
  }'
```

**Frontend Integration:**
```javascript
// 1. Create payment transaction
const response = await fetch('/api/payment/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: orderId,
    customerEmail: 'customer@example.com'
  })
});

const { data } = await response.json();

// 2. Redirect to Midtrans payment page
window.location.href = data.redirectUrl;

// OR use Snap.js (embedded)
snap.pay(data.token, {
  onSuccess: function(result) {
    console.log('Payment success:', result);
  },
  onPending: function(result) {
    console.log('Payment pending:', result);
  },
  onError: function(result) {
    console.log('Payment error:', result);
  }
});
```

---

### 2. Payment Notification (Webhook)

**Endpoint:** `POST /api/payment/notification`

**Description:** Webhook untuk menerima notifikasi dari Midtrans. **TIDAK DIPANGGIL MANUAL**.

**Process Flow:**
1. Midtrans mengirim notification setelah payment
2. System update payment status order
3. System log transaction ke PaymentLog
4. Jika payment sukses → kirim struk email otomatis

**Midtrans akan mengirim:**
```json
{
  "transaction_time": "2025-12-06 15:30:00",
  "transaction_status": "settlement",
  "transaction_id": "abc-123-def",
  "order_id": "ORDER-1-1733478600000",
  "payment_type": "gopay",
  "gross_amount": "50000.00"
}
```

---

### 3. Check Payment Status

**Endpoint:** `GET /api/payment/status/:orderId`

**Description:** Cek status pembayaran order.

**Response:**
```json
{
  "status": "success",
  "message": "Success",
  "data": {
    "orderId": 1,
    "paymentStatus": "PAID",
    "paymentMethod": "GOPAY",
    "total": 50000
  }
}
```

**Usage:**
```bash
curl http://localhost:3000/api/payment/status/1
```

---

## Payment Flow

### Complete Flow:

```
1. Customer creates order
   POST /api/orders
   → Order created with status: UNPAID

2. Customer initiates payment
   POST /api/payment/create
   → Get Midtrans payment URL/token

3. Customer pays via Midtrans
   → Redirected to Midtrans payment page
   → Choose payment method (GoPay, QRIS, Bank Transfer, dll)
   → Complete payment

4. Midtrans sends notification (auto)
   POST /api/payment/notification (webhook)
   → System updates order status to PAID
   → System creates PaymentLog
   → System sends receipt email

5. Customer receives email
   → Receipt dengan detail order
   → Total pembayaran
   → Order items dengan catatan
```

---

## Payment Status

### Available Statuses:
- **UNPAID** - Order belum dibayar
- **PAID** - Pembayaran berhasil
- **CANCELLED** - Order/pembayaran dibatalkan

### Status Mapping dari Midtrans:

| Midtrans Status | Our Status | Description |
|----------------|-----------|-------------|
| capture (fraud=accept) | PAID | Kartu kredit berhasil |
| settlement | PAID | Pembayaran berhasil |
| pending | UNPAID | Menunggu pembayaran |
| deny | CANCELLED | Ditolak |
| expire | CANCELLED | Kadaluarsa |
| cancel | CANCELLED | Dibatalkan |

---

## Email Receipt

### Features:
- ✅ Otomatis dikirim setelah payment sukses
- ✅ HTML template responsive
- ✅ Detail lengkap order dan items
- ✅ Include catatan per item
- ✅ Total dan breakdown harga

### Receipt Content:
```
- Order ID
- Table Number
- Payment Method
- Payment Status
- Order Items (dengan catatan)
- Subtotal per item
- Grand Total
```

### Email Template Preview:
```
┌─────────────────────────────────┐
│   Ordira Restaurant             │
│   Payment Receipt               │
├─────────────────────────────────┤
│ Order #: 1                      │
│ Table: 5                        │
│ Date: 06/12/2025                │
│ Method: GOPAY                   │
│ Status: PAID                    │
├─────────────────────────────────┤
│ Item              Qty   Subtotal│
│ Nasi Goreng Ayam   2    36,000  │
│ Note: Pedas sedang              │
│ Es Teh Manis       2    8,000   │
├─────────────────────────────────┤
│ TOTAL                  44,000   │
└─────────────────────────────────┘
```

---

## Testing (Sandbox)

### Test Credit Cards:
```
Card Number: 4811 1111 1111 1114
CVV: 123
Exp: Any future date
3D Secure: 112233
```

### Test Payment Methods:
- **GoPay**: Otomatis sukses
- **QRIS**: Scan dan bayar
- **Bank Transfer**: Virtual account number provided
- **Convenience Store**: Payment code provided

### Test Scenarios:

1. **Successful Payment:**
```bash
# Create order
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "tableNumber": "5",
    "items": [{"menuId": 1, "qty": 2, "note": "Pedas sedang"}],
    "customerEmail": "test@example.com"
  }'

# Create payment
curl -X POST http://localhost:3000/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{"orderId": 1, "customerEmail": "test@example.com"}'

# Open redirectUrl di browser
# Complete payment di Midtrans
# Check email untuk receipt
```

2. **Check Status:**
```bash
curl http://localhost:3000/api/payment/status/1
```

---

## Troubleshooting

### 1. Email tidak terkirim
- Check SMTP credentials di `.env`
- Pastikan App Password benar (bukan password Gmail)
- Check firewall/antivirus blocking port 587
- Test connection: Coba kirim email manual

### 2. Midtrans notification tidak masuk
- Pastikan notification URL sudah diset di Midtrans dashboard
- Untuk localhost, gunakan ngrok:
  ```bash
  ngrok http 3000
  # Copy HTTPS URL ke Midtrans notification URL
  ```
- Check Midtrans dashboard → Notifications → History

### 3. Payment gagal
- Pastikan Server Key benar
- Check order status belum PAID
- Pastikan total amount > 0
- Check Midtrans dashboard untuk error details

---

## Security Notes

⚠️ **Important:**

1. **Never expose Server Key** - Keep in `.env` only
2. **Validate notification** - System auto-validates Midtrans signature
3. **HTTPS Required** - Production harus HTTPS untuk notification URL
4. **Rate Limiting** - Implement rate limiting untuk payment endpoints
5. **Email Validation** - Validate email format before sending

---

## Production Checklist

Before going live:

- [ ] Change Midtrans to Production keys
- [ ] Set `isProduction: true` in midtransService.js
- [ ] Update notification URL to production domain (HTTPS)
- [ ] Configure production email SMTP
- [ ] Test all payment methods
- [ ] Setup monitoring untuk payment failures
- [ ] Backup email templates
- [ ] Configure rate limiting
- [ ] Setup error alerting

---

## Support

**Midtrans Documentation:**
- Dashboard: https://dashboard.midtrans.com/
- API Docs: https://docs.midtrans.com/
- Support: support@midtrans.com

**Payment Methods Supported:**
- Credit/Debit Cards
- GoPay
- QRIS
- Bank Transfer (Virtual Account)
- Convenience Store
- Akulaku
- Kredivo
