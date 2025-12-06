# Kasir Features Documentation

## Overview
Fitur khusus untuk Kasir dalam mengelola ketersediaan menu.

---

## Endpoints

### Toggle Menu Availability

**Endpoint:** `PATCH /api/kasir/menus/:id/availability`

**Auth Required:** Kasir atau Admin

**Description:** Kasir dapat mengubah status ketersediaan menu (habis/tersedia) secara real-time.

**Headers:**
```
Authorization: Bearer YOUR_KASIR_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "isAvailable": false
}
```

**Response Success:**
```json
{
  "status": "success",
  "message": "Menu is now unavailable",
  "data": {
    "id": 1,
    "name": "Nasi Goreng Ayam",
    "price": 18000,
    "description": "Nasi goreng dengan potongan ayam",
    "image": null,
    "categoryId": 1,
    "isAvailable": false,
    "category": {
      "id": 1,
      "name": "Nasi Goreng"
    },
    "createdAt": "2025-12-05T...",
    "updatedAt": "2025-12-06T..."
  }
}
```

---

## Use Cases

### 1. Menu Habis (Sold Out)

**Scenario:** Kasir mengetahui menu tertentu sudah habis

**Action:**
```bash
curl -X PATCH http://localhost:3000/api/kasir/menus/1/availability \
  -H "Authorization: Bearer KASIR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isAvailable": false}'
```

**Result:**
- Menu status berubah menjadi `unavailable`
- Customer tidak bisa order menu tersebut
- Menu masih terlihat di list tapi dengan status "Habis"

---

### 2. Menu Tersedia Kembali

**Scenario:** Stock menu sudah diisi kembali

**Action:**
```bash
curl -X PATCH http://localhost:3000/api/kasir/menus/1/availability \
  -H "Authorization: Bearer KASIR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isAvailable": true}'
```

**Result:**
- Menu kembali available
- Customer bisa order menu ini
- Status berubah menjadi "Tersedia"

---

## Integration Examples

### Frontend - Kasir Dashboard

```javascript
// Toggle menu availability
async function toggleMenuAvailability(menuId, isAvailable) {
  const token = localStorage.getItem('kasirToken');
  
  const response = await fetch(`/api/kasir/menus/${menuId}/availability`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ isAvailable })
  });

  const result = await response.json();
  
  if (result.status === 'success') {
    alert(result.message);
    // Update UI
    updateMenuStatus(menuId, isAvailable);
  }
}

// Example UI
function MenuCard({ menu }) {
  return (
    <div className="menu-card">
      <h3>{menu.name}</h3>
      <p>Rp {menu.price.toLocaleString()}</p>
      
      <label>
        <input 
          type="checkbox" 
          checked={menu.isAvailable}
          onChange={(e) => toggleMenuAvailability(menu.id, e.target.checked)}
        />
        {menu.isAvailable ? 'Tersedia' : 'Habis'}
      </label>
    </div>
  );
}
```

---

## Business Rules

1. **Authorization:**
   - Hanya Kasir dan Admin yang bisa update availability
   - Customer tidak bisa mengubah status menu

2. **Impact:**
   - Menu dengan `isAvailable: false` tidak bisa dipesan
   - API order akan return error jika mencoba order menu unavailable
   - Menu tetap muncul di list untuk informasi customer

3. **Real-time:**
   - Perubahan langsung terlihat di customer app
   - Tidak perlu restart atau reload

---

## Error Handling

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Unauthenticated"
}
```
**Solution:** Login dulu atau refresh token

---

### 403 Forbidden
```json
{
  "status": "error",
  "message": "Unauthorized access"
}
```
**Solution:** User bukan Kasir/Admin

---

### 404 Not Found
```json
{
  "status": "error",
  "message": "Menu not found"
}
```
**Solution:** Check menu ID yang benar

---

### 400 Bad Request
```json
{
  "status": "error",
  "message": "isAvailable field is required"
}
```
**Solution:** Sertakan field `isAvailable` di request body

---

## Workflow Example

### Daily Operations:

```
Morning (Opening):
1. Kasir login
2. Check semua menu availability
3. Set menu yang belum ready ke unavailable

During Service:
1. Customer order menu tertentu
2. Stock hampir habis
3. Kasir update menu availability → unavailable
4. Customer tidak bisa order menu tersebut lagi

Restock:
1. Kitchen memberitahu stock sudah diisi
2. Kasir update menu availability → available
3. Customer bisa order lagi

Closing:
1. Kasir set semua menu unavailable
2. Atau admin bisa batch update via admin panel
```

---

## Tips

1. **Quick Toggle:**
   - Implement toggle button di UI untuk cepat switch on/off
   - Gunakan color coding: Green (available), Red (unavailable)

2. **Batch Update:**
   - Admin bisa batch update multiple menus
   - Gunakan endpoint admin: `PUT /api/admin/menus/:id`

3. **Notifications:**
   - Implement notification ke kasir jika menu habis
   - Real-time update via WebSocket/SSE

4. **Analytics:**
   - Track menu yang sering habis
   - Optimize stock management

---

## Related Endpoints

**Admin - Full Menu Management:**
- `GET /api/admin/menus` - List all menus (including unavailable)
- `PUT /api/admin/menus/:id` - Update menu details + availability
- `POST /api/admin/menus` - Create new menu

**Public - Customer View:**
- `GET /api/menus` - List only available menus
- `GET /api/menus/:id` - Get menu detail (shows availability)
