import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, X, FileText, Phone } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/data";
import { DEPARTMENT_META } from "@/lib/departments";
import { ProductGallery } from "@/components/product/product-gallery";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { ProductGrid } from "@/components/product/product-grid";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { getWhatsAppNumber } from "@/lib/settings";
import { buttonClasses } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import {
  buildMetadata,
  breadcrumbJsonLd,
  productJsonLd,
  absoluteUrl,
} from "@/lib/seo";
import { formatPrice, truncate } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export const revalidate = 600;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) return buildMetadata({ title: "Product", path: `/products/${slug}` });

  return buildMetadata({
    title: product.name,
    description:
      product.shortDesc ||
      truncate(product.description || `${product.name} available at ${siteConfig.name}, ${siteConfig.city}.`, 155),
    path: `/products/${slug}`,
    image: product.image?.url,
    keywords: [product.name, product.brandName || "", product.categoryName].filter(Boolean),
  });
}

export default async function ProductDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categoryId, product.id, 4).catch(
    () => []
  );

  const whatsappNumber = await getWhatsAppNumber();
  const waHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Hello Samad Traders, I'm interested in "${product.name}" (${formatPrice(
          product.price
        )} ${product.unit}). Please share more details.`
      )}`
    : "";

  const dept = DEPARTMENT_META[product.department];
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  return (
    <div className="container-page py-6">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: dept.label, path: dept.href },
            { name: product.categoryName, path: `/category/${product.categorySlug}` },
            { name: product.name, path: `/products/${slug}` },
          ]),
          productJsonLd({
            name: product.name,
            description: product.shortDesc || product.description,
            slug: product.slug,
            price: product.price,
            image: product.image ? product.image.url : absoluteUrl("/opengraph-image"),
            brand: product.brandName,
            sku: product.sku,
            inStock: product.inStock,
          }),
        ]}
      />

      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: dept.label, path: dept.href },
          { name: product.categoryName, path: `/category/${product.categorySlug}` },
          { name: product.name, path: `/products/${slug}` },
        ]}
      />

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          {product.brandName && (
            <Link
              href={`/products?brand=${product.brandSlug}`}
              className="text-xs font-semibold uppercase tracking-wide text-brand hover:underline"
            >
              {product.brandName}
            </Link>
          )}
          <h1 className="mt-1 text-2xl font-extrabold text-ink sm:text-3xl">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-2 text-sm">
            {product.inStock ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 font-semibold text-green-700">
                <Check className="h-3.5 w-3.5" /> In stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 font-semibold text-red-700">
                <X className="h-3.5 w-3.5" /> Out of stock
              </span>
            )}
            <Link
              href={`/category/${product.categorySlug}`}
              className="text-muted hover:text-brand"
            >
              {product.categoryName}
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-extrabold text-brand">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <>
                <span className="text-lg text-muted line-through">
                  {formatPrice(product.oldPrice)}
                </span>
                <span className="rounded-md bg-accent px-2 py-0.5 text-sm font-bold text-brand-darker">
                  Save {discount}%
                </span>
              </>
            )}
            <span className="text-sm text-muted">{product.unit}</span>
          </div>

          {product.shortDesc && (
            <p className="mt-4 text-muted">{product.shortDesc}</p>
          )}

          <div className="mt-6 space-y-3">
            <AddToCartButton
              withQuantity
              size="lg"
              item={{
                productId: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                unit: product.unit,
                image: product.image?.url ?? null,
              }}
            />
            {waHref && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1FBE5A] hover:shadow-[0_6px_18px_rgba(37,211,102,0.45)]"
              >
                <WhatsAppIcon className="h-4 w-4" /> Contact on WhatsApp
              </a>
            )}
            <div className="flex flex-wrap gap-3">
              <Link href="/quotation" className={buttonClasses("outline", "md")}>
                <FileText className="h-4 w-4" /> Request a quotation
              </Link>
              <a href={`tel:${siteConfig.contact.phone}`} className={buttonClasses("ghost", "md")}>
                <Phone className="h-4 w-4" /> Call to order
              </a>
            </div>
          </div>

          {product.specs.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-2 text-lg font-bold text-brand-dark">Specifications</h2>
              <table className="w-full overflow-hidden rounded-lg text-sm ring-1 ring-black/5">
                <tbody>
                  {product.specs.map((s, i) => (
                    <tr key={i} className={i % 2 ? "bg-white" : "bg-brand-light/40"}>
                      <td className="w-40 px-4 py-2 font-semibold text-ink">{s.label}</td>
                      <td className="px-4 py-2 text-muted">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {product.description && (
        <div className="mt-10 max-w-3xl">
          <h2 className="mb-2 text-lg font-bold text-brand-dark">Description</h2>
          <div className="prose-shop text-muted">
            {product.description.split("\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="mb-5 text-xl font-extrabold text-brand-dark">
            Related products
          </h2>
          <ProductGrid products={related} whatsappNumber={whatsappNumber} />
        </div>
      )}
    </div>
  );
}
