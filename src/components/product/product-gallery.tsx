"use client";

import { useState } from "react";
import { ProductImage } from "./product-image";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
}: {
  images: { url: string; alt: string | null }[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const main = images[active] ?? null;

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
        <ProductImage
          url={main?.url ?? null}
          alt={main?.alt || name}
          sizes="(max-width: 1024px) 100vw, 500px"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg bg-white ring-1",
                i === active ? "ring-2 ring-brand" : "ring-black/5"
              )}
            >
              <ProductImage url={img.url} alt={img.alt || name} sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
