"use client";

import Link from "next/link";
import { FileText, ShoppingBasket } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { buttonClasses } from "@/components/ui/button";

/**
 * Shown on the quotation brand picker: once a customer has added items from one
 * or more brands (via "Add other brand items"), this tells them how many are
 * waiting and lets them build the combined, mixed-brand quotation.
 */
export function QuoteBasketBanner() {
  const { items } = useCart();
  const count = items.reduce((n, i) => n + i.quantity, 0);
  if (count === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-light/70 p-4 ring-1 ring-brand/15">
      <p className="flex items-center gap-2 text-sm text-ink">
        <ShoppingBasket className="h-5 w-5 shrink-0 text-brand" />
        <span>
          <strong className="font-bold tabular-nums">{count}</strong> item
          {count === 1 ? "" : "s"} in your quotation basket. Add more brands
          below, or build your combined quotation now.
        </span>
      </p>
      <Link
        href="/quotation/cart"
        className={buttonClasses("primary", "md", "shrink-0")}
      >
        <FileText className="h-4 w-4" /> Build combined quotation
      </Link>
    </div>
  );
}
