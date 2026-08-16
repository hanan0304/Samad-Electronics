import Link from "next/link";
import type { Department } from "@prisma/client";
import {
  getProducts,
  getBrands,
  getNavCategories,
  getProductsByBrand,
  type BrandGroupDTO,
} from "@/lib/data";
import { ProductGrid } from "@/components/product/product-grid";
import { BrandSections } from "@/components/catalog/brand-sections";
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { Pagination } from "@/components/catalog/pagination";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo";

function str(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export async function DepartmentView({
  department,
  label,
  href,
  intro,
  searchParams,
}: {
  department: Department;
  label: string;
  href: string;
  intro: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const brand = str(searchParams.brand);
  const sort = str(searchParams.sort) as
    | "newest"
    | "price-asc"
    | "price-desc"
    | "name"
    | undefined;
  const page = Math.max(1, Number(str(searchParams.page)) || 1);

  /** Unfiltered visits get the company-by-company layout. */
  const grouped = !brand && !sort;

  let result = {
    products: [],
    total: 0,
    page: 1,
    perPage: 12,
    totalPages: 1,
  } as Awaited<ReturnType<typeof getProducts>>;
  let brands: { name: string; slug: string }[] = [];
  let categories: { name: string; slug: string }[] = [];
  let groups: BrandGroupDTO[] = [];

  try {
    const [res, allBrands, nav, byBrand] = await Promise.all([
      getProducts({ department, brandSlug: brand, sort, page, perPage: 12 }),
      getBrands(),
      getNavCategories(),
      grouped
        ? getProductsByBrand({ department, perBrand: 4 })
        : Promise.resolve([] as BrandGroupDTO[]),
    ]);
    result = res;
    brands = allBrands;
    categories = nav[department].map((c) => ({ name: c.name, slug: c.slug }));
    groups = byBrand;
  } catch {
    /* DB not ready */
  }

  const params = { brand, sort };

  return (
    <div className="container-page py-6">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: label, path: href },
          ]),
          itemListJsonLd(result.products, label),
        ]}
      />

      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: label, path: href },
        ]}
      />

      <div className="mt-4 mb-4">
        <h1 className="text-2xl font-extrabold text-brand-dark sm:text-3xl">
          {label} in Lahore
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{intro}</p>
      </div>

      {categories.length > 0 && (
        <div data-reveal className="mb-5 flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="rounded-full border border-brand/20 bg-white px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand-light"
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <CatalogToolbar
        basePath={href}
        params={params}
        brands={brands}
        total={result.total}
      />

      {grouped && groups.length > 0 ? (
        <div className="mt-8">
          {/* Each brand section reveals itself — no wrapper reveal, or they
              would be nested and fight each other. */}
          <BrandSections groups={groups} basePath={href} perBrand={4} />
        </div>
      ) : (
        <>
          <div className="mt-5">
            <ProductGrid products={result.products} priorityCount={4} />
          </div>

          <Pagination
            basePath={href}
            params={params}
            page={result.page}
            totalPages={result.totalPages}
          />
        </>
      )}
    </div>
  );
}
