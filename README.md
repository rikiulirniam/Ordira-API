# Mesa Backend API

Backend service untuk aplikasi Ordira (Restaurant Order Management System) menggunakan Express.js dengan clean architecture dan Prisma ORM.

## 📋 Daftar Isi

- [Fitur](#-fitur)
- [Tech Stack](#-tech-stack)
- [Struktur Folder](#-struktur-folder)
- [Instalasi](#-instalasi)
- [Konfigurasi](#-konfigurasi)
- [Database Setup](#-database-setup)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [API Endpoints](#-api-endpoints)
- [Authentication](#-authentication)
- [Testing](#-testing)

## ✨ Fitur

- 🔐 Authentication & Authorization (JWT)
- 👥 User Management (Admin, Kasir, Koki)
- 🍽️ Menu Management
- 🪑 Table Management (Meja)
- 📝 Order Management
- 💳 Payment Processing (QRIS, Cash)
- 📊 Payment Logs
- 🔒 Role-based Access Control

## 🛠 Tech Stack

- **Runtime:** Node.js v22+
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma v7 with PostgreSQL Adapter
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Environment:** dotenv
- **Dev Tools:** Nodemon
- **Testing:** Jest

## 📁 Struktur Folder

```
api/
├── prisma/
│   ├── migrations/         # Database migrations
│   ├── schema.prisma       # Database schema
│   └── seed.js            # Database seeder
├── src/
│   ├── config/
│   │   └── env.js         # Environment configuration
│   ├── controllers/       # Request handlers
│   │   └── authController.js
│   ├── core/
│   │   ├── apiError.js    # Custom error class
│   │   └── response.js    # Response helpers
│   ├── middlewares/       # Express middlewares
│   │   ├── auth.js        # Authentication & authorization
│   │   ├── cors.js        # CORS configuration
│   │   ├── errorHandler.js
│   │   ├── requestLogger.js
│   │   └── validator.js
│   ├── models/
│   │   ├── prismaClient.js # Prisma client singleton
│   │   └── userModel.js
│   ├── routes/            # API routes
│   │   ├── index.js
│   │   └── authRoutes.js
│   ├── services/          # Business logic
│   │   └── authService.js
│   ├── utils/
│   │   └── logger.js
│   ├── app.js            # Express app configuration
│   └── server.js         # Server entry point
├── generated/             # Prisma generated client
├── .env                  # Environment variables
├── package.json
└── README.md
```

## 🚀 Instalasi

### Prerequisites

- Node.js v22 atau lebih tinggi
- PostgreSQL 12+ (running & accessible)
- npm atau yarn

### Steps

1. **Clone repository**
```bash
git clone <repository-url>
cd api
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
# Copy file .env dan sesuaikan konfigurasi
cp .env.example .env
```

## ⚙️ Konfigurasi

Edit file `.env` dengan konfigurasi Anda:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/db_ordira?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN=1d
```

**Catatan Penting:**
- Ganti `user` dan `password` dengan credentials PostgreSQL Anda
- Pastikan database `db_ordira` sudah dibuat
- Gunakan JWT_SECRET yang kuat untuk production

## 🗄️ Database Setup

### 1. Buat Database

```bash
# Login ke PostgreSQL
psql -U postgres

# Buat database
CREATE DATABASE db_ordira;

# Exit
\q
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Jalankan Migrasi

```bash
npx prisma migrate dev
```

### 4. Seed Database (Optional)

Membuat user default untuk testing:

```bash
npm run seed
```

**User default yang dibuat:**
- **Admin:** username: `admin`, password: `admin123`
- **Kasir:** username: `kasir`, password: `kasir123`

## 🏃 Menjalankan Aplikasi

### Development Mode

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000` dengan hot-reload (nodemon).

### Production Mode

```bash
npm start
```

### Prisma Studio (Database GUI)

```bash
npx prisma studio
```

Buka `http://localhost:5555` untuk melihat data dalam GUI.

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | ❌ | Login user |
| POST | `/auth/register` | ✅ Admin | Register user baru |

### Response Format

**Success Response:**
```json
{
  "status": "success",
  "message": "Logged in",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "ADMIN"
    }
  }
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Unauthenticated",
  "details": null
}
```

## 🔐 Authentication

### 1. Login

**Request:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "status": "success",
  "message": "Logged in",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

### 2. Menggunakan Bearer Token

Setiap request yang memerlukan authentication harus menyertakan header:

```
Authorization: Bearer <your-jwt-token>
```

**Contoh:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "username": "koki01",
    "password": "password123",
    "role": "KOKI"
  }'
```

## 🧪 Testing

Jalankan test suite:

```bash
npm test
```

## 📚 Database Schema

### Models

- **User** - User accounts (Admin, Kasir, Koki)
- **Meja** - Restaurant tables
- **Menu** - Menu items
- **Order** - Customer orders
- **OrderItem** - Order details (line items)
- **PaymentLog** - Payment transaction logs

### User Roles

- `ADMIN` - Full system access
- `KASIR` - Cashier/front desk
- `KOKI` - Kitchen/chef

### Order Status Flow

```
PENDING → PAID → PROCESSING → READY → DONE
         ↓
      CANCELLED
```

### Payment Status

- `UNPAID` - Order belum dibayar
- `PENDING` - Pembayaran sedang diproses
- `PAID` - Pembayaran berhasil
- `FAILED` - Pembayaran gagal
- `CANCELLED` - Pembayaran dibatalkan

## 🔧 Scripts

```bash
npm start          # Jalankan production server
npm run dev        # Jalankan development server (hot-reload)
npm run seed       # Seed database dengan data default
npm test           # Jalankan test suite
npx prisma studio  # Buka Prisma Studio (Database GUI)
npx prisma migrate dev  # Buat dan jalankan migrasi baru
npx prisma generate     # Generate Prisma Client
```

## 📝 Catatan Arsitektur

- **Clean Architecture:** Pemisahan concern yang jelas (routes → controllers → services → models)
- **Middleware Chain:** Request flow yang terstruktur dengan middleware
- **Error Handling:** Centralized error handling dengan custom `ApiError`
- **Security:** JWT authentication, password hashing dengan bcrypt
- **Database:** Prisma ORM dengan PostgreSQL adapter untuk type-safety
- **ESM Modules:** Modern JavaScript dengan `type: module`

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License

## 👥 Authors

- Your Team Name

## 📞 Support

Untuk pertanyaan atau bantuan, silakan buka issue di repository ini.
