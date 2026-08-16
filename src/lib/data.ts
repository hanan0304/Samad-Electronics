import { prisma } from "@/lib/prisma";
import type { Department, Prisma } from "@prisma/client";

// ---- Serialized (plain, client-safe) shapes -------------------------------

export type ProductImageDTO = { url: string; alt: string | null };

export type ProductCardDTO = {
  id: string;
  name: string;
  slug: string;
  shortDesc: string | null;
  price: number;
  oldPrice: number | null;
  unit: string;
  inStock: boolean;
  featured: boolean;
  image: ProductImageDTO | null;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  brandName: string | null;
};

export type ProductDetailDTO = ProductCardDTO & {
  description: string | null;
  sku: string | null;
  specs: { label: string; value: string }[];
  images: ProductImageDTO[];
  department: Department;
  brandSlug: string | null;
};

const productInclude = {
  category: true,
  brand: true,
  images: { orderBy: { sortOrder: "asc" } },
} satisfies Prisma.ProductInclude;

type ProductWith = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

function toCard(p: ProductWith): ProductCardDTO {
  const first = p.images[0];
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    shortDesc: p.shortDesc,
    price: p.price.toNumber(),
    oldPrice: p.oldPrice ? p.oldPrice.toNumber() : null,
    unit: p.unit,
    inStock: p.inStock,
    featured: p.featured,
    image: first ? { url: first.url, alt: first.alt } : null,
    categoryId: p.categoryId,
    categoryName: p.category.name,
    categorySlug: p.category.slug,
    brandName: p.brand?.name ?? null,
  };
}

function toDetail(p: ProductWith): ProductDetailDTO {
  const specs = Array.isArray(p.specs)
    ? (p.specs as unknown as { label: string; value: string }[])
    : [];
  return {
    ...toCard(p),
    description: p.description,
    sku: p.sku,
    specs,
    images: p.images.map((i) => ({ url: i.url, alt: i.alt })),
    department: p.category.department,
    brandSlug: p.brand?.slug ?? null,
  };
}

// ---- Navigation / categories ----------------------------------------------

export async function getNavCategories() {
  const cats = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, department: true },
  });
  const byDept: Record<Department, typeof cats> = {
    ELECTRIC: [],
    SANITARY: [],
    FANCY_LIGHTS: [],
  };
  for (const c of cats) byDept[c.department].push(c);
  return byDept;
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function getAllActiveCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ department: "asc" }, { sortOrder: "asc" }],
  });
}

export async function getBrands() {
  return prisma.brand.findMany({ orderBy: { name: "asc" } });
}

export type BrandCardDTO = {
  name: string;
  slug: string;
  logoUrl: string | null;
  discountPercent: number;
  productCount: number;
};

/** Brands with their logo, quote discount and how many live products each has. */
export async function getBrandCards(): Promise<BrandCardDTO[]> {
  const rows = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    select: {
      name: true,
      slug: true,
      logoUrl: true,
      discountPercent: true,
      _count: { select: { products: { where: { isActive: true } } } },
    },
  });
  return rows.map((b) => ({
    name: b.name,
    slug: b.slug,
    logoUrl: b.logoUrl,
    discountPercent: Number(b.discountPercent),
    productCount: b._count.products,
  }));
}

export type BrandGroupDTO = {
  /** null for products that have not been assigned a brand yet. */
  brand: { name: string; slug: string; logoUrl: string | null } | null;
  products: ProductCardDTO[];
  total: number;
};

/**
 * All live products grouped by the company that makes them, so a customer can
 * browse company-by-company instead of one long mixed list.
 *
 * `perBrand` caps how many are shown inside each section — the section header
 * links to the full, filtered list for that company.
 */
export async function getProductsByBrand({
  department,
  perBrand = 4,
}: {
  department?: Department;
  perBrand?: number;
} = {}): Promise<BrandGroupDTO[]> {
  const rows = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(department ? { category: { department } } : {}),
    },
    include: productInclude,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  const groups = new Map<string, BrandGroupDTO>();
  for (const p of rows) {
    const key = p.brand?.slug ?? "__none__";
    let g = groups.get(key);
    if (!g) {
      g = {
        brand: p.brand
          ? { name: p.brand.name, slug: p.brand.slug, logoUrl: p.brand.logoUrl }
          : null,
        products: [],
        total: 0,
      };
      groups.set(key, g);
    }
    g.total += 1;
    if (g.products.length < perBrand) g.products.push(toCard(p));
  }

  // Biggest ranges first; unbranded items always last.
  return [...groups.values()].sort((a, b) => {
    if (!a.brand) return 1;
    if (!b.brand) return -1;
    return b.total - a.total || a.brand.name.localeCompare(b.brand.name);
  });
}

export type QuoteLineDTO = {
  id: string;
  name: string;
  slug: string;
  unit: string;
  /** List price in PKR before the brand discount. */
  price: number;
  inStock: boolean;
  image: string | null;
};

export type QuoteBrandDTO = {
  name: string;
  slug: string;
  logoUrl: string | null;
  discountPercent: number;
  products: QuoteLineDTO[];
};

/**
 * Everything the instant-quotation builder needs for one brand: the brand's
 * current discount plus its live products with today's prices.
 */
export async function getBrandForQuote(
  slug: string
): Promise<QuoteBrandDTO | null> {
  const brand = await prisma.brand.findUnique({
    where: { slug },
    select: {
      name: true,
      slug: true,
      logoUrl: true,
      discountPercent: true,
      products: {
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          unit: true,
          price: true,
          inStock: true,
          images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } },
        },
      },
    },
  });
  if (!brand) return null;
  return {
    name: brand.name,
    slug: brand.slug,
    logoUrl: brand.logoUrl,
    discountPercent: Number(brand.discountPercent),
    products: brand.products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      unit: p.unit,
      price: Number(p.price),
      inStock: p.inStock,
      image: p.images[0]?.url ?? null,
    })),
  };
}

// ---- Products --------------------------------------------------------------

export async function getFeaturedProducts(limit = 8): Promise<ProductCardDTO[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true, featured: true },
    include: productInclude,
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
  return rows.map(toCard);
}

export async function getLatestProducts(limit = 8): Promise<ProductCardDTO[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true },
    include: productInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(toCard);
}

/**
 * "New arrivals" that show a MIX of brands rather than a run of the same one.
 *
 * Pulls a recent pool of products, then picks round-robin across brands (most
 * recently stocked brand first). To keep the strip varied even after a big bulk
 * import of one company, each brand contributes at most `perBrandCap` items
 * first; only if that leaves the strip short do we top it up with the leftover
 * newest items. Recency is respected within each brand throughout.
 */
export async function getNewArrivals(
  limit = 8,
  perBrandCap = 2
): Promise<ProductCardDTO[]> {
  const pool = await prisma.product.findMany({
    where: { isActive: true },
    include: productInclude,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // Group by brand, preserving recency order (Map keeps first-seen order, and
  // the pool is already newest-first, so the newest brand leads).
  const byBrand = new Map<string, ProductWith[]>();
  for (const p of pool) {
    const key = p.brand?.slug ?? "__none__";
    const q = byBrand.get(key);
    if (q) q.push(p);
    else byBrand.set(key, [p]);
  }

  // Round-robin across brands. A brand that has already given `perBrandCap`
  // items steps aside (its extras wait in `leftover`) so other brands get a
  // turn — this is what forces the mix.
  const queues = [...byBrand.values()];
  const counts = new Map<string, number>();
  const picked: ProductWith[] = [];
  const leftover: ProductWith[] = [];

  let i = 0;
  while (picked.length < limit && queues.some((q) => q.length > 0)) {
    const q = queues[i % queues.length];
    i += 1;
    const next = q.shift();
    if (!next) continue;
    const key = next.brand?.slug ?? "__none__";
    const seen = counts.get(key) ?? 0;
    if (seen < perBrandCap) {
      picked.push(next);
      counts.set(key, seen + 1);
    } else {
      leftover.push(next);
    }
  }

  // Only if we couldn't fill the strip with variety, top up with newest extras.
  for (const item of leftover) {
    if (picked.length >= limit) break;
    picked.push(item);
  }

  return picked.map(toCard);
}

export type ProductFilters = {
  department?: Department;
  categorySlug?: string;
  brandSlug?: string;
  q?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "name";
  page?: number;
  perPage?: number;
  inStockOnly?: boolean;
};

export async function getProducts(filters: ProductFilters) {
  const {
    department,
    categorySlug,
    brandSlug,
    q,
    sort = "newest",
    page = 1,
    perPage = 12,
    inStockOnly = false,
  } = filters;

  const hasCategoryFilter = Boolean(department || categorySlug);
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(hasCategoryFilter
      ? {
          category: {
            ...(department ? { department } : {}),
            ...(categorySlug ? { slug: categorySlug } : {}),
          },
        }
      : {}),
    ...(brandSlug ? { brand: { slug: brandSlug } } : {}),
    ...(inStockOnly ? { inStock: true } : {}),
    ...(q && q.trim()
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { shortDesc: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
            { sku: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price-asc"
      ? { price: "asc" }
      : sort === "price-desc"
        ? { price: "desc" }
        : sort === "name"
          ? { name: "asc" }
          : { createdAt: "desc" };

  const take = Math.min(Math.max(perPage, 1), 48);
  const skip = (Math.max(page, 1) - 1) * take;

  const [rows, total] = await Promise.all([
    prisma.product.findMany({ where, include: productInclude, orderBy, take, skip }),
    prisma.product.count({ where }),
  ]);

  return {
    products: rows.map(toCard),
    total,
    page: Math.max(page, 1),
    perPage: take,
    totalPages: Math.max(Math.ceil(total / take), 1),
  };
}

export async function getProductBySlug(
  slug: string
): Promise<ProductDetailDTO | null> {
  const p = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: productInclude,
  });
  return p ? toDetail(p) : null;
}

export async function getRelatedProducts(
  categoryId: string,
  excludeId: string,
  limit = 4
): Promise<ProductCardDTO[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true, categoryId, id: { not: excludeId } },
    include: productInclude,
    take: limit,
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(toCard);
}

/** All product slugs — used to build the sitemap. */
export async function getAllProductSlugs() {
  return prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });
}
