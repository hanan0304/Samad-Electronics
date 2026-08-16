import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCategoryBySlug,
  getProducts,
  getBrands,
} from "@/lib/data";
import { DEPARTMENT_META } from "@/lib/departments";
import { ProductGrid } from "@/components/product/product-grid";
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { Pagination } from "@/components/catalog/pagination";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { getWhatsAppNumber } from "@/lib/settings";
import { buildMetadata, breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const revalidate = 600;

type Params = Promise<{ slug: string }>;
type SP = Promise<Record<string, string | string[] | undefined>>;

function str(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  let category = null;
  try {
    category = await getCategoryBySlug(slug);
  } catch {
    /* ignore */
  }
  if (!category) return buildMetadata({ title: "Category", path: `/category/${slug}` });

  return buildMetadata({
    title: `${category.name} in ${siteConfig.city}`,
    description:
      category.description ||
      `Buy ${category.name.toLowerCase()} in ${siteConfig.city} with live prices at ${siteConfig.name}.`,
    path: `/category/${slug}`,
    keywords: [`${category.name} Lahore`],
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SP;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const category = await getCategoryBySlug(slug).catch(() => null);
  if (!category || !category.isActive) notFound();

  const brand = str(sp.brand);
  const sort = str(sp.sort) as
    | "newest"
    | "price-asc"
    | "price-desc"
    | "name"
    | undefined;
  const page = Math.max(1, Number(str(sp.page)) || 1);

  const dept = DEPARTMENT_META[category.department];

  // Same guard as every other storefront page: a database blip should show an
  // empty category, never a 500.
  let result = {
    products: [],
    total: 0,
    page: 1,
    perPage: 12,
    totalPages: 1,
  } as Awaited<ReturnType<typeof getProducts>>;
  let brands: Awaited<ReturnType<typeof getBrands>> = [];
  try {
    [result, brands] = await Promise.all([
      getProducts({ categorySlug: slug, brandSlug: brand, sort, page, perPage: 12 }),
      getBrands(),
    ]);
  } catch {
    /* DB unreachable — render the page with no products */
  }

  const whatsappNumber = await getWhatsAppNumber();

  const params2 = { brand, sort };
  const basePath = `/category/${slug}`;

  return (
    <div className="container-page py-6">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: dept.label, path: dept.href },
            { name: category.name, path: basePath },
          ]),
          itemListJsonLd(result.products, category.name),
        ]}
      />

      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: dept.label, path: dept.href },
          { name: category.name, path: basePath },
        ]}
      />

      <div className="mt-4 mb-5">
        <h1 className="text-2xl font-extrabold text-brand-dark sm:text-3xl">
          {category.name} in {siteConfig.city}
        </h1>
        {category.description && (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
            {category.description}
          </p>
        )}
      </div>

      <CatalogToolbar
        basePath={basePath}
        params={params2}
        brands={brands}
        total={result.total}
      />

      <div className="mt-5">
        <ProductGrid
          products={result.products}
          priorityCount={4}
          whatsappNumber={whatsappNumber}
        />
      </div>

      <Pagination
        basePath={basePath}
        params={params2}
        page={result.page}
        totalPages={result.totalPages}
      />
    </div>
  );
}
