"use client";

import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingCart, FileText, ArrowLeft } from "lucide-react";
import { useCart } from "./cart-context";
import { ProductImage } from "@/components/product/product-image";
import { formatPrice } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";

export function CartView() {
  const { items, removeItem, setQuantity, totalPrice, totalItems, clear } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-brand/20 bg-white p-12 text-center">
        <ShoppingCart className="mx-auto h-14 w-14 text-brand/30" />
        <h2 className="mt-4 text-lg font-bold text-ink">Your cart is empty</h2>
        <p className="mt-1 text-sm text-muted">
          Add some products to place an order or request a quotation.
        </p>
        <Link href="/products" className={`mt-5 inline-flex ${buttonClasses("primary", "md")}`}>
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.productId}
              className="flex gap-4 rounded-xl bg-white p-3 shadow-card ring-1 ring-black/5"
            >
              <Link
                href={`/products/${item.slug}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-brand-light"
              >
                <ProductImage url={item.image} alt={item.name} sizes="96px" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${item.slug}`}
                  className="font-semibold text-ink hover:text-brand"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-muted">
                  {formatPrice(item.price)} · {item.unit}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center rounded-lg border border-brand/20">
                    <button
                      aria-label="Decrease"
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      className="p-2 text-brand hover:bg-brand-light"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      aria-label="Increase"
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      className="p-2 text-brand hover:bg-brand-light"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="flex items-center gap-1 text-sm text-muted hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                </div>
              </div>
              <div className="text-right font-bold text-brand">
                {formatPrice(item.price * item.quantity)}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between">
          <Link href="/products" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
            <ArrowLeft className="h-4 w-4" /> Continue shopping
          </Link>
          <button onClick={clear} className="text-sm text-muted hover:text-red-600">
            Clear cart
          </button>
        </div>
      </div>

      <aside className="h-fit rounded-xl bg-white p-5 shadow-card ring-1 ring-black/5">
        <h2 className="text-lg font-bold text-brand-dark">Order summary</h2>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Items</span>
            <span className="font-semibold">{totalItems}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-muted">Subtotal</span>
            <span className="text-lg font-bold text-brand">{formatPrice(totalPrice)}</span>
          </div>
        </div>
        <div className="mt-5 space-y-2">
          <Link href="/checkout" className={`w-full ${buttonClasses("primary", "lg")}`}>
            <ShoppingCart className="h-4 w-4" /> Place Order
          </Link>
          <Link
            href="/quotation/cart"
            className={`w-full ${buttonClasses("outline", "lg")}`}
          >
            <FileText className="h-4 w-4" /> Request Quotation
          </Link>
        </div>
        <p className="mt-3 text-center text-xs text-muted">
          No online payment needed. We confirm every order with you by phone or WhatsApp.
        </p>
      </aside>
    </div>
  );
}
