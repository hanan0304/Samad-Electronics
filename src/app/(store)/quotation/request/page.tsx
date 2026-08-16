import type { Metadata } from "next";
import Link from "next/link";
import { Zap, ArrowLeft } from "lucide-react";
import { QuotationForm } from "@/components/forms/quotation-form";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { buttonClasses } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = buildMetadata({
  title: "Send a Quotation Request",
  description:
    "Send us the list of items in your cart and we'll reply with our best prices — ideal for mixed lists and large construction projects.",
  path: "/quotation/request",
});

/**
 * Cart-based quotation request.
 *
 * The instant quotation at /quotation only covers one brand at a time. This
 * page handles the other case: a customer who has built a mixed cart and wants
 * the shop to price the whole list. It saves a Quotation row, so the request
 * shows up under Admin → Quotations.
 */
export default function QuotationRequestPage() {
  return (
    <div className="container-page py-6 pb-16">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Request Quotation", path: "/quotation" },
          { name: "Send your list", path: "/quotation/request" },
        ]}
      />

      <div className="mt-4 max-w-2xl">
        <h1 className="text-2xl font-extrabold text-brand-dark sm:text-3xl">
          Send us your list
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          We&apos;ll price everything in your cart and get back to you with our
          best rates — ideal for mixed lists and larger projects in{" "}
          {siteConfig.city}.
        </p>
      </div>

      {/* Point people at the faster route when it suits them */}
      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl bg-brand-light/60 p-4 ring-1 ring-brand/10">
        <Zap className="h-5 w-5 shrink-0 text-accent" />
        <p className="flex-1 text-sm text-ink">
          Want prices <strong>right now</strong>? Pick a single company and get
          an instant quotation on screen — no waiting.
        </p>
        <Link
          href="/quotation"
          className={buttonClasses("outline", "sm", "shrink-0")}
        >
          <ArrowLeft className="h-4 w-4" /> Instant quotation
        </Link>
      </div>

      <div className="mt-8">
        <QuotationForm />
      </div>
    </div>
  );
}
