# Admin API Documentation

Complete CRUD operations for User, Category, and Menu management.

## Authentication
All admin endpoints require authentication with Admin role.

Add header:
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

## User Management

### 1. Get All Users
```
GET /api/admin/users
```

**Response:**
```json
{
  "status": "success",
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "username": "admin123",
      "role": "ADMIN",
      "createdAt": "2025-12-05T...",
      "updatedAt": "2025-12-05T..."
    }
  ]
}
```

### 2. Get User by ID
```
GET /api/admin/users/:id
```

**Example:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/admin/users/1
```

### 3. Create User
```
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "kasir02",
  "password": "kasir123",
  "role": "KASIR"
}
```

**Valid Roles:** `ADMIN`, `KASIR`

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username": "kasir02", "password": "kasir123", "role": "KASIR"}'
```

### 4. Update User
```
PUT /api/admin/users/:id
```

**Request Body:** (all fields optional)
```json
{
  "username": "kasir03",
  "password": "newpassword",
  "role": "ADMIN"
}
```

**Example:**
```bash
curl -X PUT http://localhost:3000/api/admin/users/2 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password": "newpassword"}'
```

### 5. Delete User
```
DELETE /api/admin/users/:id
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/admin/users/3 \
  -H "Authorization: Bearer TOKEN"
```

---

## Category Management

### 1. Get All Categories (Admin)
```
GET /api/admin/categories
```

**Query Parameters:**
- `includeInactive` (optional): `true` to include inactive categories

**Example:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/admin/categories?includeInactive=true"
```

**Response:**
```json
{
  "status": "success",
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Nasi Goreng",
      "description": "Berbagai varian nasi goreng",
      "icon": "🍳",
      "order": 0,
      "isActive": true,
      "_count": {
        "menus": 4
      },
      "createdAt": "2025-12-05T...",
      "updatedAt": "2025-12-05T..."
    }
  ]
}
```

### 2. Get Category by ID
```
GET /api/admin/categories/:id
```

### 3. Create Category
```
POST /api/admin/categories
```

**Request Body:**
```json
{
  "name": "Makanan Penutup",
  "description": "Dessert dan makanan manis",
  "icon": "🍰",
  "order": 12,
  "isActive": true
}
```

**Required:** `name`
**Optional:** `description`, `icon`, `order`, `isActive`

**Example:**
```bash
curl -X POST http://localhost:3000/api/admin/categories \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Makanan Penutup",
    "description": "Dessert dan makanan manis",
    "icon": "🍰"
  }'
```

### 4. Update Category
```
PUT /api/admin/categories/:id
```

**Request Body:** (all fields optional)
```json
{
  "name": "Dessert",
  "description": "Sweet dishes",
  "icon": "🍨",
  "order": 10,
  "isActive": false
}
```

**Example:**
```bash
curl -X PUT http://localhost:3000/api/admin/categories/1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'
```

### 5. Delete Category
```
DELETE /api/admin/categories/:id
```

**Note:** Cannot delete category with existing menus. Delete or reassign menus first.

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/admin/categories/12 \
  -H "Authorization: Bearer TOKEN"
```

---

## Menu Management

### 1. Get All Menus (Admin)
```
GET /api/admin/menus
```

**Query Parameters:**
- `includeUnavailable` (optional): `true` to include unavailable menus
- `categoryId` (optional): Filter by category ID

**Example:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/admin/menus?includeUnavailable=true&categoryId=1"
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
      "description": "Nasi goreng dengan potongan ayam",
      "image": null,
      "categoryId": 1,
      "isAvailable": true,
      "category": {
        "id": 1,
        "name": "Nasi Goreng"
      },
      "createdAt": "2025-12-05T...",
      "updatedAt": "2025-12-05T..."
    }
  ]
}
```

### 2. Get Menu by ID
```
GET /api/admin/menus/:id
```

### 3. Create Menu
```
POST /api/admin/menus
```

**Content-Type:** 
- `application/json` (without image)
- `multipart/form-data` (with image upload)

**Request Body (JSON - No Image):**
```json
{
  "name": "Nasi Goreng Special",
  "price": 25000,
  "description": "Nasi goreng dengan telur, ayam, dan seafood",
  "categoryId": 1,
  "isAvailable": true
}
```

**Request Body (Form Data - With Image):**
```
name: Nasi Goreng Special
price: 25000
description: Nasi goreng dengan telur, ayam, dan seafood
categoryId: 1
isAvailable: true
image: [FILE]
```

**Required:** `name`, `price`, `categoryId`
**Optional:** `description`, `image`, `isAvailable`

**Example (JSON):**
```bash
curl -X POST http://localhost:3000/api/admin/menus \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nasi Goreng Special",
    "price": 25000,
    "categoryId": 1
  }'
```

**Example (With Image Upload):**
```bash
curl -X POST http://localhost:3000/api/admin/menus \
  -H "Authorization: Bearer TOKEN" \
  -F "name=Nasi Goreng Special" \
  -F "price=25000" \
  -F "categoryId=1" \
  -F "image=@/path/to/image.jpg"
```

**Note:** See [IMAGE_UPLOAD.md](./IMAGE_UPLOAD.md) for detailed image upload documentation.

### 4. Update Menu
```
PUT /api/admin/menus/:id
```

**Content-Type:** 
- `application/json` (without image)
- `multipart/form-data` (with image upload)

**Request Body (JSON):** (all fields optional)
```json
{
  "name": "Nasi Goreng Spesial Premium",
  "price": 30000,
  "description": "Updated description",
  "categoryId": 2,
  "isAvailable": false
}
```

**Request Body (Form Data - With New Image):**
```
name: Nasi Goreng Spesial Premium
price: 30000
image: [NEW_FILE]
```

**Example (JSON):**
```bash
curl -X PUT http://localhost:3000/api/admin/menus/1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price": 20000, "isAvailable": true}'
```

**Example (Replace Image):**
```bash
curl -X PUT http://localhost:3000/api/admin/menus/1 \
  -H "Authorization: Bearer TOKEN" \
  -F "image=@/path/to/new-image.jpg"
```

**Note:** 
- When uploading new image, old image will be automatically deleted
- To update menu without changing image, use JSON format
- See [IMAGE_UPLOAD.md](./IMAGE_UPLOAD.md) for detailed image upload documentation.

### 5. Delete Menu
```
DELETE /api/admin/menus/:id
```

**Note:** 
- Cannot delete menu that has been ordered. Mark as unavailable instead.
- Associated image file will be automatically deleted from server.

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/admin/menus/50 \
  -H "Authorization: Bearer TOKEN"
```

---

## Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Username, password, and role are required",
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

### 403 Forbidden
```json
{
  "status": "error",
  "message": "Unauthorized access",
  "details": null
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "User not found",
  "details": null
}
```

---

## Business Rules

### User Management
- Username must be unique
- Password is automatically hashed
- Valid roles: ADMIN, KASIR
- Only Admin can manage users

### Category Management
- Category name must be unique
- If order not specified, auto-set to last position
- Cannot delete category with existing menus
- isActive flag controls visibility to customers

### Menu Management
- Menu must belong to valid category
- Price must be positive number
- Cannot delete menu that has been ordered
- Use isAvailable flag to hide menu temporarily
- Menu changes reflect immediately to customers

---

## Complete Workflow Example

### 1. Create Category
```bash
# Login as admin
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin123", "password": "admin123"}' \
  | jq -r '.data.token')

# Create category
curl -X POST http://localhost:3000/api/admin/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Spesial Hari Ini",
    "description": "Menu spesial hari ini",
    "icon": "⭐",
    "order": 0
  }'
```

### 2. Create Menu in Category
```bash
curl -X POST http://localhost:3000/api/admin/menus \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nasi Goreng Kampung Special",
    "price": 25000,
    "description": "Menu spesial dengan bumbu rahasia",
    "categoryId": 13
  }'
```

### 3. Update Menu Price
```bash
curl -X PUT http://localhost:3000/api/admin/menus/49 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price": 27000}'
```

### 4. Disable Menu Temporarily
```bash
curl -X PUT http://localhost:3000/api/admin/menus/49 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isAvailable": false}'
```

### 5. Create New Kasir User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "kasir_pagi",
    "password": "kasir123",
    "role": "KASIR"
  }'
```
