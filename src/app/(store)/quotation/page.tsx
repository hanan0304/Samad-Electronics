import type { Metadata } from "next";
import { MousePointerClick, ListChecks, Zap } from "lucide-react";
import { BrandPicker } from "@/components/quotation/brand-picker";
import { QuoteBasketBanner } from "@/components/quotation/quote-basket-banner";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { getBrandCards, type BrandCardDTO } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

/**
 * Always render fresh: brands, logos and discounts are changed daily from the
 * admin panel and a customer must never be shown a stale price.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Request a Quotation",
  description:
    "Request a price quotation for electrical, sanitary or lighting products in Lahore — choose your brand, pick your items and we reply with prices the same day.",
  path: "/quotation",
});

const STEPS = [
  {
    Icon: MousePointerClick,
    title: "Choose a company",
    desc: "Pick the brand you want prices for from the list below.",
  },
  {
    Icon: ListChecks,
    title: "Enter your quantities",
    desc: "Set how many of each item you need from that brand's range.",
  },
  {
    Icon: Zap,
    title: "Get your price instantly",
    desc: "Your full quotation appears on screen — save it as a PDF. Want more than one brand? Tap “Add other brand items”, pick another company, then build a combined quotation.",
  },
];

export default async function QuotationPage() {
  let brands: BrandCardDTO[] = [];
  try {
    brands = await getBrandCards();
  } catch {
    /* DB not ready — the page still renders without the brand wall */
  }

  return (
    <div className="container-page py-6 pb-16">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Request Quotation", path: "/quotation" },
        ]}
      />

      {/* Intro */}
      <div className="mt-4 max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Free · No obligation
        </span>
        <h1 className="mt-2 text-3xl font-extrabold text-brand-dark sm:text-4xl">
          Request a Quotation
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          Building or renovating in {siteConfig.city}? Tell us what you need and
          we&apos;ll send you our best prices — ideal for bulk orders and
          construction projects.
        </p>
      </div>

      {/* How it works */}
      <ol data-reveal className="mt-8 grid gap-4 sm:grid-cols-3">
        {STEPS.map(({ Icon, title, desc }, i) => (
          <li
            key={title}
            className="relative rounded-xl bg-white p-5 shadow-sm ring-1 ring-line"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-light text-brand">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-muted">
                Step {i + 1}
              </span>
            </div>
            <p className="mt-3 font-bold text-ink">{title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">{desc}</p>
          </li>
        ))}
      </ol>

      {/* Quotation basket — appears once items from any brand are added */}
      <div className="mt-8">
        <QuoteBasketBanner />
      </div>

      {/* Brand wall — the whole flow starts here */}
      <div data-reveal className="mt-6">
        <BrandPicker brands={brands} />
      </div>

      {/* How to mix brands */}
      <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-muted">
        <strong className="text-ink">Need items from more than one company?</strong>{" "}
        Open any brand, tick your quantities and press{" "}
        <strong className="text-ink">“Add other brand items”</strong>. Pick the
        next company and do the same. When you&apos;re done, press{" "}
        <strong className="text-ink">“Build combined quotation”</strong> to get a
        single quotation covering every brand.
      </p>
    </div>
  );
}
