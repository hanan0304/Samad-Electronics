import type { MetadataRoute } from "next";
import { getAllProductSlugs, getAllActiveCategories } from "@/lib/data";
import { siteConfig } from "@/config/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/electric`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/sanitary`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/fancy-lights`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/quotation`, changeFrequency: "monthly", priority: 0.6 },
  ];

  let dynamicEntries: MetadataRoute.Sitemap = [];
  try {
    const [products, categories] = await Promise.all([
      getAllProductSlugs(),
      getAllActiveCategories(),
    ]);
    dynamicEntries = [
      ...categories.map((c) => ({
        url: `${base}/category/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...products.map((p) => ({
        url: `${base}/products/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  } catch {
    /* DB not ready — return static routes only */
  }

  return [...staticEntries, ...dynamicEntries];
}
