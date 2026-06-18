# Ganga Maxx — Warehouse Management System

A production-grade **B2B Cleaning & Hygiene Product Warehouse Management System** built with React, Express, and Supabase.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + TypeScript + Tailwind CSS v4 |
| Backend | Express 5 + TypeScript (via `tsx`) |
| Database | Supabase (PostgreSQL + Auth + Realtime) |
| State | Zustand |
| Data Fetching | TanStack Query v5 |
| Charts | Recharts |
| UI Components | shadcn/ui |

---

## Project Structure

```
├── backend/                 # Express API server
│   ├── src/
│   │   ├── routes/          # 12 route files (auth, products, stock, orders, etc.)
│   │   ├── services/        # Business logic (stock FIFO, reorder, reports)
│   │   ├── middleware/      # auth, validate, requireRole
│   │   └── utils/           # supabase client, error classes
│   └── .env.example
├── frontend/                # React SPA
│   ├── src/
│   │   ├── pages/           # 40+ page components
│   │   ├── components/      # layout + shared components
│   │   ├── api/             # axios domain modules
│   │   ├── store/           # Zustand stores
│   │   └── hooks/           # useAuth
│   └── .env.example
└── supabase/
    ├── migrations/          # Full schema SQL (run first!)
    └── seed.sql             # Sample data
```

---

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → New project
2. Note your **Project URL** and **Anon Key** from Settings → API
3. Note your **Service Role Key** (keep this secret!)

### 2. Run Database Migrations

In the Supabase dashboard → SQL Editor, paste and run the contents of:

```
supabase/migrations/001_initial_schema.sql
```

This creates all tables, RLS policies, indexes, and triggers.

### 3. Load Seed Data (Optional)

In the Supabase SQL Editor, paste and run:

```
supabase/seed.sql
```

This creates sample warehouses, product categories, and a super_admin user.

**Default login after seeding:**
- Email: `admin@gangamaxx.com`
- Password: `Admin@123`

### 4. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=3001
NODE_ENV=development
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FRONTEND_URL=http://localhost:5173
```

Install dependencies and start:

```bash
npm install
npm run dev
```

Backend will start on **http://localhost:3001**

### 5. Configure Frontend

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001/api
```

Install dependencies and start:

```bash
npm install
npm run dev
```

Frontend will start on **http://localhost:5173**

---

## Features

### 📦 Inventory Management
- Real-time stock dashboard across all warehouses
- Inward entry with batch/lot tracking
- FIFO-based outward stock deduction
- Atomic stock transfers between warehouses
- Manual stock adjustments with reason codes
- Expiry date tracking with automated alerts

### 📋 Order Management
- Full order lifecycle: Draft → Confirmed → Processing → Dispatched → Delivered
- One-click dispatch triggers FIFO stock deduction for all line items
- Line-item level pricing with discounts

### 💬 Quotation Builder
- Create professional quotations with line items
- Status workflow: Draft → Sent → Accepted/Rejected
- One-click conversion from Quotation to Order

### 🏢 Institution Management
- Hospital, Hotel, School, Corporate client profiles
- Credit limit management and outstanding balance tracking
- Credit aging report (0-30, 31-60, 61-90, 90+ days)

### 🚚 Delivery Management
- Create delivery runs grouping multiple dispatched orders
- Per-item status updates: Delivered / Failed / Rescheduled
- Driver and vehicle assignment

### 📊 Reports (all exportable to CSV)
- Stock Summary by warehouse & category
- Expiry Report (configurable lookahead up to 90 days)
- Credit Aging Report with bucket analysis
- Movement Ledger (full audit trail)
- Reorder Reminders (auto-triggered on low stock)
- Sales Summary with revenue charts

### 🔒 Compliance
- MSDS, COA, Safety Labels, Regulatory Certs
- File upload with expiry tracking
- Product-level document linkage

### 👥 Role-Based Access
| Role | Access |
|------|--------|
| `super_admin` | Full access |
| `sales_admin` | Products, orders, quotations, institutions, reports |
| `warehouse_staff` | Stock, movements, inward/outward |
| `salesman` | Orders, quotations, visits |
| `delivery_coordinator` | Deliveries |
| `accounts_manager` | Institutions, credit, aging report |
| `compliance_admin` | Compliance documents |

---

## API Endpoints

| Module | Base Path |
|--------|-----------|
| Auth | `POST /api/auth/login` |
| Products | `GET/POST/PATCH/DELETE /api/products` |
| Stock | `GET /api/stock`, `POST /api/stock/inward|outward|transfer|adjust` |
| Movements | `GET /api/movements` |
| Orders | `GET/POST /api/orders`, `POST /api/orders/:id/dispatch` |
| Quotations | `GET/POST /api/quotations`, `POST /api/quotations/:id/convert` |
| Institutions | `GET/POST /api/institutions`, `GET /api/institutions/:id/credit` |
| Deliveries | `GET/POST /api/deliveries`, `PATCH /api/deliveries/:id/items/:itemId` |
| Visits | `GET/POST /api/visits` |
| Compliance | `GET/POST /api/compliance/documents` |
| Reports | `GET /api/reports/stock-summary|movement-summary|expiry-report|reorder-report|aging-report|sales-summary` |
| Settings | `GET /api/settings/warehouses|categories` |

All report endpoints support `?format=csv` for CSV download.

---

## Development Scripts

```bash
# Backend
npm run dev          # Start with tsx watch mode (hot reload)
npm run build        # Compile TypeScript
npm run start        # Run compiled JS

# Frontend
npm run dev          # Vite dev server (hot reload)
npm run build        # Production build
npm run preview      # Preview production build
```

---

## Environment Variables Reference

### Backend `.env`
```env
PORT=3001
NODE_ENV=development
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=http://localhost:3001/api
```
