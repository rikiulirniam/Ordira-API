# Menu & Category API Documentation

Public endpoints for accessing menu and category data.

## Endpoints

### 1. Get All Categories
```
GET /api/categories
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
      "name": "Nasi Goreng",
      "description": "Berbagai varian nasi goreng spesial",
      "icon": "🍳",
      "order": 1,
      "isActive": true,
      "_count": {
        "menus": 4
      }
    }
  ]
}
```

### 2. Get All Menus
```
GET /api/menus
```
**Public endpoint**

**Query Parameters:**
- `categoryId` (optional): Filter by category ID

**Example:**
```bash
curl http://localhost:3000/api/menus?categoryId=1
```

**Response:**
```json
{
  "status": "success",
  "message": "Menus retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Nasi Goreng Ayam",
      "price": 18000,
      "description": "Nasi goreng dengan potongan ayam suwir",
      "image": "/uploads/menus/menu-123456789.jpg",
      "categoryId": 1,
      "isAvailable": true,
      "category": {
        "id": 1,
        "name": "Nasi Goreng"
      }
    }
  ]
}
```

**Note:** Only available menus are returned to public.

### 3. Get Menu by ID
```
GET /api/menus/:id
```
**Public endpoint**

**Example:**
```bash
curl http://localhost:3000/api/menus/1
```

**Response:**
```json
{
  "status": "success",
  "message": "Menu retrieved successfully",
  "data": {
    "id": 1,
    "name": "Nasi Goreng Ayam",
    "price": 18000,
    "description": "Nasi goreng dengan potongan ayam suwir",
    "image": "/uploads/menus/menu-123456789.jpg",
    "categoryId": 1,
    "isAvailable": true,
    "category": {
      "id": 1,
      "name": "Nasi Goreng"
    }
  }
}
```

## Image Access

Menu images are accessible via:
```
http://localhost:3000/uploads/menus/{filename}
```

Example:
```
http://localhost:3000/uploads/menus/menu-1733456789123-987654321.jpg
```

## Admin Management

For admin operations (create, update, delete menus with image upload), see:
- [ADMIN_API.md](./ADMIN_API.md) - Complete CRUD operations
- [IMAGE_UPLOAD.md](./IMAGE_UPLOAD.md) - Image upload documentation

## Database Seeding

The seeder creates only the admin user. Categories and menus must be created via admin endpoints.

```bash
npm run seed
```

This will create:
- 1 admin user (username and password from environment variables)

To populate categories and menus, use the admin API endpoints.
