<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Samad Traders — project guide

E-commerce store for an electric / sanitary / fancy-lights shop in Lahore.
Customer storefront + admin panel + SEO-first. See `SETUP.md` for deployment.

## Stack
- **Next.js 16** (App Router) + React 19 + TypeScript, **Turbopack** build.
- **Tailwind CSS v4** (theme tokens in `src/app/globals.css` — brand colors:
  `brand`, `brand-dark`, `accent`, `ink`, `muted`).
- **Prisma 6** ORM → **Supabase Postgres**. Client at `src/lib/prisma.ts`.
- **Supabase Storage** for product images (`src/lib/supabase.ts`, service-role,
  server-only).
- Admin auth = JWT in httpOnly cookie via `jose` + `bcryptjs` (`src/lib/auth.ts`).
- Notifications = Resend email + pluggable WhatsApp (`src/lib/notify.ts`),
  best-effort, no-op when env vars unset.
- Validation with Zod (`src/lib/validations.ts`).

## Key conventions
- **Prices are Prisma `Decimal`** — always convert with `.toNumber()` / `Number()`
  before sending to client components or JSON-LD. `src/lib/data.ts` serializes to
  plain DTOs (`ProductCardDTO`, `ProductDetailDTO`) — use these on the storefront.
- **Every storefront data fetch is wrapped in try/catch** so pages render (empty
  state) even when the DB is unreachable — this lets `next build` succeed without a
  live database. Keep this pattern when adding pages.
- **SEO helpers in `src/lib/seo.ts`**: `buildMetadata()` for every page's metadata;
  JSON-LD builders (`localBusinessJsonLd`, `productJsonLd`, `breadcrumbJsonLd`,
  etc.) rendered via `<JsonLd>`. OG image is a dynamic route at `/api/og`.
- **Site config** in `src/config/site.ts` (defaults); editable shop settings live in
  the `Setting` DB row, merged by `src/lib/settings.ts` (DB overrides config).
- **Cart** is client-side only (`src/components/cart/cart-context.tsx`,
  localStorage). Orders & quotations both use the same cart; two checkout paths.
- **Server actions**: customer actions in `src/app/actions.ts` (order/quote/contact,
  re-price server-side from DB); admin actions in `src/app/admin/actions.ts`
  (all call `requireAdmin()` first; mutations call `revalidatePath("/", "layout")`).
- **Admin routes**: protected pages live under `src/app/admin/(dashboard)/` (route
  group with an auth layout). `/admin/login` is intentionally outside that group.
- **lucide-react is v1.x** — brand icons (Facebook, Instagram, etc.) were removed;
  use generic icons.

## Commands
- `npm run dev` — local dev server.
- `npm run build` — production build (also type-checks; succeeds without a DB).
- `npm run db:push` — sync schema to DB. `npm run db:seed` — seed catalog + admin.
- `npm run db:studio` — Prisma Studio.

## Data model (`prisma/schema.prisma`)
`Brand`, `Category` (has `Department` enum: ELECTRIC/SANITARY/FANCY_LIGHTS),
`Product` + `ProductImage`, `Order` + `OrderItem`, `Quotation` + `QuotationItem`,
`ContactInquiry`, `AdminUser`, `Setting` (singleton, id="main").
