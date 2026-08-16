import Link from "next/link";
import Image from "next/image";
import type { BrandCardDTO } from "@/lib/data";

/**
 * Continuously scrolling wall of the brands we stock.
 *
 * The list is rendered twice so the CSS animation can loop seamlessly at -50%.
 * Brands come straight from the database, so renaming one or uploading a logo
 * in Admin → Brands updates this strip automatically.
 */
export function BrandMarquee({ brands }: { brands: BrandCardDTO[] }) {
  if (brands.length === 0) return null;

  // Two passes = one seamless loop. `aria-hidden` on the copy so screen
  // readers and crawlers only see each brand once.
  const passes = [
    { key: "a", hidden: false },
    { key: "b", hidden: true },
  ];

  return (
    <section
      data-reveal
      aria-label="We are partners & dealers of these brands"
      className="border-y border-line bg-white/70 py-6 backdrop-blur-sm"
    >
      <p className="container-page mb-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        We are partners &amp; dealers of these brands
      </p>

      <div className="marquee">
        <div className="marquee-track">
          {passes.map(({ key, hidden }) => (
            <div key={key} className="marquee-group" aria-hidden={hidden}>
              {brands.map((b) => (
                <Link
                  key={`${key}-${b.slug}`}
                  href={`/products?brand=${b.slug}`}
                  tabIndex={hidden ? -1 : 0}
                  className="group mx-2 flex h-20 w-40 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl bg-white px-4 shadow-sm ring-1 ring-line transition-all duration-200 hover:-translate-y-1 hover:shadow-card hover:ring-brand/25"
                >
                  {b.logoUrl ? (
                    <div className="relative h-9 w-full">
                      <Image
                        src={b.logoUrl}
                        alt={b.name}
                        fill
                        sizes="160px"
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <span className="text-center font-display text-base font-extrabold leading-tight text-brand-dark">
                      {b.name}
                    </span>
                  )}
                  <span className="text-[10px] font-medium tabular-nums text-muted">
                    {b.productCount} product{b.productCount === 1 ? "" : "s"}
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
