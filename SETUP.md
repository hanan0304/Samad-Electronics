# Samad Traders — Setup & Launch Guide

This guide takes your website from code on this computer to a **live store on the
internet** that ranks on Google. No prior coding experience needed — just follow
each step in order. Set aside about 1 hour.

You will create **two free accounts**:

1. **Supabase** — stores your products, orders and photos (the "database").
2. **Vercel** — puts your website online (the "hosting").

---

## What you already have

A complete, professional store built with Next.js:

- **Storefront:** home, product catalog with Electric / Sanitary / Fancy Lights
  filters and brand filters, product pages, search, cart, place-order,
  request-quotation, contact + map, and SEO landing pages.
- **Admin panel** (at `/admin`): add/edit/delete products, change prices daily,
  upload photos, manage categories & brands, and view all orders, quotations and
  inquiries.
- **SEO built in:** per-page titles & descriptions, automatic sitemap, structured
  data (Google rich results), fast pages, and Lahore-focused local content.

---

## Step 1 — Create your database (Supabase)

1. Go to **https://supabase.com** and click **Start your project** → sign in with
   Google or GitHub.
2. Click **New project**. Choose:
   - **Name:** `samad-traders`
   - **Database Password:** click *Generate a password* and **copy it somewhere
     safe** (you'll need it in a moment).
   - **Region:** choose **Southeast Asia (Singapore)** — closest to Pakistan.
3. Wait ~2 minutes for it to finish setting up.

### 1a. Get your database connection strings

1. In your project, click the **Connect** button (top of the page).
2. Under **Connection string**, you'll see two tabs. You need both:
   - **Transaction / Connection pooling** string → this is your `DATABASE_URL`.
     It ends with something like `...pooler.supabase.com:6543/postgres`.
   - **Session / Direct connection** string → this is your `DIRECT_URL`.
     It ends with `...supabase.com:5432/postgres`.
3. In each string, replace `[YOUR-PASSWORD]` with the database password you saved.
4. On the `DATABASE_URL` (the `:6543` one), add this to the very end:
   `?pgbouncer=true&connection_limit=1`

### 1b. Get your API keys (for photo uploads)

1. Go to **Project Settings** (gear icon) → **API**.
2. Copy the **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL`.
3. Copy the **anon public** key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Copy the **service_role** key (click reveal) → this is
   `SUPABASE_SERVICE_ROLE_KEY`. **Keep this secret.**

### 1c. Create the photo storage bucket

1. Go to **Storage** (left menu) → **New bucket**.
2. Name it exactly: `product-images`
3. Turn **Public bucket** **ON**. Click **Save**.

---

## Step 2 — Fill in your settings (`.env` file)

Open the file named **`.env`** in the project folder (use Notepad or VS Code) and
fill in the values you just collected. It should look like this (with your real
values):

```
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

DATABASE_URL="postgresql://postgres.abcd:YourPassword@aws-...pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.abcd:YourPassword@aws-...supabase.com:5432/postgres"

NEXT_PUBLIC_SUPABASE_URL="https://abcd.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ...your-anon-key..."
SUPABASE_SERVICE_ROLE_KEY="eyJ...your-service-role-key..."
SUPABASE_STORAGE_BUCKET="product-images"

AUTH_SECRET="paste-a-long-random-string-here"
ADMIN_EMAIL="youremail@gmail.com"
ADMIN_PASSWORD="choose-a-strong-password"
```

- For **`AUTH_SECRET`**, open a terminal in the project folder and run:
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
  then paste the long string it prints.
- Set **`ADMIN_EMAIL`** and **`ADMIN_PASSWORD`** to what you'll use to log in to
  your admin panel. Choose a strong password.

(Email and WhatsApp alert settings are optional — see **Step 6**.)

---

## Step 3 — Set up the database tables & sample products

In a terminal opened in the project folder, run these two commands one at a time:

```
npm run db:push
npm run db:seed
```

- `db:push` creates all the tables in your Supabase database.
- `db:seed` creates your admin login and a starter catalog (brands, categories,
  and ~20 sample products) so the store isn't empty.

You should see green ✔ messages. If you see a connection error, double-check your
`DATABASE_URL` / `DIRECT_URL` and password in `.env`.

---

## Step 4 — See your store on this computer

Run:

```
npm run dev
```

Open **http://localhost:3000** in your browser — your store is live locally! 🎉

- Visit **http://localhost:3000/admin** and log in with the `ADMIN_EMAIL` and
  `ADMIN_PASSWORD` you set. Try adding a product and uploading a photo.

Press `Ctrl + C` in the terminal to stop it when done.

---

## Step 5 — Make it yours

1. **Shop details:** log in to `/admin` → **Settings**. Enter your real phone,
   WhatsApp number, email, shop address, and Google Maps links.
   - To get the **map embed URL**: open Google Maps, find your shop, click
     **Share → Embed a map → COPY HTML**, and paste only the part inside
     `src="..."`.
2. **Products:** in `/admin` → **Products**, delete the sample products you don't
   sell, and add your real ones with photos and prices. Change prices anytime here.
3. **(Optional) Text tweaks:** the file `src/config/site.ts` holds default shop
   info and the SEO keywords — you can edit it, but the Settings page covers most
   needs.

---

## Step 6 — Turn on order alerts (optional but recommended)

So you get an **email + WhatsApp** message for every new order/quote/inquiry.

**Email (Resend):**
1. Sign up free at **https://resend.com**.
2. Create an **API key** and paste it into `.env` as `RESEND_API_KEY`.
3. Set `NOTIFY_EMAIL_TO` to your email address.
   (For the "from" address to work fully, verify a domain in Resend — until then
   Resend's test address is used.)

**WhatsApp alerts:** these need a WhatsApp Business API provider (Meta Cloud API or
Twilio). See the comments in `.env.example`. You can add this later — the site
works fine without it, and every submission is always saved in your admin panel.

---

## Step 7 — Put your store online (Vercel)

1. **Create a free GitHub account** at https://github.com (if you don't have one)
   and create a new **private** repository, e.g. `samad-traders`.
2. Upload this project to that repository. (If you're not sure how, ask your
   developer to `git push` it, or use GitHub Desktop.)
3. Go to **https://vercel.com** → sign in with GitHub → **Add New → Project** →
   import your `samad-traders` repository.
4. Before clicking Deploy, open **Environment Variables** and add **every line**
   from your `.env` file (copy each name and value). Set `NEXT_PUBLIC_SITE_URL`
   to your Vercel URL for now (e.g. `https://samad-traders.vercel.app`).
5. Click **Deploy**. In ~2 minutes your store is live on the internet.

> Your Supabase database is already online, so your live site and your local site
> share the same products and orders.

---

## Step 8 — Your domain & ranking on Google

1. **Buy a domain** (e.g. `samadtraders.pk` or `.com`) from any registrar.
2. In Vercel → your project → **Settings → Domains**, add your domain and follow
   the instructions to point it (update DNS at your registrar).
3. Update the `NEXT_PUBLIC_SITE_URL` environment variable in Vercel to your real
   domain (e.g. `https://www.samadtraders.pk`) and redeploy. This makes all SEO
   links, the sitemap, and structured data use your real domain.
4. **Google Search Console** (https://search.google.com/search-console): add your
   domain, verify it, and submit your sitemap: `https://your-domain/sitemap.xml`.
5. **Google Business Profile** (https://business.google.com): create/claim your
   shop listing with your address, phone, hours and photos. This is the single
   biggest thing for showing up in local "near me" and map searches in Lahore.

That's it — your professional, SEO-ready store is live. 🚀

---

## Everyday use

- **Change prices / add products / upload photos:** `/admin` → Products.
- **See new orders:** `/admin` → Orders (badge shows new count). Update each
  order's status as you process it.
- **Quotation requests & inquiries:** `/admin` → Quotations / Inquiries.

## Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Run the site locally for testing |
| `npm run build` | Build the production version |
| `npm run db:studio` | Open a visual database editor in your browser |
| `npm run db:seed` | Re-create the sample catalog (safe to re-run) |

## Troubleshooting

- **"Can't reach database server"** → your `DATABASE_URL`/`DIRECT_URL` or password
  in `.env` is wrong, or you skipped `npm run db:push`.
- **Photos won't upload** → check the Supabase keys and that the
  `product-images` bucket exists and is **Public**.
- **Admin login fails** → make sure you ran `npm run db:seed`, and use the exact
  `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`. Changing them in `.env` and
  re-running `npm run db:seed` resets the password.
