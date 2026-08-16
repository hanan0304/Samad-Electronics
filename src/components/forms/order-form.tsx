"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { placeOrder } from "@/app/actions";
import { formatPrice } from "@/lib/utils";
import { Button, buttonClasses } from "@/components/ui/button";
import { Field, inputClass } from "./field";

export function OrderForm() {
  const { items, totalPrice, totalItems, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const res = await placeOrder({
      customerName: fd.get("customerName"),
      phone: fd.get("phone"),
      email: fd.get("email"),
      address: fd.get("address"),
      city: fd.get("city"),
      notes: fd.get("notes"),
      items: items.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
    });
    setSubmitting(false);
    if (res.ok) {
      setDone(res.ref || "");
      clear();
    } else {
      setError(res.error);
    }
  }

  if (done) {
    return (
      <SuccessCard
        title="Order placed successfully!"
        reference={done}
        refLabel="Order number"
        message="Thank you! We've received your order and will call or WhatsApp you shortly to confirm the details and delivery."
      />
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-brand/20 bg-white p-12 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-brand/30" />
        <p className="mt-3 text-muted">Your cart is empty.</p>
        <Link href="/products" className={`mt-4 inline-flex ${buttonClasses("primary", "md")}`}>
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form onSubmit={onSubmit} className="space-y-4 lg:col-span-2">
        <div className="rounded-xl bg-white p-5 shadow-card ring-1 ring-black/5">
          <h2 className="mb-4 text-lg font-bold text-brand-dark">Your details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required>
              <input name="customerName" required className={inputClass} placeholder="e.g. Ahmed Ali" />
            </Field>
            <Field label="Phone number" required>
              <input name="phone" required inputMode="tel" className={inputClass} placeholder="03xx-xxxxxxx" />
            </Field>
            <Field label="Email (optional)">
              <input name="email" type="email" className={inputClass} placeholder="you@example.com" />
            </Field>
            <Field label="City" required>
              <input name="city" defaultValue="Lahore" required className={inputClass} />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Delivery address" required>
              <textarea name="address" required rows={3} className={inputClass} placeholder="House #, street, area, nearest landmark" />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Order notes (optional)">
              <textarea name="notes" rows={2} className={inputClass} placeholder="Any special instructions" />
            </Field>
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Placing order…
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" /> Place Order
            </>
          )}
        </Button>
        <p className="text-xs text-muted">
          No online payment. We&apos;ll confirm your order and total by phone/WhatsApp before delivery.
        </p>
      </form>

      <OrderSummary items={items} total={totalPrice} count={totalItems} />
    </div>
  );
}

export function OrderSummary({
  items,
  total,
  count,
}: {
  items: { productId: string; name: string; price: number; quantity: number }[];
  total: number;
  count: number;
}) {
  return (
    <aside className="h-fit rounded-xl bg-white p-5 shadow-card ring-1 ring-black/5">
      <h2 className="text-lg font-bold text-brand-dark">Order summary</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {items.map((i) => (
          <li key={i.productId} className="flex justify-between gap-2">
            <span className="text-muted">
              {i.quantity} × {i.name}
            </span>
            <span className="font-semibold">{formatPrice(i.price * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-between border-t pt-3">
        <span className="text-muted">Subtotal ({count} items)</span>
        <span className="text-lg font-bold text-brand">{formatPrice(total)}</span>
      </div>
    </aside>
  );
}

export function SuccessCard({
  title,
  reference,
  refLabel,
  message,
}: {
  title: string;
  reference: string;
  refLabel: string;
  message: string;
}) {
  return (
    <div className="mx-auto max-w-xl rounded-xl bg-white p-8 text-center shadow-card ring-1 ring-black/5">
      <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />
      <h2 className="mt-4 text-2xl font-extrabold text-ink">{title}</h2>
      {reference && (
        <p className="mt-2 text-sm text-muted">
          {refLabel}:{" "}
          <span className="font-mono text-base font-bold text-brand">{reference}</span>
        </p>
      )}
      <p className="mt-3 text-muted">{message}</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/products" className={buttonClasses("primary", "md")}>
          Continue shopping
        </Link>
        <Link href="/" className={buttonClasses("outline", "md")}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
