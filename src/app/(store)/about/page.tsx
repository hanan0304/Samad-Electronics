import type { Metadata } from "next";
import Link from "next/link";
import {
  Zap,
  Droplets,
  Lightbulb,
  BadgeCheck,
  Users,
  MapPin,
  Check,
  Cable,
  Fan,
  Sun,
} from "lucide-react";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import {
  CertificatesSection,
  type CertificateCardDTO,
} from "@/components/about/certificates-section";
import { buttonClasses } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = buildMetadata({
  title: `About ${siteConfig.name} — Electrical & Sanitary Store in ${siteConfig.city} (Since 2000)`,
  description: `${siteConfig.name}, ${siteConfig.city} — authorized distributor of Popular Pipes (UPVC, PPRC, water tanks, ducts). Original cables (Pakistan Cables, GM, Fast, Newage), switches & breakers (Schneider, Terasaki, Hyundai, Legrand), fans, SMD lighting, sanitary ware and solar. Genuine products, best prices, trusted since 2000.`,
  path: "/about",
});

/** The full range we carry, with the brands stocked in each category. */
const RANGE = [
  {
    Icon: Cable,
    title: "Cables — 100% original",
    brands: [
      "Pakistan Cables",
      "GM Cables",
      "Fast Cables",
      "Newage Cables",
      "English Cables",
      "Pak Cables",
    ],
  },
  {
    Icon: Zap,
    title: "Electrical",
    note: "Switches, sockets, breakers, changeovers, submeters & DBs.",
    brands: ["Schneider", "Terasaki", "Hyundai", "Legrand"],
  },
  {
    Icon: Fan,
    title: "Fans",
    brands: ["Royal", "SK", "Pak Fan", "Taimoor", "Hino"],
  },
  {
    Icon: Lightbulb,
    title: "Lighting",
    note: "SMD bulbs and flood lights.",
    brands: ["Philips", "Pak Light", "Lahore Light", "Alva"],
  },
  {
    Icon: Droplets,
    title: "Sanitary",
    note: "All local and imported brands.",
    brands: ["Popular Pipes", "Dura Flow", "Faisal", "TU"],
  },
  {
    Icon: Sun,
    title: "Also available",
    brands: ["Fancy lighting", "Solar products"],
  },
];

export default async function AboutPage() {
  let certificates: CertificateCardDTO[] = [];
  try {
    const rows = await prisma.certificate.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, logoUrl: true, fileUrl: true },
    });
    certificates = rows;
  } catch {
    /* DB not ready — the section simply hides */
  }

  return (
    <div className="container-page py-6">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "About", path: "/about" }]} />

      <div className="mt-4 max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Since 2000
        </span>
        <h1 className="mt-2 text-2xl font-extrabold text-brand-dark sm:text-3xl">
          {siteConfig.name} — Electrical &amp; Sanitary Store in {siteConfig.city}
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          For over two decades {siteConfig.name} has supplied builders, electricians,
          plumbers and homeowners across {siteConfig.city} with genuine electrical
          goods, sanitary ware and decorative lighting — everything under one roof, so
          you never have to run between markets for switches, pipes and lights.
        </p>
      </div>

      {/* Trust badges */}
      <div data-reveal className="mt-6 flex flex-wrap gap-3">
        {[
          "Genuine products",
          "Best prices",
          "Trusted since 2000",
        ].map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm ring-1 ring-line"
          >
            <Check className="h-4 w-4 shrink-0 text-accent" /> {t}
          </span>
        ))}
      </div>

      {/* Authorized distributor highlight */}
      <div
        data-reveal
        className="mt-8 overflow-hidden rounded-2xl bg-brand-darker p-6 text-white sm:p-8"
      >
        <div className="relative">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-accent-bright">
            Authorized Distributor
          </span>
          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
            Popular Pipes
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/80">
            UPVC &amp; PPRC piping systems, water tanks and ducts — supplied
            direct as an authorized distributor.
          </p>
        </div>
      </div>

      {/* Full range, by category */}
      <div className="mt-10">
        <h2 className="text-xl font-extrabold text-brand-dark sm:text-2xl">
          What we stock
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RANGE.map(({ Icon, title, note, brands }) => (
            <div
              key={title}
              data-reveal
              className="rounded-xl bg-white p-5 shadow-card ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-light text-brand">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-3 font-bold text-ink">{title}</h3>
              {note && <p className="mt-1 text-sm text-muted">{note}</p>}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {brands.map((b) => (
                  <span
                    key={b}
                    className="rounded-md bg-paper px-2 py-1 text-xs font-semibold text-brand-dark ring-1 ring-line"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <h2 className="mt-12 text-xl font-extrabold text-brand-dark sm:text-2xl">
        Why customers choose us
      </h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { Icon: BadgeCheck, title: "Genuine Quality", desc: "Products from reliable, well-known brands." },
          { Icon: Users, title: "Trusted by Builders", desc: "Electricians, plumbers and homeowners rely on us." },
          { Icon: MapPin, title: `Local to ${siteConfig.city}`, desc: "Friendly service and fast local supply." },
        ].map(({ Icon, title, desc }) => (
          <div key={title} className="rounded-xl bg-white p-5 shadow-card ring-1 ring-black/5">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-light text-brand">
              <Icon className="h-6 w-6" />
            </span>
            <h3 className="mt-3 font-bold text-ink">{title}</h3>
            <p className="mt-1 text-sm text-muted">{desc}</p>
          </div>
        ))}
      </div>

      {/* Official certificates — managed from Admin → Certificates */}
      <CertificatesSection items={certificates} />

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          { href: "/electric", label: "Electric", Icon: Zap },
          { href: "/sanitary", label: "Sanitary", Icon: Droplets },
          { href: "/fancy-lights", label: "Fancy Lights", Icon: Lightbulb },
        ].map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-xl bg-white p-5 shadow-card ring-1 ring-black/5 hover:ring-brand/30"
          >
            <Icon className="h-8 w-8 text-brand" />
            <span className="font-bold text-ink">Shop {label}</span>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-2xl bg-gradient-to-br from-brand-dark to-brand p-8 text-center text-white">
        <h2 className="text-xl font-extrabold">Building or renovating in {siteConfig.city}?</h2>
        <p className="mx-auto mt-2 max-w-xl text-white/85">
          Browse our full range online, place an order, or request a quotation for your
          whole project — all in a few clicks.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/products" className={buttonClasses("accent", "lg")}>
            Browse Products
          </Link>
          <Link href="/contact" className={buttonClasses("outline", "lg", "border-white/40 !text-white hover:bg-white/10")}>
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
