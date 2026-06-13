# Mini ERP: From Demand to Delivery

## Project Overview
This is a centralized ERP system for Shiv Furniture Works, managing the complete business flow from Sales to Manufacturing and Delivery.

## Technical Stack
- **Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL (Supabase)
- **Frontend:** React, TypeScript, Tailwind CSS v4, Lucide Icons, Axios

## Core Features
- **Product Management:** Track stock levels (On Hand, Reserved, Free to Use).
- **Sales Module:** Draft and Confirm Sales Orders. Automatic reservation of stock.
- **Purchase Module:** Replenish stock via Purchase Orders.
- **Manufacturing Module:** Produce finished goods using Bill of Materials (BoM).
- **MTO Automation:** Automatically triggers Manufacturing or Purchase orders on stock shortage during Sales confirmation.
- **Dashboard:** Real-time KPIs and stock alerts.

## How to Run

### 1. Backend
```bash
cd backend
npm install
# Ensure .env is configured with DATABASE_URL and DIRECT_URL
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Database Schema
The database is hosted on Supabase and managed via Prisma. 
To see the schema, check `backend/prisma/schema.prisma`.
To run migrations: `npx prisma migrate dev`.
