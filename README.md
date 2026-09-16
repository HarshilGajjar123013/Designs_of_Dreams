# Designs of Dreams (DOD) — Monorepo

Production-ready e-commerce platform with a customer storefront and admin dashboard.

## Apps

| App | Path | Port | Description |
|-----|------|------|-------------|
| **DOD Shop** | `dodshop/` | 3000 | Customer-facing PWA storefront |
| **Admin Dashboard** | `Dashbord/` | 3002 | Admin panel for catalog, orders, CMS |
| **Database** | `packages/database/` | — | Shared Prisma schema & client |

## Quick Start

```bash
# Install dependencies (from repo root)
npm install

# Generate Prisma client
cd packages/database && npx prisma generate && cd ../..

# Copy env files and fill in values
cp .env.example .env
cp dodshop/.env.example dodshop/.env.local
cp Dashbord/.env.example Dashbord/.env.local

# Push database schema
cd packages/database && npx prisma db push && cd ../..

# Seed database (optional)
cd packages/database && npm run db:seed && cd ../..

# Run both apps (separate terminals)
cd dodshop && npm run dev
cd Dashbord && npm run dev
```

## Production Build

```bash
npm install
cd packages/database && npx prisma generate && cd ../..
cd dodshop && npm run build
cd ../Dashbord && npm run build
```

## Environment Variables

See `.env.example` in the repo root and each app folder.

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **Prisma** + MongoDB
- **Tailwind CSS 4**
- **Zustand** (state)
- **Cloudinary** (image uploads — admin)
- **PWA** (dodshop)

## Deployment (Vercel — 2 separate projects)

Repo: **https://github.com/HarshilGajjar123013/DODSHOP-FINAL**

Each app has its own `vercel.json` with monorepo install settings (`cd .. && npm install`).

### Project 1 — DOD Shop (storefront)

1. Go to [vercel.com/new](https://vercel.com/new) → **Import Git Repository**
2. Select **DODSHOP-FINAL**
3. Configure:
   - **Project Name:** `dodshop` (or your choice)
   - **Root Directory:** `dodshop` ← click Edit, select `dodshop`
   - **Framework:** Next.js (auto-detected)
   - **Build Command:** `npm run build` (default)
   - **Install Command:** `cd .. && npm install` (from `vercel.json`)
4. Add **Environment Variables** (Production):
   - `DATABASE_URL` — MongoDB Atlas/replica-set connection string
   - `JWT_SECRET` — strong secret (32+ chars)
   - `NEXT_PUBLIC_SITE_URL` — e.g. `https://your-dodshop.vercel.app`
5. Click **Deploy**

### Project 2 — Admin Dashboard

1. Go to [vercel.com/new](https://vercel.com/new) again → import **same repo**
2. Configure:
   - **Project Name:** `dodshop-dashboard`
   - **Root Directory:** `Dashbord`
   - **Install Command:** `cd .. && npm install`
3. Add **Environment Variables** (Production):
   - `DATABASE_URL` — same as dodshop
   - `JWT_SECRET` — same as dodshop
   - `JWT_EXPIRY` — `7d`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Click **Deploy**

### CLI deploy (after `vercel login`)

```powershell
cd scripts
.\deploy-vercel.ps1
```

Both apps share the same `DATABASE_URL`. Set `JWT_SECRET` to a strong random string (32+ bytes) in production.
