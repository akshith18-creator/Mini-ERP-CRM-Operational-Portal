# Mini ERP + CRM Operation Portal

Production-ready **Mini ERP & CRM Portal** built with **Node.js, Express, TypeScript, Prisma ORM, PostgreSQL (Neon)** on the backend and **React (Vite), TypeScript, Tailwind CSS, React Query, Axios** on the frontend.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![Prisma](https://img.shields.io/badge/Prisma-5.14-2D3748)

---

## 🌟 Key Features

- **Role-Based Access Control (RBAC)**: Admin, Sales, Warehouse, and Accounts roles with restricted permissions.
- **CRM Module**: Manage Customers (Leads, Active, Inactive), Types (Retail, Wholesale, Distributor), Search/Filter, and interactive Follow-up timeline notes.
- **Product SKU Catalog**: SKU management, pricing, cost tracking, warehouse locations, and automated minimum stock alert warnings.
- **Inventory Control**: Audit-trailed stock movement log (IN/OUT). Prevents negative inventory via transactional locking.
- **Sales Delivery Challans**:
  - Auto-generated Challan Numbers (`CH-2026-00001`).
  - Item snapshotting (`skuSnapshot`, `unitPriceSnapshot`).
  - Workflow status state machine (`DRAFT -> CONFIRMED -> CANCELLED`).
  - Database transactions automatically deduct stock on confirmation and restore stock on cancellation.
- **Executive Dashboard**: Real-time sales revenue KPIs, customer pipelines, low stock alerts, and recent audit logs.
- **Modern Responsive UI**: Dark/Light mode theme toggle, glassmorphic cards, data tables, quick-fill demo login buttons, and toast notification popups.

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

---

### Step 1: Set Up Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure `.env` is configured (or copy default settings):
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL="postgresql://neondb_owner:npg_sample_pass@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
   JWT_SECRET=super_secret_jwt_key_mini_erp_crm_2026
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:5173
   ```

4. Generate Prisma Client:
   ```bash
   npm run prisma:generate
   ```

5. (Optional) Run Database Migration & Seed Demo Data:
   ```bash
   npm run prisma:seed
   ```

6. Start Backend Development Server:
   ```bash
   npm run dev
   ```
   The backend API server will start on `http://localhost:5000`.

---

### Step 2: Set Up Frontend

1. Open a new terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start Frontend Development Server:
   ```bash
   npm run dev
   ```
   The React Vite application will start on `http://localhost:5173`.

4. Open `http://localhost:5173` in your browser.

---

## 🔑 Demo Login Credentials

The seed script initializes accounts for all 4 operational roles (Password for all: `admin123`):

| Role | Email | Capabilities |
| :--- | :--- | :--- |
| **Admin** | `admin@erp.com` | Full system access, user role management, deletions |
| **Sales** | `sales@erp.com` | CRM Customer management, follow-up notes, sales challan creation |
| **Warehouse** | `warehouse@erp.com` | Product SKU catalog, stock movement intake/issuance, order confirmation |
| **Accounts** | `accounts@erp.com` | Revenue reports, challan audit, sales view |

---

## 📚 Documentation & Deliverables

- **System Architecture & Operational Engine**: See [HOW_IT_WORKS.md](file:///d:/ERP-CRM-Operation-Portal/HOW_IT_WORKS.md)
- **REST API Endpoints Guide**: See [docs/API_DOCUMENTATION.md](file:///d:/ERP-CRM-Operation-Portal/docs/API_DOCUMENTATION.md)
- **Postman Collection**: Import [docs/POSTMAN_COLLECTION.json](file:///d:/ERP-CRM-Operation-Portal/docs/POSTMAN_COLLECTION.json)
- **Production Deployment Guide**: See [docs/DEPLOYMENT_GUIDE.md](file:///d:/ERP-CRM-Operation-Portal/docs/DEPLOYMENT_GUIDE.md)
