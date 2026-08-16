"use client";

import { useRouter } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

type Brand = { name: string; slug: string };

export function CatalogToolbar({
  basePath,
  params,
  brands,
  showBrand = true,
  total,
}: {
  basePath: string;
  params: Record<string, string | undefined>;
  brands: Brand[];
  showBrand?: boolean;
  total: number;
}) {
  const router = useRouter();

  function update(key: string, value: string) {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v && k !== "page") sp.set(k, v);
    }
    if (value) sp.set(key, value);
    else sp.delete(key);
    const qs = sp.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-black/5 bg-white p-3">
      <p className="text-sm text-muted">
        <span className="font-semibold text-ink">{total}</span>{" "}
        {total === 1 ? "product" : "products"}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {showBrand && brands.length > 0 && (
          <select
            aria-label="Filter by brand"
            value={params.brand || ""}
            onChange={(e) => update("brand", e.target.value)}
            className="rounded-lg border border-brand/20 bg-white px-3 py-2 text-sm outline-none focus:border-brand"
          >
            <option value="">All brands</option>
            {brands.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
        )}
        <div className="flex items-center gap-1.5 rounded-lg border border-brand/20 bg-white px-2">
          <ArrowUpDown className="h-4 w-4 text-muted" />
          <select
            aria-label="Sort products"
            value={params.sort || "newest"}
            onChange={(e) => update("sort", e.target.value)}
            className="bg-transparent py-2 pr-1 text-sm outline-none"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name: A–Z</option>
          </select>
        </div>
      </div>
    </div>
  );
}
