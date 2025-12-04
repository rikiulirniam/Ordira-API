# AI Chat API Documentation

## Endpoint
```
POST /api/ai/chat
```

**Public endpoint** - tidak memerlukan authentication

## Request Body

```json
{
  "message": "string"
}
```

### Parameters
- `message` (required): Pesan dari pelanggan yang menanyakan rekomendasi menu

## Response Format

```json
{
  "status": "success",
  "message": "Menu recommendations generated",
  "data": {
    "intro": "string",
    "recommendations": [
      {
        "id": 1,
        "nama": "string",
        "harga": 0,
        "kategori": "string",
        "gambar": "string | null"
      }
    ],
    "closing": "string"
  }
}
```

### Response Fields
- `intro`: Kalimat pembuka yang ramah dari AI (1-2 kalimat)
- `recommendations`: Array berisi 2-5 menu yang direkomendasikan dari database
  - `id`: ID menu
  - `nama`: Nama menu
  - `harga`: Harga menu (dalam Rupiah)
  - `kategori`: Kategori menu (contoh: "Makanan", "Minuman")
  - `gambar`: URL gambar menu (bisa null)
- `closing`: Kalimat penutup yang mengajak pelanggan (1 kalimat)

## Contoh Penggunaan

### Request 1: Makanan Pedas
```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Saya suka makanan pedas, ada rekomendasi?"
  }'
```

**Response:**
```json
{
  "status": "success",
  "message": "Menu recommendations generated",
  "data": {
    "intro": "Wah, untuk pecinta pedas seperti Anda, saya punya pilihan yang pas!",
    "recommendations": [
      {
        "id": 5,
        "nama": "Nasi Goreng Pedas",
        "harga": 25000,
        "kategori": "Makanan",
        "gambar": "https://example.com/nasigoreng.jpg"
      },
      {
        "id": 12,
        "nama": "Ayam Geprek",
        "harga": 30000,
        "kategori": "Makanan",
        "gambar": null
      },
      {
        "id": 8,
        "nama": "Mie Goreng Pedas",
        "harga": 20000,
        "kategori": "Makanan",
        "gambar": "https://example.com/miegoreng.jpg"
      }
    ],
    "closing": "Silakan pilih yang paling menggugah selera Anda!"
  }
}
```

### Request 2: Minuman Segar
```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Cuaca panas, mau minuman segar"
  }'
```

**Response:**
```json
{
  "status": "success",
  "message": "Menu recommendations generated",
  "data": {
    "intro": "Di cuaca panas begini, minuman segar memang pilihan tepat!",
    "recommendations": [
      {
        "id": 15,
        "nama": "Es Jeruk",
        "harga": 8000,
        "kategori": "Minuman",
        "gambar": null
      },
      {
        "id": 16,
        "nama": "Es Teh Manis",
        "harga": 5000,
        "kategori": "Minuman",
        "gambar": null
      },
      {
        "id": 20,
        "nama": "Jus Alpukat",
        "harga": 15000,
        "kategori": "Minuman",
        "gambar": "https://example.com/alpukat.jpg"
      }
    ],
    "closing": "Pesan sekarang dan nikmati kesegaran yang Anda cari!"
  }
}
```

### Request 3: Menu Murah
```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Menu yang harganya terjangkau dong"
  }'
```

### Request 4: Sarapan
```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Rekomendasi menu untuk sarapan"
  }'
```

## Error Responses

### 400 Bad Request - Message Required
```json
{
  "status": "error",
  "message": "Message is required",
  "details": null
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Failed to process chat",
  "details": null
}
```

## Cara Kerja

1. **AI membaca permintaan pelanggan**
2. **Mengambil semua menu available dari database**
3. **AI memilih 2-5 menu yang paling sesuai** berdasarkan preferensi
4. **Mengembalikan response JSON** dengan:
   - Intro ramah
   - Array menu dari database (lengkap dengan id, nama, harga, kategori, gambar)
   - Closing yang mengajak bertindak

## Notes

- AI hanya merekomendasikan menu yang `isAvailable = true` di database
- Recommendations berisi **data real dari database**, bukan hasil generate AI
- AI hanya menentukan **menu mana yang cocok**, data menu diambil dari database
- Minimum 2 menu, maksimum 5 menu per recommendation
- Harga ditampilkan dalam Rupiah (IDR)
