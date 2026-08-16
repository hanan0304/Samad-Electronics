import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { QuoteBuilder } from "@/components/quotation/quote-builder";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { getBrandForQuote } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

type Params = Promise<{ brand: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { brand } = await params;
  let name = brand;
  try {
    const b = await getBrandForQuote(brand);
    if (b) name = b.name;
  } catch {
    /* fall back to the slug */
  }
  return buildMetadata({
    title: `${name} Quotation`,
    description: `Get an instant price quotation for ${name} products at ${siteConfig.name}, ${siteConfig.city}. Pick your items and see your total straight away.`,
    path: `/quotation/${brand}`,
  });
}

export default async function BrandQuotePage({ params }: { params: Params }) {
  const { brand: slug } = await params;

  let brand = null;
  try {
    brand = await getBrandForQuote(slug);
  } catch {
    /* DB unreachable — treated as not found below */
  }
  if (!brand) notFound();

  let shopName: string = siteConfig.name;
  let phone = "";
  try {
    const s = await getSettings();
    shopName = s.shopName || siteConfig.name;
    phone = s.phone || "";
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
            { name: brand.name, path: `/quotation/${brand.slug}` },
          ]}
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {brand.logoUrl ? (
              <div className="relative h-12 w-28 shrink-0">
                <Image
                  src={brand.logoUrl}
                  alt={brand.name}
                  fill
                  sizes="112px"
                  className="object-contain"
                />
              </div>
            ) : null}
            <div>
              <h1 className="text-2xl font-extrabold text-brand-dark sm:text-3xl">
                {brand.name} quotation
              </h1>
              <p className="mt-1 text-sm text-muted">
                Choose your quantities — your price appears instantly.
              </p>
            </div>
          </div>

          {brand.discountPercent > 0 && (
            <span className="rounded-xl bg-accent px-4 py-2 text-sm font-bold tabular-nums text-white shadow-sm">
              {brand.discountPercent}% off {brand.name}
            </span>
          )}
        </div>
      </div>

      <div className="mt-6">
        <QuoteBuilder
          brand={brand}
          shopName={shopName}
          phone={phone}
          website={siteConfig.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
        />
      </div>
    </div>
  );
}
