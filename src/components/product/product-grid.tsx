import type { ProductCardDTO } from "@/lib/data";
import { ProductCard } from "./product-card";

export function ProductGrid({
  products,
  priorityCount = 0,
  whatsappNumber,
}: {
  products: ProductCardDTO[];
  priorityCount?: number;
  /** Passed through to show a WhatsApp enquiry button on each card. */
  whatsappNumber?: string;
}) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-brand/20 bg-white p-10 text-center text-muted">
        No products found. Try a different category or search term.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard
          key={p.id}
          product={p}
          priority={i < priorityCount}
          whatsappNumber={whatsappNumber}
        />
      ))}
    </div>
  );
}
