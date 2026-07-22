# Production Deployment Guide - Mini ERP + CRM Portal

This guide provides step-by-step instructions for deploying the **Frontend** on **Vercel**, the **Backend** on **Render**, and the **Database** on **Neon PostgreSQL**.

---

## Phase 1: Database Setup on Neon PostgreSQL

1. **Create Neon Account & Database**:
   - Go to [Neon.tech](https://neon.tech/) and create a new project named `mini-erp-crm`.
   - Copy the Pooled Connection String (`DATABASE_URL`).
   - Format: `postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

2. **Run Prisma Migrations & Seed Data**:
   - In your local backend directory, update `.env` with your Neon `DATABASE_URL`.
   - Execute:
     ```bash
     npx prisma migrate dev --name init
     npx prisma db seed
     ```

---

## Phase 2: Backend Deployment on Render

1. **Create Web Service on Render**:
   - Go to [Render Dashboard](https://dashboard.render.com/) -> **New Web Service**.
   - Connect your GitHub Repository containing the `backend/` folder.
   - Configure settings:
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install && npx prisma generate && npm run build`
     - **Start Command**: `npm start`

2. **Configure Environment Variables**:
   Add the following variables in Render dashboard:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: `<your-neon-postgres-url>`
   - `JWT_SECRET`: `<generated-random-secret-key>`
   - `JWT_EXPIRES_IN`: `7d`
   - `CORS_ORIGIN`: `https://your-frontend-app.vercel.app`

3. **Deploy**: Render will compile TypeScript and launch Express server on HTTPS. Copy the deployment URL (e.g. `https://mini-erp-backend.onrender.com`).

---

## Phase 3: Frontend Deployment on Vercel

1. **Create Vercel Project**:
   - Go to [Vercel Dashboard](https://vercel.com/) -> **Add New Project**.
   - Import your repository.
   - Configure settings:
     - **Framework Preset**: `Vite`
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

2. **Configure Environment Variables**:
   - `VITE_API_URL`: `https://mini-erp-backend.onrender.com/api/v1`

3. **Deploy**: Click **Deploy**. Vercel will build assets and issue an SSL certificate.

---

## Verification & Post-Deployment Testing

1. Open your Vercel App URL in browser.
2. Sign in with seed credentials:
   - **Email**: `admin@erp.com`
   - **Password**: `admin123`
3. Test customer creation, low stock alert view, and sales challan confirmation workflow.
