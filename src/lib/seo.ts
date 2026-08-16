import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

const BASE = siteConfig.url.replace(/\/$/, "");

/** Absolute URL for a given path. */
export function absoluteUrl(path = "/"): string {
  return `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

type BuildMetaArgs = {
  title?: string;
  description?: string;
  /** Path (e.g. "/products/led-bulb") used for the canonical URL. */
  path?: string;
  /** Absolute or relative OG image URL. */
  image?: string;
  keywords?: string[];
  noindex?: boolean;
};

/**
 * Build a complete Next.js Metadata object with canonical URL, Open Graph and
 * Twitter cards. Use this in every page's `generateMetadata`/`metadata`.
 */
export function buildMetadata({
  title,
  description,
  path = "/",
  image,
  keywords,
  noindex,
}: BuildMetaArgs): Metadata {
  const fullTitle = title
    ? `${title} | ${siteConfig.name}`
    : `${siteConfig.name} — Electric, Sanitary & Fancy Lights in ${siteConfig.city}`;
  const desc = description || siteConfig.description;
  const canonical = absoluteUrl(path);
  const ogImage = image
    ? image.startsWith("http")
      ? image
      : absoluteUrl(image)
    : absoluteUrl("/api/og");

  return {
    title: fullTitle,
    description: desc,
    keywords: [...(keywords || []), ...siteConfig.keywords],
    alternates: { canonical },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      title: fullTitle,
      description: desc,
      url: canonical,
      siteName: siteConfig.name,
      locale: "en_PK",
      images: [{ url: ogImage, width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: [ogImage],
    },
  };
}

// ---- JSON-LD structured data ----------------------------------------------

/** LocalBusiness — the single most important schema for local SEO. */
export function localBusinessJsonLd(settings?: {
  phone?: string;
  address?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HardwareStore",
    "@id": `${BASE}/#business`,
    name: siteConfig.name,
    description: siteConfig.description,
    url: BASE,
    telephone: settings?.phone || siteConfig.contact.phone,
    image: absoluteUrl("/api/og"),
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: settings?.address || siteConfig.contact.addressLine,
      addressLocality: siteConfig.city,
      addressRegion: siteConfig.region,
      addressCountry: siteConfig.countryCode,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.contact.geo.lat,
      longitude: siteConfig.contact.geo.lng,
    },
    areaServed: {
      "@type": "City",
      name: siteConfig.city,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "09:00",
        closes: "21:00",
      },
    ],
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE}/#organization`,
    name: siteConfig.name,
    url: BASE,
    logo: absoluteUrl("/api/og"),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.contact.phone,
      contactType: "sales",
      areaServed: siteConfig.countryCode,
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE}/#website`,
    url: BASE,
    name: siteConfig.name,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE}/products?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

type ProductLd = {
  name: string;
  description?: string | null;
  slug: string;
  price: number;
  image?: string;
  brand?: string | null;
  sku?: string | null;
  inStock: boolean;
};

export function productJsonLd(p: ProductLd) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description || undefined,
    sku: p.sku || undefined,
    image: p.image ? [p.image] : undefined,
    brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/products/${p.slug}`),
      priceCurrency: "PKR",
      price: p.price.toFixed(2),
      availability: p.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: siteConfig.name },
    },
  };
}

export function itemListJsonLd(
  products: { name: string; slug: string }[],
  listName: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/products/${p.slug}`),
      name: p.name,
    })),
  };
}
