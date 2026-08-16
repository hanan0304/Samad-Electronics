"use client";

import { useState } from "react";
import { ShoppingCart, Check, Minus, Plus } from "lucide-react";
import { useCart, type CartItem } from "@/components/cart/cart-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  item: Omit<CartItem, "quantity">;
  /** Show a quantity stepper (used on product detail pages). */
  withQuantity?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function AddToCartButton({
  item,
  withQuantity = false,
  size = "md",
  className,
}: Props) {
  const { addItem, openCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(item, qty);
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {withQuantity && (
        <div className="flex items-center rounded-lg border border-brand/20">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="p-2 text-brand hover:bg-brand-light rounded-l-lg"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm font-semibold">{qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => Math.min(9999, q + 1))}
            className="p-2 text-brand hover:bg-brand-light rounded-r-lg"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}
      <Button
        type="button"
        variant="primary"
        size={size}
        onClick={handleAdd}
        className="flex-1"
      >
        {added ? (
          <>
            <Check className="h-4 w-4" /> Added
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" /> Add to cart
          </>
        )}
      </Button>
    </div>
  );
}
