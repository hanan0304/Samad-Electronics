import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Package } from "lucide-react";
import type { BrandGroupDTO } from "@/lib/data";
import { ProductGrid } from "@/components/product/product-grid";
import { buttonClasses } from "@/components/ui/button";

/**
 * Catalogue laid out company by company.
 *
 * Each company gets its own section with a preview of its range and a link
 * through to everything it makes, so a customer can jump straight to the brand
 * they trust instead of scrolling one long mixed list.
 */
export function BrandSections({
  groups,
  basePath,
  perBrand = 4,
  whatsappNumber,
}: {
  groups: BrandGroupDTO[];
  /** "/products", "/electric", … — the list this section filters within. */
  basePath: string;
  perBrand?: number;
  /** Passed through so every product card gets a WhatsApp enquiry button. */
  whatsappNumber?: string;
}) {
  if (groups.length === 0) return null;

  return (
    <div className="space-y-12">
      {/* Jump-to bar so long pages stay navigable */}
      {groups.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {groups.map((g) => (
            <a
              key={g.brand?.slug ?? "other"}
              href={`#brand-${g.brand?.slug ?? "other"}`}
              className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-semibold text-brand shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
            >
              {g.brand?.name ?? "Other"}
              <span className="ml-1.5 text-xs font-medium tabular-nums text-muted">
                {g.total}
              </span>
            </a>
          ))}
        </div>
      )}

      {groups.map((g) => {
        const slug = g.brand?.slug ?? "other";
        const name = g.brand?.name ?? "Other products";
        const viewAll = g.brand ? `${basePath}?brand=${g.brand.slug}` : null;

        return (
          <section
            key={slug}
            id={`brand-${slug}`}
            data-reveal
            className="scroll-mt-28"
          >
            {/* Company header */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
              <div className="flex items-center gap-3">
                {g.brand?.logoUrl ? (
                  <div className="relative h-11 w-24 shrink-0">
                    <Image
                      src={g.brand.logoUrl}
                      alt={name}
                      fill
                      sizes="96px"
                      className="object-contain object-left"
                    />
                  </div>
                ) : (
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-light text-brand">
                    <Package className="h-5 w-5" />
                  </span>
                )}
                <div>
                  <h2 className="text-xl font-extrabold text-brand-dark sm:text-2xl">
                    {name}
                  </h2>
                  <p className="text-sm text-muted">
                    <span className="tabular-nums">{g.total}</span> product
                    {g.total === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              {viewAll && g.total > perBrand && (
                <Link
                  href={viewAll}
                  className={buttonClasses("outline", "sm", "shrink-0")}
                >
                  View all {g.total} <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>

            <ProductGrid products={g.products} whatsappNumber={whatsappNumber} />

            {viewAll && g.total > perBrand && (
              <div className="mt-5 text-center sm:hidden">
                <Link href={viewAll} className={buttonClasses("outline", "md")}>
                  View all {g.total} from {name}{" "}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
