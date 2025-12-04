# Menu & Kategori API Documentation

## Endpoints

### 1. Get All Categories
```
GET /api/kategoris
```
**Public endpoint**

**Response:**
```json
{
  "status": "success",
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": 1,
      "nama": "Nasi Goreng",
      "deskripsi": "Berbagai varian nasi goreng spesial",
      "icon": "🍳",
      "urutan": 1,
      "isActive": true,
      "_count": {
        "menus": 4
      }
    }
  ]
}
```

### 2. Get Menus by Category
```
GET /api/kategoris/:kategoriId/menus
```
**Public endpoint**

**Example:**
```bash
curl http://localhost:3000/api/kategoris/1/menus
```

**Response:**
```json
{
  "status": "success",
  "message": "Menus retrieved successfully",
  "data": [
    {
      "id": 1,
      "nama": "Nasi Goreng Ayam",
      "harga": 18000,
      "deskripsi": "Nasi goreng dengan potongan ayam suwir",
      "gambar": null,
      "kategoriId": 1,
      "kategori": {
        "id": 1,
        "nama": "Nasi Goreng"
      }
    }
  ]
}
```

### 3. Get All Menus
```
GET /api/menus
```
**Public endpoint**

Returns all available menus grouped by category.

### 4. Get Menu by ID
```
GET /api/menus/:id
```
**Public endpoint**

**Example:**
```bash
curl http://localhost:3000/api/menus/1
```

### 5. Search Menus
```
GET /api/menus/search?q=ayam
```
**Public endpoint**

Search menus by name or description.

**Example:**
```bash
curl "http://localhost:3000/api/menus/search?q=ayam"
```

## Categories Seeded (12 total)

1. **Nasi Goreng** 🍳 - 4 menu
2. **Ayam** 🍗 - 4 menu
3. **Mie** 🍜 - 4 menu
4. **Soto & Sop** 🍲 - 4 menu
5. **Seafood** 🦐 - 4 menu
6. **Nasi Campur** 🍱 - 4 menu
7. **Snack & Gorengan** 🍟 - 4 menu
8. **Minuman Dingin** 🧊 - 4 menu
9. **Minuman Panas** ☕ - 4 menu
10. **Jus & Smoothie** 🥤 - 4 menu
11. **Dessert** 🍰 - 4 menu
12. **Paket Hemat** 💰 - 4 menu

**Total: 48 menus**

## Run Seed

```bash
npm run seed
```

This will create:
- 2 users (admin, kasir)
- 12 categories
- 48 menus
