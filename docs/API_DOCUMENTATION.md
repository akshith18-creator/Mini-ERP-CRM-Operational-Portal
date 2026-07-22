# REST API Documentation - Mini ERP + CRM Portal

Base URL: `http://localhost:5000/api/v1`

All responses follow the standard JSON envelope structure:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

---

## Authentication (`/api/v1/auth`)

### 1. Register New User
- **POST** `/auth/register`
- **Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@erp.com",
  "password": "password123",
  "role": "SALES"
}
```

### 2. Login
- **POST** `/auth/login`
- **Body**:
```json
{
  "email": "admin@erp.com",
  "password": "admin123"
}
```
- **Response**: Returns JWT token and user profile object.

### 3. Get Current Profile
- **GET** `/auth/me`
- **Header**: `Authorization: Bearer <token>`

---

## Customers (`/api/v1/customers`)

### 1. List Customers
- **GET** `/customers?page=1&limit=10&search=Apex&type=DISTRIBUTOR&status=ACTIVE`
- **Header**: `Authorization: Bearer <token>`

### 2. Create Customer
- **POST** `/customers`
- **Header**: `Authorization: Bearer <token>` (Roles: `ADMIN`, `SALES`)
- **Body**:
```json
{
  "name": "Apex Global Enterprises",
  "email": "contact@apexglobal.com",
  "phone": "+1 555 019 2834",
  "company": "Apex Global Inc.",
  "address": "100 Innovation Way, Suite 400",
  "type": "DISTRIBUTOR",
  "status": "ACTIVE"
}
```

### 3. Get Customer by ID
- **GET** `/customers/:id`

### 4. Update Customer
- **PATCH** `/customers/:id`

### 5. Delete Customer
- **DELETE** `/customers/:id` (Role: `ADMIN`)

---

## Follow-up Notes (`/api/v1/followups`)

### 1. Get Customer Follow-ups
- **GET** `/followups/customer/:customerId`

### 2. Add Follow-up Note
- **POST** `/followups`
- **Body**:
```json
{
  "customerId": "uuid-here",
  "notes": "Discussed volume discount for upcoming quarter.",
  "followUpDate": "2026-08-15",
  "status": "PENDING"
}
```

---

## Products Catalog (`/api/v1/products`)

### 1. List Products
- **GET** `/products?page=1&limit=10&search=Sensor&category=Electronics&lowStockOnly=true`

### 2. Create Product
- **POST** `/products` (Roles: `ADMIN`, `WAREHOUSE`)
- **Body**:
```json
{
  "sku": "SKU-ELEC-009",
  "name": "Industrial IoT Gateway",
  "category": "Electronics",
  "unitPrice": 299.99,
  "costPrice": 180.00,
  "stockQuantity": 50,
  "minStockAlert": 10,
  "warehouseLocation": "Warehouse A - Rack 02"
}
```

### 3. Update Product
- **PATCH** `/products/:id` (Roles: `ADMIN`, `WAREHOUSE`)

---

## Inventory Control (`/api/v1/inventory`)

### 1. Audit Movement Log
- **GET** `/inventory?page=1&limit=10&movementType=IN`

### 2. Record Stock Movement
- **POST** `/inventory` (Roles: `ADMIN`, `WAREHOUSE`)
- **Body**:
```json
{
  "productId": "uuid-here",
  "movementType": "IN",
  "quantity": 100,
  "reason": "Factory shipment intake",
  "referenceNumber": "PO-2026-901"
}
```

---

## Sales Delivery Challans (`/api/v1/sales`)

### 1. List Sales Challans
- **GET** `/sales?page=1&limit=10&status=DRAFT`

### 2. Create Sales Challan (Draft)
- **POST** `/sales` (Roles: `ADMIN`, `SALES`)
- **Body**:
```json
{
  "customerId": "customer-uuid",
  "notes": "Express delivery requested",
  "items": [
    { "productId": "prod-uuid-1", "quantity": 2 },
    { "productId": "prod-uuid-2", "quantity": 5 }
  ]
}
```

### 3. Update Challan Status
- **PATCH** `/sales/:id/status` (Roles: `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`)
- **Body**:
```json
{
  "status": "CONFIRMED"
}
```
*(Triggering `CONFIRMED` checks stock and deducts inventory. Triggering `CANCELLED` restores stock).*

---

## Executive Dashboard (`/api/v1/dashboard`)

### 1. Get Metrics & Stats
- **GET** `/dashboard/stats`
- Returns total customers, active leads, revenue, low stock counts, and recent activity logs.
