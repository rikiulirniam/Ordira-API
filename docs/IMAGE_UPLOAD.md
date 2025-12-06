# Menu Image Upload API

## Create Menu with Image

**Endpoint:** `POST /api/admin/menus`  
**Auth:** Required (Admin only)  
**Content-Type:** `multipart/form-data`

### Request Body (Form Data):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Menu name |
| price | number | Yes | Menu price |
| description | string | No | Menu description |
| categoryId | number | Yes | Category ID |
| isAvailable | boolean | No | Availability status (default: true) |
| image | file | No | Image file (JPEG, PNG, GIF, WebP, max 5MB) |

### Example using cURL:

```bash
curl -X POST http://localhost:3000/api/admin/menus \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "name=Nasi Goreng Spesial" \
  -F "price=25000" \
  -F "description=Nasi goreng dengan topping lengkap" \
  -F "categoryId=1" \
  -F "isAvailable=true" \
  -F "image=@/path/to/image.jpg"
```

### Example using JavaScript (Fetch):

```javascript
const formData = new FormData();
formData.append('name', 'Nasi Goreng Spesial');
formData.append('price', 25000);
formData.append('description', 'Nasi goreng dengan topping lengkap');
formData.append('categoryId', 1);
formData.append('isAvailable', true);
formData.append('image', fileInput.files[0]);

const response = await fetch('http://localhost:3000/api/admin/menus', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
```

### Success Response (201):

```json
{
  "status": "success",
  "message": "Menu created successfully",
  "data": {
    "id": 1,
    "name": "Nasi Goreng Spesial",
    "price": 25000,
    "description": "Nasi goreng dengan topping lengkap",
    "image": "/uploads/menus/menu-1733456789123-987654321.jpg",
    "categoryId": 1,
    "isAvailable": true,
    "createdAt": "2024-12-06T10:00:00.000Z",
    "updatedAt": "2024-12-06T10:00:00.000Z"
  }
}
```

---

## Update Menu with Image

**Endpoint:** `PUT /api/admin/menus/:id`  
**Auth:** Required (Admin only)  
**Content-Type:** `multipart/form-data`

### Request Body (Form Data):

All fields are optional. Only send fields you want to update.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | Menu name |
| price | number | No | Menu price |
| description | string | No | Menu description |
| categoryId | number | No | Category ID |
| isAvailable | boolean | No | Availability status |
| image | file | No | New image file (replaces old one) |

### Example using cURL:

```bash
# Update only image
curl -X PUT http://localhost:3000/api/admin/menus/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "image=@/path/to/new-image.jpg"

# Update multiple fields including image
curl -X PUT http://localhost:3000/api/admin/menus/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "name=Nasi Goreng Premium" \
  -F "price=30000" \
  -F "image=@/path/to/new-image.jpg"
```

### Success Response (200):

```json
{
  "status": "success",
  "message": "Menu updated successfully",
  "data": {
    "id": 1,
    "name": "Nasi Goreng Premium",
    "price": 30000,
    "description": "Nasi goreng dengan topping lengkap",
    "image": "/uploads/menus/menu-1733456999999-123456789.jpg",
    "categoryId": 1,
    "isAvailable": true,
    "createdAt": "2024-12-06T10:00:00.000Z",
    "updatedAt": "2024-12-06T10:05:00.000Z"
  }
}
```

**Note:** When uploading a new image, the old image file will be automatically deleted from the server.

---

## Delete Menu

**Endpoint:** `DELETE /api/admin/menus/:id`  
**Auth:** Required (Admin only)

Deleting a menu will automatically delete its associated image file from the server.

### Example:

```bash
curl -X DELETE http://localhost:3000/api/admin/menus/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Success Response (200):

```json
{
  "status": "success",
  "message": "Menu deleted successfully",
  "data": {
    "id": 1,
    "message": "Menu deleted successfully"
  }
}
```

---

## Access Uploaded Images

Uploaded images are accessible via:

```
http://localhost:3000/uploads/menus/{filename}
```

Example:
```
http://localhost:3000/uploads/menus/menu-1733456789123-987654321.jpg
```

---

## Image Requirements

- **Allowed formats:** JPEG, JPG, PNG, GIF, WebP
- **Maximum size:** 5MB
- **Field name:** `image` (in form data)

---

## Error Responses

### Invalid file type:

```json
{
  "status": "error",
  "message": "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
}
```

### File too large:

```json
{
  "status": "error",
  "message": "File too large"
}
```

### Missing required fields:

```json
{
  "status": "error",
  "message": "Name, price, and categoryId are required"
}
```

---

## Postman Example

1. **Create new request:** `POST /api/admin/menus`
2. **Set Authorization:** Bearer Token with admin token
3. **Go to Body tab:** Select `form-data`
4. **Add fields:**
   - Key: `name`, Value: `Nasi Goreng`
   - Key: `price`, Value: `25000`
   - Key: `categoryId`, Value: `1`
   - Key: `image`, Type: `File`, Value: Select image file
5. **Send request**

---

## File Storage

- Images are stored in: `uploads/menus/`
- Filename format: `menu-{timestamp}-{random}.{ext}`
- Example: `menu-1733456789123-987654321.jpg`

---

## Automatic Cleanup

The system automatically handles image cleanup:

- **On update with new image:** Old image is deleted
- **On menu delete:** Associated image is deleted
- **On failed creation:** Uploaded image is deleted (rollback)
- **On failed update:** New uploaded image is deleted (rollback)
