# How It Works - Mini ERP + CRM System Architecture

This document provides a comprehensive operational overview of the **Mini ERP + CRM Portal**, detailing its system architecture, transactional stock handling mechanisms, security model, data flows, and module interactions.

---

## 1. High-Level System Architecture

The application is structured into a modern decoupled client-server architecture:

```
                  ┌─────────────────────────────────────────┐
                  │          React + Vite Frontend          │
                  │   (Tailwind CSS, React Query, Axios)    │
                  └────────────────────┬────────────────────┘
                                       │ HTTPS / JSON API
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │            Express.js Server            │
                  │   (TypeScript, JWT Auth, Zod Validation) │
                  └────────────────────┬────────────────────┘
                                       │ Prisma ORM
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │           PostgreSQL Database           │
                  │       (Neon Serverless Postgres)        │
                  └─────────────────────────────────────────┘
```

### Key Architectural Layers:
1. **Presentation Layer (Frontend)**:
   - Built with React 18, TypeScript, and Vite.
   - Global auth state managed via `AuthContext` with JWT tokens persisted in `localStorage`.
   - Data fetching and caching powered by `@tanstack/react-query`.
   - Dark/Light mode theme engine controlled via `ThemeContext`.
2. **API & Business Layer (Backend)**:
   - Feature-based structure: `auth`, `users`, `customers`, `followups`, `products`, `inventory`, `sales`, `dashboard`.
   - Each module isolates concerns into `routes`, `controller`, `service`, `repository`, `validation`, and `types`.
3. **Data Access Layer**:
   - Schema defined in `prisma/schema.prisma`.
   - Strict transactional guarantees using Prisma `$transaction` API.

---

## 2. Role-Based Access Control (RBAC) Matrix

The system defines 4 operational user roles enforced at both the API level (`auth.middleware.ts`) and UI component level (`Sidebar.tsx`, route guards):

| Module / Action | Admin | Sales | Warehouse | Accounts |
| :--- | :---: | :---: | :---: | :---: |
| **Authentication & Profile** | ✅ | ✅ | ✅ | ✅ |
| **Dashboard Metrics** | ✅ | ✅ | ✅ | ✅ |
| **View Customers & Timeline** | ✅ | ✅ | ✅ | ✅ |
| **Create/Edit Customers & Follow-ups** | ✅ | ✅ | ❌ | ❌ |
| **Delete Customer Account** | ✅ | ❌ | ❌ | ❌ |
| **View Product SKU Catalog** | ✅ | ✅ | ✅ | ✅ |
| **Create / Edit Master Products** | ✅ | ❌ | ✅ | ❌ |
| **View Stock Audit Log** | ✅ | ✅ | ✅ | ✅ |
| **Record Stock Movement (IN/OUT)** | ✅ | ❌ | ✅ | ❌ |
| **Create Sales Challan (Draft)** | ✅ | ✅ | ❌ | ❌ |
| **Confirm Challan (Stock Issue)** | ✅ | ✅ | ✅ | ✅ |
| **Cancel Challan (Stock Restore)** | ✅ | ✅ | ✅ | ✅ |
| **User & Role Administration** | ✅ | ❌ | ❌ | ❌ |

---

## 3. Transactional Stock Fulfillment & Non-Negative Inventory Engine

A core business constraint of the ERP is that **stock can never become negative**, and order status changes must maintain absolute consistency across product balances and audit movement logs.

### State Diagram for Sales Challans:

```
[ DRAFT ]  ────────────── (Warehouse Confirm) ─────────────► [ CONFIRMED ]
   │                                                             │
   │                                                             │
(Cancel)                                                     (Cancel Order)
   │                                                             │
   ▼                                                             ▼
[ CANCELLED ] ◄───────────────────────────────────────────── [ CANCELLED ]
                                                           (Restores Stock)
```

### Operational Workflows:

#### A. Draft Order Creation (`status = DRAFT`)
1. Sales rep selects customer and line items.
2. The server captures snapshots of `skuSnapshot`, `nameSnapshot`, and `unitPriceSnapshot` in `SalesItem`.
3. **No stock deduction occurs** while the order is in `DRAFT`.

#### B. Order Confirmation (`DRAFT -> CONFIRMED`)
When a user approves a draft challan:
1. Express executes a **Prisma `$transaction`**:
   - Iterates through every line item in the challan.
   - Fetches target product stock quantity.
   - **Validation**: If `product.stockQuantity < item.quantity`, the transaction immediately aborts and throws a `400 Bad Request` ("Insufficient stock for SKU...").
   - **Stock Deduction**: Decrements `product.stockQuantity` by `item.quantity`.
   - **Audit Record**: Inserts a new record into `InventoryMovement` (`movementType: OUT`, reason: `Sales Challan #CH-... Confirmed`).
   - Updates `SalesChallan` status to `CONFIRMED` and sets `confirmedAt` and `confirmedById`.

#### C. Order Cancellation (`CONFIRMED -> CANCELLED`)
If a confirmed order is returned or cancelled:
1. Express executes a **Prisma `$transaction`**:
   - **Stock Restoration**: Increments `product.stockQuantity` by `item.quantity` for each item.
   - **Audit Record**: Inserts a new record into `InventoryMovement` (`movementType: IN`, reason: `Sales Challan #CH-... Cancelled (Stock Restored)`).
   - Updates `SalesChallan` status to `CANCELLED`.

---

## 4. Security & Hardening Measures

- **JWT Authentication**: Signed with HMAC-SHA256 and configurable expiration (`7d`). Token passed via `Authorization: Bearer <token>` header.
- **Password Hashing**: Salted hashing via `bcrypt` with cost factor 10.
- **Request Validation**: All incoming requests (`body`, `query`, `params`) strictly sanitized and typed via `Zod` schemas before hitting controllers.
- **HTTP Security Headers**: Powered by `helmet`.
- **CORS Protection**: Configured with origins whitelist.
- **Rate Limiting**: Rate limiter capping 200 requests per 15-minute window per IP.
