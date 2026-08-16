"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Minus,
  Plus,
  FileText,
  Download,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  PlusCircle,
} from "lucide-react";
import type { QuoteBrandDTO } from "@/lib/data";
import { useCart } from "@/components/cart/cart-context";
import { Button, buttonClasses } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

/**
 * Instant quotation builder.
 *
 * Deliberately does NOT use the shopping cart: a customer here only wants
 * prices. They pick quantities, press one button, and the finished quotation
 * is calculated and shown on the spot using today's prices and the brand's
 * current discount — no waiting for the shop to reply.
 */
export function QuoteBuilder({
  brand,
  shopName,
  phone,
  website,
}: {
  brand: QuoteBrandDTO;
  shopName: string;
  phone: string;
  /** Display website (e.g. "samad-traders.vercel.app"), printed on the sheet. */
  website: string;
}) {
  const router = useRouter();
  const { addItem, items: cartItems } = useCart();
  const [qty, setQty] = useState<Record<string, number>>({});
  const [quote, setQuote] = useState<{ number: string; date: Date } | null>(
    null
  );

  /** Push every currently-ticked item into the cart (the quotation basket). */
  function addSelectionsToCart() {
    for (const p of brand.products) {
      const n = qty[p.id] ?? 0;
      if (n > 0) {
        addItem(
          {
            productId: p.id,
            name: p.name,
            slug: p.slug,
            price: p.price,
            unit: p.unit,
            image: p.image,
          },
          n
        );
      }
    }
  }

  /** Save the ticked items, then go pick another brand. */
  function addOtherBrand() {
    addSelectionsToCart();
    router.push("/quotation?added=1");
  }

  /** Save the ticked items, then build one combined multi-brand quotation. */
  function buildCombined() {
    addSelectionsToCart();
    router.push("/quotation/cart");
  }

  function setQuantity(id: string, n: number) {
    setQty((prev) => {
      const next = { ...prev };
      if (n <= 0) delete next[id];
      else next[id] = Math.min(n, 9999);
      return next;
    });
  }

  const lines = useMemo(
    () =>
      brand.products
        .filter((p) => (qty[p.id] ?? 0) > 0)
        .map((p) => {
          const quantity = qty[p.id];
          const listTotal = p.price * quantity;
          const discount = (listTotal * brand.discountPercent) / 100;
          return {
            ...p,
            quantity,
            listTotal,
            discount,
            netTotal: listTotal - discount,
          };
        }),
    [brand.products, brand.discountPercent, qty]
  );

  const totals = useMemo(() => {
    const list = lines.reduce((s, l) => s + l.listTotal, 0);
    const discount = lines.reduce((s, l) => s + l.discount, 0);
    return { list, discount, net: list - discount };
  }, [lines]);

  const itemCount = lines.length;

  function generate() {
    const now = new Date();
    // Human-friendly reference, unique enough for a walk-in quotation.
    const ref = `Q-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
      now.getDate()
    ).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(
      now.getMinutes()
    ).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
    setQuote({ number: ref, date: now });
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }

  // ---- Finished quotation -------------------------------------------------
  if (quote) {
    const validUntil = new Date(quote.date);
    validUntil.setDate(validUntil.getDate() + 7);
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

    return (
      <div>
        <div className="no-print mb-5 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setQuote(null)}
            className={buttonClasses("outline", "md")}
          >
            <ArrowLeft className="h-4 w-4" /> Change items
          </button>
          <button
            onClick={() => window.print()}
            className={buttonClasses("accent", "md")}
          >
            <Download className="h-4 w-4" /> Save as PDF
          </button>
        </div>

        {/* The printable quotation */}
        <div
          id="quote-sheet"
          className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-line"
        >
          {/* Origin line — shows this was generated from the website */}
          <p className="bg-brand-darker px-6 py-1.5 text-center text-[11px] font-medium text-white/90 sm:px-8">
            This quotation was generated online from {website}
          </p>

          {/* Head */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line p-6 sm:p-8">
            <div>
              <div className="flex items-center gap-2.5">
                <Image
                  src="/logo-mark.png"
                  alt=""
                  width={467}
                  height={711}
                  className="h-9 w-auto"
                />
                <span className="text-lg font-extrabold text-brand-dark">
                  {shopName}
                </span>
              </div>
              <p className="mt-2 text-[13px] text-muted">
                Electric · Sanitary · Fancy Lights
                {phone ? ` · ${phone}` : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
                Quotation
              </p>
              <p className="mt-1 font-mono text-sm font-bold tabular-nums text-ink">
                {quote.number}
              </p>
              <p className="mt-1 text-[13px] text-muted">
                {fmt(quote.date)}
              </p>
            </div>
          </div>

          {/* Brand strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-paper px-6 py-4 sm:px-8">
            <div className="flex items-center gap-3">
              {brand.logoUrl ? (
                <div className="relative h-8 w-20">
                  <Image
                    src={brand.logoUrl}
                    alt={brand.name}
                    fill
                    sizes="80px"
                    className="object-contain"
                  />
                </div>
              ) : (
                <span className="font-display text-base font-extrabold text-brand-dark">
                  {brand.name}
                </span>
              )}
              <span className="text-sm text-muted">
                {itemCount} item{itemCount === 1 ? "" : "s"}
              </span>
            </div>
            {brand.discountPercent > 0 && (
              <span className="rounded-lg bg-accent px-3 py-1 text-sm font-bold tabular-nums text-white">
                {brand.discountPercent}% dealer discount applied
              </span>
            )}
          </div>

          {/* Lines */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                  <th className="p-4 sm:px-8">Item</th>
                  <th className="p-4 text-right">Rate</th>
                  <th className="p-4 text-center">Qty</th>
                  <th className="p-4 text-right sm:pr-8">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {lines.map((l) => (
                  <tr key={l.id}>
                    <td className="p-4 sm:px-8">
                      <p className="font-semibold text-ink">{l.name}</p>
                      <p className="text-xs text-muted">{l.unit}</p>
                    </td>
                    <td className="p-4 text-right tabular-nums text-muted">
                      {formatPrice(l.price)}
                    </td>
                    <td className="p-4 text-center font-semibold tabular-nums text-ink">
                      {l.quantity}
                    </td>
                    <td className="p-4 text-right font-semibold tabular-nums text-ink sm:pr-8">
                      {formatPrice(l.listTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t border-line bg-paper p-6 sm:p-8">
            <div className="ml-auto max-w-sm space-y-2.5 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatPrice(totals.list)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between font-semibold text-accent">
                  <span>Discount ({brand.discountPercent}%)</span>
                  <span className="tabular-nums">
                    − {formatPrice(totals.discount)}
                  </span>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t border-line pt-3">
                <span className="font-bold text-ink">Total</span>
                <span className="font-display text-2xl font-extrabold tabular-nums text-brand">
                  {formatPrice(totals.net)}
                </span>
              </div>
              {totals.discount > 0 && (
                <p className="text-right text-xs font-semibold text-accent">
                  You save {formatPrice(totals.discount)}
                </p>
              )}
            </div>

            <p className="mt-6 border-t border-line pt-4 text-xs leading-relaxed text-muted">
              Prices are in PKR and valid until{" "}
              <strong className="font-semibold text-ink">
                {fmt(validUntil)}
              </strong>
              . Subject to stock availability at the time of order. This
              quotation is generated automatically from today&apos;s shop rates.
            </p>
          </div>
        </div>

        <div className="no-print mt-6 flex flex-wrap gap-3">
          <Link href="/quotation" className={buttonClasses("primary", "md")}>
            <RotateCcw className="h-4 w-4" /> Quote another brand
          </Link>
          <Link href="/contact" className={buttonClasses("outline", "md")}>
            Contact the shop
          </Link>
        </div>
      </div>
    );
  }

  // ---- Item picker --------------------------------------------------------
  return (
    <div>
      {brand.products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand/20 bg-white p-10 text-center">
          <p className="text-muted">
            No products listed for {brand.name} yet.
          </p>
          <Link
            href="/quotation"
            className={buttonClasses("primary", "md", "mt-4")}
          >
            Choose another brand
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-line">
            <ul className="divide-y divide-line">
              {brand.products.map((p) => {
                const n = qty[p.id] ?? 0;
                const chosen = n > 0;
                return (
                  <li
                    key={p.id}
                    className={cn(
                      "flex flex-wrap items-center gap-4 p-4 transition-colors sm:px-6",
                      chosen && "bg-brand-light/40"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink">{p.name}</p>
                      <p className="text-sm text-muted">
                        <span className="tabular-nums">
                          {formatPrice(p.price)}
                        </span>{" "}
                        · {p.unit}
                        {!p.inStock && (
                          <span className="ml-2 text-xs font-semibold text-red-600">
                            Out of stock
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-xl border border-line bg-white p-1">
                      <button
                        type="button"
                        onClick={() => setQuantity(p.id, n - 1)}
                        disabled={n === 0}
                        aria-label={`Decrease quantity of ${p.name}`}
                        className="grid h-8 w-8 place-items-center rounded-lg text-brand transition hover:bg-brand-light disabled:opacity-30"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={n}
                        onChange={(e) =>
                          setQuantity(p.id, Number(e.target.value) || 0)
                        }
                        aria-label={`Quantity of ${p.name}`}
                        className="w-12 border-0 bg-transparent text-center text-sm font-bold tabular-nums text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity(p.id, n + 1)}
                        aria-label={`Increase quantity of ${p.name}`}
                        className="grid h-8 w-8 place-items-center rounded-lg text-brand transition hover:bg-brand-light"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Sticky action bar */}
          <div className="sticky bottom-0 z-40 mt-5 rounded-2xl border border-line bg-white/95 p-4 shadow-lg backdrop-blur sm:flex sm:items-center sm:justify-between sm:gap-4">
            <div className="mb-3 flex items-center gap-2 sm:mb-0">
              {itemCount > 0 ? (
                <>
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-brand" />
                  <p className="text-sm text-ink">
                    <strong className="font-bold tabular-nums">
                      {itemCount}
                    </strong>{" "}
                    item{itemCount === 1 ? "" : "s"} selected
                    {cartItems.length > 0 && (
                      <span className="text-muted">
                        {" "}
                        · {cartItems.length} already added from other brands
                      </span>
                    )}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted">
                  Choose quantities for the items you need.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={addOtherBrand}
                disabled={itemCount === 0}
                className={buttonClasses("outline", "lg", "w-full sm:w-auto")}
              >
                <PlusCircle className="h-4 w-4" /> Add other brand items
              </button>
              <Button
                variant="accent"
                size="lg"
                onClick={generate}
                disabled={itemCount === 0}
                className="w-full sm:w-auto"
              >
                <FileText className="h-4 w-4" /> Get Quotation
              </Button>
            </div>
          </div>

          {/* Combined-quotation shortcut once items from other brands exist */}
          {cartItems.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-light/60 p-4 ring-1 ring-brand/10">
              <p className="text-sm text-ink">
                You have{" "}
                <strong className="font-bold tabular-nums">
                  {cartItems.length}
                </strong>{" "}
                item{cartItems.length === 1 ? "" : "s"} from other brands ready.
                Add this brand&apos;s items above, then build one combined
                quotation.
              </p>
              <button
                type="button"
                onClick={buildCombined}
                className={buttonClasses("primary", "md", "shrink-0")}
              >
                <FileText className="h-4 w-4" /> Build combined quotation
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
