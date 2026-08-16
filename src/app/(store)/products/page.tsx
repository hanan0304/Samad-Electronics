import type { Metadata } from "next";
import Link from "next/link";
import { getProducts, getBrands, getProductsByBrand, type BrandGroupDTO } from "@/lib/data";
import { ProductGrid } from "@/components/product/product-grid";
import { BrandSections } from "@/components/catalog/brand-sections";
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { Pagination } from "@/components/catalog/pagination";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { getWhatsAppNumber } from "@/lib/settings";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 600;

type SP = Promise<Record<string, string | string[] | undefined>>;

function str(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SP;
}): Promise<Metadata> {
  const sp = await searchParams;
  const q = str(sp.q);
  if (q) {
    return buildMetadata({
      title: `Search results for “${q}”`,
      description: `Products matching “${q}” at our electric, sanitary & fancy lights shop in Lahore.`,
      path: "/products",
      noindex: true,
    });
  }
  return buildMetadata({
    title: "All Products — Electric, Sanitary & Fancy Lights",
    description:
      "Browse our full range of electrical goods, sanitary ware, bathroom fittings and fancy lights with live prices in Lahore.",
    path: "/products",
  });
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const sp = await searchParams;
  const q = str(sp.q);
  const brand = str(sp.brand);
  const sort = str(sp.sort) as
    | "newest"
    | "price-asc"
    | "price-desc"
    | "name"
    | undefined;
  const page = Math.max(1, Number(str(sp.page)) || 1);

  /**
   * With no search, brand filter or sort applied we show the catalogue grouped
   * company by company. As soon as the visitor filters or searches, the normal
   * flat, paginated list takes over.
   */
  const grouped = !q && !brand && !sort;

  let result = { products: [], total: 0, page: 1, perPage: 12, totalPages: 1 } as Awaited<
    ReturnType<typeof getProducts>
  >;
  let brands: { name: string; slug: string }[] = [];
  let groups: BrandGroupDTO[] = [];
  try {
    [result, brands, groups] = await Promise.all([
      getProducts({ q, brandSlug: brand, sort, page, perPage: 12 }),
      getBrands(),
      grouped ? getProductsByBrand({ perBrand: 4 }) : Promise.resolve([]),
    ]);
  } catch {
    /* DB not ready */
  }

  const whatsappNumber = await getWhatsAppNumber();

  const params = { q, brand, sort };
  const heading = q ? `Search: “${q}”` : "All Products";

  return (
    <div className="container-page py-6">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: q ? "Search" : "All Products", path: "/products" },
        ]}
      />

      <div className="mt-4 mb-5">
        <h1 className="text-2xl font-extrabold text-brand-dark">{heading}</h1>
        {!q && (
          <p className="mt-1 text-sm text-muted">
            Electrical goods, sanitary ware and fancy lights — with live prices,
            updated daily.
          </p>
        )}
      </div>

      <CatalogToolbar
        basePath="/products"
        params={params}
        brands={brands}
        total={result.total}
      />

      {grouped && groups.length > 0 ? (
        <div className="mt-8">
          <BrandSections
            groups={groups}
            basePath="/products"
            perBrand={4}
            whatsappNumber={whatsappNumber}
          />
        </div>
      ) : (
        <>
          <div className="mt-5">
            <ProductGrid
              products={result.products}
              priorityCount={4}
              whatsappNumber={whatsappNumber}
            />
          </div>

          <Pagination
            basePath="/products"
            params={params}
            page={result.page}
            totalPages={result.totalPages}
          />
        </>
      )}

      {result.total === 0 && (
        <div className="mt-6 text-center">
          <Link href="/products" className="text-sm font-semibold text-brand hover:underline">
            Clear filters and view all products →
          </Link>
        </div>
      )}
    </div>
  );
}
