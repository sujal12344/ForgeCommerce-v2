# ForgeCommerce — E-commerce Admin Dashboard

A full-stack, production-ready **multi-store e-commerce admin panel** built with Next.js 15, Prisma, and Clerk. Create and manage multiple independent storefronts, each with its own billboards, categories, products, orders, and analytics — all from a single dashboard. Exposes a public REST API that any frontend (e.g. [ForgeCommerce Store](https://forge-ecomm-store.vercel.app)) can consume.

![CI](https://github.com/sujal12344/ForgeCommerce-v2/actions/workflows/ci.yml/badge.svg)

---

## Features

- **Multi-store** — create unlimited stores, each fully isolated
- **Billboards** — full-width image banners with labels, assignable to categories
- **Categories, Colors, Sizes** — manage product attributes
- **Products** — images (Cloudinary), price, Markdown description, YouTube URL, featured/archived flags
- **Orders** — Stripe Checkout integration, webhook-driven order processing
- **Dashboard analytics** — revenue, sales count, products in stock, monthly revenue graph, recent sales
- **Public REST API** — every store exposes `/api/[storeId]/...` endpoints for products, categories, colors, sizes, billboards, orders and checkout
- **Authentication** — Clerk (sign-in / sign-up, demo login)
- **Dark / Light theme** — persisted via `next-themes`
- **JSON bulk editor** — quickly add multiple billboards/categories/colors/sizes at once
- **Sample data** — one-click seed with realistic demo data
- **Paste-to-upload** — Ctrl+V clipboard paste for product images

---

## Tech Stack

| Layer         | Technology                                              |
| ------------- | ------------------------------------------------------- |
| Framework     | Next.js 15 (App Router, Turbopack)                      |
| Language      | TypeScript                                              |
| Styling       | Tailwind CSS v4 + shadcn/ui                             |
| Auth          | Clerk                                                   |
| Database      | PostgreSQL via Neon                                     |
| ORM           | Prisma 6 (with `@prisma/adapter-pg`)                    |
| Payments      | Stripe                                                  |
| File upload   | Cloudinary                                              |
| Data fetching | TanStack Query v5 (server prefetch + HydrationBoundary) |
| Email         | Resend                                                  |
| Deployment    | Vercel                                                  |

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (e.g. [Neon](https://neon.tech))
- Clerk account
- Stripe account
- Cloudinary account

### 1. Clone & install

```bash
git clone https://github.com/sujal12344/ForgeCommerce-v2.git
cd ForgeCommerce-v2
npm install
```

### 2. Environment variables

Create a `.env.local` file in the root:

```env
# Database
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Stripe
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Frontend store URL (for CORS headers on API routes)
FRONTEND_STORE_URL=http://localhost:3001

# Optional: demo store
NEXT_PUBLIC_DEMO_STORE_ID=
NEXT_PUBLIC_DEMO_STORE_NAME=Demo Store
NEXT_PUBLIC_DEMO_STORE_URL=
```

### 3. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Stripe Webhooks (local)

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

Set the printed signing secret as `STRIPE_WEBHOOK_SECRET`.

---

## API Reference

All routes are prefixed with `/api/[storeId]/`.

| Method                | Route                       | Description                     |
| --------------------- | --------------------------- | ------------------------------- |
| GET                   | `/billboards`               | List billboards                 |
| GET/POST/PATCH/DELETE | `/billboards/[billboardId]` | CRUD billboard                  |
| GET                   | `/categories`               | List categories                 |
| GET/POST/PATCH/DELETE | `/categories/[categoryId]`  | CRUD category                   |
| GET                   | `/products`                 | List products (filterable)      |
| GET/POST/PATCH/DELETE | `/products/[productId]`     | CRUD product                    |
| GET                   | `/colors`                   | List colors                     |
| GET                   | `/sizes`                    | List sizes                      |
| GET                   | `/orders`                   | List orders                     |
| POST                  | `/checkout`                 | Create Stripe checkout session  |
| GET                   | `/dashboard`                | Dashboard stats (auth required) |

---

## Deployment

The easiest deployment is [Vercel](https://vercel.com/new):

1. Push to GitHub
2. Import repo in Vercel
3. Add all environment variables
4. Deploy

CI runs automatically on every push/PR via GitHub Actions (lint + type-check + build). Production deploys are handled automatically by Vercel on push to `main`.

---

## CI/CD

GitHub Actions workflow at [`.github/workflows/ci.yml`](.github/workflows/ci.yml):

- **Trigger**: every push to `main` and every pull request
- **Steps**: install → lint → type-check → build
- Requires the env vars listed above to be added as **repository secrets** in GitHub → Settings → Secrets → Actions

---

## Project Structure

```
app/
  (auth)/          # Clerk sign-in / sign-up pages
  (dashboard)/     # Protected admin dashboard
    [storeId]/
      (routes)/    # Billboards, Categories, Colors, Sizes, Products, Orders
      layout.tsx   # Auth guard + Navbar
  (root)/          # Store-selector / onboarding
  api/             # REST API routes + webhooks
components/
  editors/         # JSON bulk editor
  modals-and-nav/  # Alert modal, Navbar, Store dropdown
  overview-actions/# Dashboard data-fetching helpers
  quick-adds/      # Sample data modals
  ui/              # shadcn/ui components
providers/         # Clerk, Theme, Toast, TanStack Query
prisma/            # Schema, client, seed
```

---

## License

MIT

