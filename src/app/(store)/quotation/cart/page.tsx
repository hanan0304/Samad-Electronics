import type { Metadata } from "next";
import Link from "next/link";
import { Zap, ArrowLeft } from "lucide-react";
import { CartQuote } from "@/components/quotation/cart-quote";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { buttonClasses } from "@/components/ui/button";
import { getSettings } from "@/lib/settings";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

/** Prices come straight from the DB when the sheet is built, so nothing to cache. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Your Quotation",
  description:
    "Your instant quotation — every item in your cart priced and grouped by brand, with dealer discounts applied. Save it as a PDF.",
  path: "/quotation/cart",
});

export default async function CartQuotationPage() {
  let shopName: string = siteConfig.name;
  let phone: string = siteConfig.contact.phone;
  try {
    const s = await getSettings();
    shopName = s.shopName || siteConfig.name;
    phone = s.phone || siteConfig.contact.phone;
  } catch {
    /* use config defaults */
  }

  return (
    <div className="container-page py-6 pb-16">
      <div className="no-print">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Request Quotation", path: "/quotation" },
            { name: "Your quotation", path: "/quotation/cart" },
          ]}
        />

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-extrabold text-brand-dark sm:text-3xl">
              Your quotation
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              Everything in your cart, priced and grouped by brand — original and
              discounted prices with your grand total. Save it as a PDF for your
              records.
            </p>
          </div>

          {/* Single-brand instant builder, for those who prefer it */}
          <div className="flex items-center gap-2 rounded-xl bg-brand-light/60 p-3 ring-1 ring-brand/10">
            <Zap className="h-4 w-4 shrink-0 text-accent" />
            <span className="text-xs text-ink">One company only?</span>
            <Link href="/quotation" className={buttonClasses("outline", "sm", "shrink-0")}>
              <ArrowLeft className="h-3.5 w-3.5" /> By brand
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <CartQuote
          shopName={shopName}
          phone={phone}
          website={siteConfig.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
        />
      </div>
    </div>
  );
}
