# Samad Traders — Online Store

A professional, SEO-first e-commerce website for **Samad Traders**, an electric,
sanitary & fancy-lights shop in **Lahore, Pakistan**.

Customers can browse the full product range with live prices, filter by category
(Electric / Sanitary / Fancy Lights) and brand, build a cart, and either **place an
order** or **request a quotation** right on the site. A full **admin panel** lets the
owner add/edit/delete products, change prices daily, upload photos, and view all
orders, quotation requests and contact inquiries.

## 🚀 First time? Read `SETUP.md`

**[SETUP.md](./SETUP.md)** is a step-by-step, non-technical guide to connect the
database, add your products, and launch the site online with your own domain.

## Tech stack

- **Next.js 16** (App Router) + React 19 + TypeScript + Tailwind CSS v4
- **Prisma** ORM + **Supabase** (Postgres database + image storage)
- **Vercel** for hosting
- SEO: per-page metadata, canonical URLs, automatic sitemap & robots, JSON-LD
  structured data (LocalBusiness, Product, Breadcrumbs), dynamic OG images, and
  Lahore-focused local content.

## Quick start (local development)

```bash
# 1. Copy the env template and fill in your Supabase values (see SETUP.md)
cp .env.example .env

# 2. Create tables and seed a starter catalog
npm run db:push
npm run db:seed

# 3. Run the site
npm run dev      # → http://localhost:3000  (admin at /admin)
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local dev server |
| `npm run build` | Production build (type-checks; builds without a live DB) |
| `npm run start` | Run the production build |
| `npm run db:push` | Sync the Prisma schema to the database |
| `npm run db:seed` | Create the admin user + sample catalog |
| `npm run db:studio` | Visual database editor |

## Project layout

```
src/
  app/                 Pages & routes (App Router)
    admin/(dashboard)/ Protected admin panel
    api/og/            Dynamic Open Graph image
    actions.ts         Customer server actions (order / quote / contact)
  components/          UI, product, cart, catalog, admin, forms, seo
  config/site.ts       Central shop config (name, contact, SEO keywords)
  lib/                 prisma, auth, supabase, seo, data, notify, settings, utils
prisma/
  schema.prisma        Database schema
  seed.ts              Seed script
```

See **[AGENTS.md](./AGENTS.md)** for architecture notes and conventions.
