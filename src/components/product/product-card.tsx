import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import type { ProductCardDTO } from "@/lib/data";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { ProductImage } from "./product-image";
import { AddToCartButton } from "./add-to-cart-button";

export function ProductCard({
  product,
  priority = false,
  whatsappNumber,
}: {
  product: ProductCardDTO;
  priority?: boolean;
  /** International WhatsApp number. When given, an enquiry button is shown. */
  whatsappNumber?: string;
}) {
  const href = `/products/${product.slug}`;
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition duration-200 hover:-translate-y-1 hover:shadow-card">
      <Link
        href={href}
        className="relative block aspect-square overflow-hidden bg-brand-light"
      >
        <ProductImage
          url={product.image?.url ?? null}
          alt={product.image?.alt || product.name}
          className="transition-transform duration-300 group-hover:scale-105"
          priority={priority}
        />
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded-md bg-accent px-2 py-0.5 text-xs font-bold tabular-nums text-white shadow-sm">
            -{discount}%
          </span>
        )}
        {!product.inStock && (
          <span className="absolute right-2 top-2 rounded-md bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
            Out of stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
          {product.brandName || product.categoryName}
        </p>
        <Link href={href} className="mt-0.5">
          <h3 className="line-clamp-2 text-sm font-semibold text-ink hover:text-brand">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold tabular-nums text-brand">
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-xs tabular-nums text-muted line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted">{product.unit}</p>

        <div className="mt-3 space-y-2 pt-1">
          <AddToCartButton
            size="md"
            item={{
              productId: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              unit: product.unit,
              image: product.image?.url ?? null,
            }}
          />
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                `Hello Samad Traders, I'm interested in "${product.name}" (${formatPrice(
                  product.price
                )} ${product.unit}). Please share more details.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1FBE5A] hover:shadow-[0_6px_18px_rgba(37,211,102,0.45)]"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Contact on WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
