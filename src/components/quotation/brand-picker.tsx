import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { BrandCardDTO } from "@/lib/data";

/**
 * "Authorized dealer of" brand wall.
 *
 * Each card links straight to that brand's products, so a customer can pick the
 * company they want first and then choose items from just that range.
 * A brand shows its uploaded logo when it has one (Admin → Brands), and falls
 * back to a clean wordmark card until then.
 */
export function BrandPicker({ brands }: { brands: BrandCardDTO[] }) {
  if (brands.length === 0) return null;

  return (
    <section className="rounded-2xl bg-paper p-6 ring-1 ring-line sm:p-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Authorized dealer of
        </p>
        <h2 className="mt-2 text-xl font-extrabold text-brand-dark sm:text-2xl">
          Pick a company to see its range
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
          Tap any brand below to browse only that company&apos;s products, then
          add what you need to your quotation list.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {brands.map((b) => (
          <Link
            key={b.slug}
            href={`/quotation/${b.slug}`}
            className="group flex flex-col items-center justify-center gap-2 rounded-xl bg-white p-4 shadow-sm ring-1 ring-line transition duration-200 hover:-translate-y-1 hover:shadow-card hover:ring-brand/25"
          >
            <div className="grid h-14 w-full place-items-center">
              {b.logoUrl ? (
                <div className="relative h-12 w-full">
                  <Image
                    src={b.logoUrl}
                    alt={b.name}
                    fill
                    sizes="(min-width: 1024px) 160px, 40vw"
                    className="object-contain transition-transform duration-200 group-hover:scale-105"
                  />
                </div>
              ) : (
                <span className="text-center font-display text-base font-extrabold leading-tight text-brand-dark">
                  {b.name}
                </span>
              )}
            </div>
            {b.discountPercent > 0 ? (
              <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[11px] font-bold tabular-nums text-accent">
                {b.discountPercent}% off
              </span>
            ) : (
              <span className="text-[11px] font-medium text-muted">
                {b.productCount > 0
                  ? `${b.productCount} product${b.productCount === 1 ? "" : "s"}`
                  : "Ask us"}
              </span>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-accent transition-all hover:gap-2.5"
        >
          Or browse all products <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
