"use client";

import Link from "next/link";
import { X, Trash2, Minus, Plus, ShoppingCart, FileText } from "lucide-react";
import { useCart } from "./cart-context";
import { ProductImage } from "@/components/product/product-image";
import { formatPrice } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    setQuantity,
    totalPrice,
    totalItems,
  } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={closeCart} />
      <aside className="absolute right-0 top-0 flex h-full w-96 max-w-[90%] flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="flex items-center gap-2 font-bold text-brand-dark">
            <ShoppingCart className="h-5 w-5" /> Your Cart ({totalItems})
          </h2>
          <button aria-label="Close cart" onClick={closeCart}>
            <X className="h-6 w-6 text-ink" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-muted">
            <ShoppingCart className="h-12 w-12 text-brand/30" />
            <p>Your cart is empty.</p>
            <Link
              href="/products"
              onClick={closeCart}
              className={buttonClasses("primary", "md")}
            >
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-3">
                {items.map((item) => (
                  <li
                    key={item.productId}
                    className="flex gap-3 rounded-lg border border-black/5 p-2"
                  >
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeCart}
                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-brand-light"
                    >
                      <ProductImage url={item.image} alt={item.name} />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeCart}
                        className="line-clamp-2 text-sm font-semibold text-ink hover:text-brand"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-muted">{formatPrice(item.price)} · {item.unit}</p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <div className="flex items-center rounded-md border border-brand/20">
                          <button
                            aria-label="Decrease"
                            onClick={() => setQuantity(item.productId, item.quantity - 1)}
                            className="p-1 text-brand hover:bg-brand-light"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                          <button
                            aria-label="Increase"
                            onClick={() => setQuantity(item.productId, item.quantity + 1)}
                            className="p-1 text-brand hover:bg-brand-light"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          aria-label="Remove"
                          onClick={() => removeItem(item.productId)}
                          className="p-1 text-muted hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right text-sm font-bold text-brand">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-muted">Subtotal</span>
                <span className="text-lg font-bold text-brand">{formatPrice(totalPrice)}</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className={buttonClasses("primary", "md")}
                >
                  <ShoppingCart className="h-4 w-4" /> Place Order
                </Link>
                <Link
                  href="/quotation/cart"
                  onClick={closeCart}
                  className={buttonClasses("outline", "md")}
                >
                  <FileText className="h-4 w-4" /> Request Quotation
                </Link>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="mt-1 text-center text-sm font-semibold text-brand hover:underline"
                >
                  View full cart
                </Link>
              </div>
              <p className="mt-2 text-center text-[11px] text-muted">
                No online payment — we confirm your order by phone/WhatsApp.
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
