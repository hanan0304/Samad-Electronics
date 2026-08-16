"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Loader2 } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { requestQuotation } from "@/app/actions";
import { Button, buttonClasses } from "@/components/ui/button";
import { Field, inputClass } from "./field";
import { SuccessCard } from "./order-form";

export function QuotationForm() {
  const { items, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const res = await requestQuotation({
      customerName: fd.get("customerName"),
      phone: fd.get("phone"),
      email: fd.get("email"),
      message: fd.get("message"),
      items: items.map((i) => ({
        productId: i.productId,
        name: i.name,
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
        title="Quotation request sent!"
        reference={done}
        refLabel="Reference"
        message="Thank you! We've received your request and will get back to you with a price quotation as soon as possible."
      />
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-brand/20 bg-white p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-brand/30" />
        <p className="mt-3 text-muted">
          Add the items you want a quotation for to your cart, then come back here.
        </p>
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
          <h2 className="mb-1 text-lg font-bold text-brand-dark">
            Request a quotation
          </h2>
          <p className="mb-4 text-sm text-muted">
            Tell us who you are and we&apos;ll send you our best price for the items
            in your list — great for bulk orders and full projects.
          </p>
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
          </div>
          <div className="mt-4">
            <Field label="Message (optional)" hint="Quantities, project details, or anything else we should know.">
              <textarea name="message" rows={3} className={inputClass} placeholder="e.g. Need these for a 10-marla house under construction…" />
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
              <Loader2 className="h-4 w-4 animate-spin" /> Sending request…
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" /> Send Quotation Request
            </>
          )}
        </Button>
      </form>

      <aside className="h-fit rounded-xl bg-white p-5 shadow-card ring-1 ring-black/5">
        <h2 className="text-lg font-bold text-brand-dark">Items for quotation</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-2">
              <span className="text-muted">{i.name}</span>
              <span className="font-semibold">× {i.quantity}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t pt-3 text-xs text-muted">
          You can adjust quantities in your{" "}
          <Link href="/cart" className="font-semibold text-brand hover:underline">
            cart
          </Link>
          .
        </p>
      </aside>
    </div>
  );
}
