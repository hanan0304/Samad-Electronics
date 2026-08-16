import Link from "next/link";
import Image from "next/image";
import {
  Zap,
  Droplets,
  Lightbulb,
  Truck,
  BadgeCheck,
  Tags,
  ArrowRight,
  Store,
  FileText,
} from "lucide-react";
import {
  getFeaturedProducts,
  getNewArrivals,
  getBrandCards,
  type BrandCardDTO,
} from "@/lib/data";
import { ProductGrid } from "@/components/product/product-grid";
import { HeroSlider } from "@/components/home/hero-slider";
import { BrandMarquee } from "@/components/home/brand-marquee";
import { buttonClasses } from "@/components/ui/button";
import { getWhatsAppNumber } from "@/lib/settings";
import { siteConfig } from "@/config/site";

export const revalidate = 600;

const DEPARTMENTS = [
  {
    href: "/electric",
    label: "Electric",
    desc: "Switches, sockets, wires, breakers, LED bulbs, fans & more.",
    Icon: Zap,
    color: "from-brand to-brand-dark",
    photo: "/departments/electric.jpg",
  },
  {
    href: "/sanitary",
    label: "Sanitary",
    desc: "Faucets, wash basins, commodes, showers, pipes & fittings.",
    Icon: Droplets,
    color: "from-brand-mid to-brand-dark",
    photo: "/departments/sanitary.jpg",
  },
  {
    href: "/fancy-lights",
    label: "Fancy Lights",
    desc: "Chandeliers, wall lights, pendants, LED strips & outdoor lights.",
    Icon: Lightbulb,
    color: "from-accent-bright to-accent-dark",
    photo: "/departments/fancy-lights.jpg",
  },
];

const REASONS = [
  {
    Icon: BadgeCheck,
    title: "Genuine, brand-name stock",
    desc: "Philips, Osram, Havells, Sonex, Porta and more — no copies.",
  },
  {
    Icon: Tags,
    title: "Honest, up-to-date prices",
    desc: "Rates are updated by the shop, so what you see is what you pay.",
  },
  {
    Icon: Store,
    title: "One shop for all three trades",
    desc: "Electric, sanitary and lighting under one roof — fewer trips.",
  },
  {
    Icon: Truck,
    title: "Built for site work",
    desc: `Bulk quantities and fast local delivery across ${siteConfig.city}.`,
  },
];

const FEATURES = [
  { Icon: Tags, title: "Live Daily Prices", desc: "Up-to-date rates, updated by the shop every day." },
  { Icon: BadgeCheck, title: "Trusted Brands", desc: "Genuine products from names you can rely on." },
  { Icon: Truck, title: "Fast Local Service", desc: `Serving builders & homes across ${siteConfig.city}.` },
  { Icon: Store, title: "Order or Quote Online", desc: "Place an order or request a quotation in minutes." },
];

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof getFeaturedProducts>> = [];
  let latest: Awaited<ReturnType<typeof getNewArrivals>> = [];
  let brands: BrandCardDTO[] = [];
  try {
    [featured, latest, brands] = await Promise.all([
      getFeaturedProducts(8),
      getNewArrivals(8),
      getBrandCards(),
    ]);
  } catch {
    /* DB not ready yet — render page with empty product sections */
  }

  // Every product card gets a direct WhatsApp enquiry button. Built from the
  // number (not the short link) so the product name can be pre-filled.
  const whatsappNumber = await getWhatsAppNumber();

  return (
    <>
      {/* Hero slider */}
      <HeroSlider />

      {/* Feature strip */}
      <section data-reveal className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container-page grid grid-cols-2 gap-4 py-6 lg:grid-cols-4">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-light text-brand">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-ink">{title}</p>
                <p className="text-xs text-muted">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Department cards */}
      <section data-reveal className="container-page py-12">
        <h2 className="text-2xl font-extrabold text-brand-dark">Shop by department</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {DEPARTMENTS.map(({ href, label, desc, Icon, color, photo }) => (
            <Link
              key={href}
              href={href}
              className="group overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-black/5"
            >
              {/* Same box as before — the photo sits behind, so the size is unchanged. */}
              <div className="relative overflow-hidden p-6 text-white">
                <Image
                  src={photo}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${color} opacity-75`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                <div className="relative">
                  <Icon className="h-10 w-10 drop-shadow" />
                  <h3 className="mt-3 text-xl font-bold drop-shadow">{label}</h3>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm text-muted">{desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand group-hover:gap-2">
                  Explore {label} <ArrowRight className="h-4 w-4 transition-all" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quotation call-to-action — handled on our own site, not WhatsApp */}
      <section data-reveal className="container-page pb-8">
        <div className="relative overflow-hidden rounded-2xl bg-brand-darker px-6 py-8 sm:px-10 sm:py-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-accent/30 blur-3xl"
          />
          <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                Get an Instant Quotation
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75">
                Send us your list and we reply with prices and stock the same
                day — request it right here on our website, no messaging app
                needed.
              </p>
            </div>
            <Link
              href="/quotation"
              className={buttonClasses("accent", "lg", "shrink-0")}
            >
              <FileText className="h-4 w-4" />
              Request a Quotation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Brands we stock — scrolls continuously, driven by Admin → Brands */}
      <BrandMarquee brands={brands} />

      {/* Featured products */}
      {featured.length > 0 && (
        <section data-reveal className="container-page py-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-brand-dark">Featured products</h2>
            <Link href="/products" className="text-sm font-semibold text-brand hover:underline">
              View all →
            </Link>
          </div>
          <ProductGrid
            products={featured}
            priorityCount={4}
            whatsappNumber={whatsappNumber}
          />
        </section>
      )}

      {/* Latest products */}
      {latest.length > 0 && (
        <section data-reveal className="container-page py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-brand-dark">New arrivals</h2>
            <Link href="/products?sort=newest" className="text-sm font-semibold text-brand hover:underline">
              View all →
            </Link>
          </div>
          <ProductGrid products={latest} whatsappNumber={whatsappNumber} />
        </section>
      )}

      {/* Local SEO content */}
      <section data-reveal className="border-t border-line bg-white/80 backdrop-blur-sm">
        <div className="container-page py-14 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.45fr_1fr] lg:gap-16">
            {/* Prose — the keyword-rich copy that helps us rank locally */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                Serving {siteConfig.city} since day one
              </span>
              <h2 className="mt-3 text-2xl font-extrabold text-brand-dark sm:text-3xl">
                Electrical, sanitary &amp; lighting shop in {siteConfig.city}
              </h2>
              <div className="mt-3 h-1 w-16 rounded-full bg-accent" />

              <div className="mt-6 space-y-4 text-[15px] leading-[1.8] text-muted">
                <p>
                  Looking for a reliable{" "}
                  <strong className="font-semibold text-ink">
                    electric shop in {siteConfig.city}
                  </strong>{" "}
                  or a trusted{" "}
                  <strong className="font-semibold text-ink">sanitary shop</strong> for
                  your new home or renovation? {siteConfig.name} stocks a complete range
                  of electrical goods, bathroom fittings, sanitary ware and decorative{" "}
                  <strong className="font-semibold text-ink">fancy lights</strong> — all
                  in one place. From wall switches, wires and circuit breakers to wash
                  basins, commodes, faucets and chandeliers, we help builders,
                  electricians, plumbers and homeowners get quality products at fair
                  prices.
                </p>
                <p>
                  Browse our full range online with live prices, add items to your cart,
                  and either place your order or request a quotation directly on this
                  website. Building or renovating a home in {siteConfig.city}? Visit our
                  shop or contact us today.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/products" className={buttonClasses("primary", "md")}>
                  Browse Products <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/contact" className={buttonClasses("outline", "md")}>
                  Visit Our Shop
                </Link>
              </div>
            </div>

            {/* Why-choose-us panel */}
            <aside className="rounded-2xl bg-brand-light/70 p-6 ring-1 ring-brand/10 sm:p-8">
              <h3 className="text-lg font-extrabold text-brand-dark">
                Why {siteConfig.city} builds with us
              </h3>
              <ul className="mt-5 space-y-4">
                {REASONS.map(({ Icon, title, desc }) => (
                  <li key={title} className="flex gap-3.5">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-accent shadow-sm">
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-ink">{title}</p>
                      <p className="mt-0.5 text-[13px] leading-relaxed text-muted">
                        {desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-6 border-t border-brand/10 pt-5">
                <p className="text-[13px] text-muted">
                  Need prices for a full list of items?
                </p>
                <Link
                  href="/quotation"
                  className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:gap-2.5 transition-all"
                >
                  Request a free quotation <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
