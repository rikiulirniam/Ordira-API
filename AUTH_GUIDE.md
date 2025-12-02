# API Authentication Guide

## Default Users (setelah seed)

### Admin
- Username: `admin`
- Password: `admin123`
- Role: `ADMIN`

### Kasir
- Username: `kasir`
- Password: `kasir123`
- Role: `KASIR`

### Koki
- Username: `koki`
- Password: `koki123`
- Role: `KOKI`

## Cara Login dan Menggunakan Bearer Token

### 1. Login sebagai Admin

**Request:**
```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged in",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "ADMIN",
      "createdAt": "2025-12-02T...",
      "updatedAt": "2025-12-02T..."
    }
  }
}
```

### 2. Gunakan Token untuk Request yang Memerlukan Auth

Copy token dari response login, lalu gunakan di header `Authorization`:

**Request:**
```http
POST http://localhost:3000/auth/register
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "username": "koki01",
  "password": "password123",
  "role": "KOKI"
}
```

## Endpoints

### Public (tidak perlu auth)
- `POST /auth/login` - Login user

### Protected (perlu Bearer token)
- `POST /auth/register` - Register user baru (hanya ADMIN)

## Testing dengan cURL

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Register User Baru (dengan token)
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"username":"koki01","password":"password123","role":"KOKI"}'
```

## Roles
- `ADMIN` - Full access
- `KASIR` - Kasir/Cashier
- `KOKI` - Chef/Cook

## Troubleshooting

### "Unauthenticated" Error
- Pastikan Anda sudah login dan mendapat token
- Pastikan format header: `Authorization: Bearer <token>`
- Pastikan ada spasi antara "Bearer" dan token

### "Forbidden" Error
- User Anda tidak memiliki role yang sesuai
- Endpoint `/auth/register` hanya bisa diakses oleh ADMIN

### "Invalid credentials" Error
- Username atau password salah
- Pastikan user sudah dibuat (jalankan `npm run seed`)
