"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Download, ArrowLeft, Loader2, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { buildCartQuote, type CartQuote } from "@/app/actions";
import { buttonClasses } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

/**
 * Instant, mixed-brand quotation built straight from the cart.
 *
 * The customer presses "Request Quotation" in the cart and lands here: their
 * whole list is priced on the spot, grouped by brand, with each brand's dealer
 * discount applied so both the original and the discounted totals are shown.
 * All prices are re-fetched server-side, so they are always today's rates.
 */
export function CartQuote({
  shopName,
  phone,
  website,
}: {
  shopName: string;
  phone: string;
  /** Display website (e.g. "samad-traders.vercel.app"), printed on the sheet. */
  website: string;
}) {
  const { items } = useCart();
  const [quote, setQuote] = useState<CartQuote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // A stable reference + date for this quotation, set once on the client.
  const [meta] = useState(() => {
    const now = new Date();
    const ref = `Q-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
      now.getDate()
    ).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(
      now.getMinutes()
    ).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
    return { number: ref, date: now };
  });

  // Freeze the cart contents at mount so editing the cart later doesn't rebuild
  // the sheet under the customer's feet.
  const [snapshot] = useState(() =>
    items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
  );

  useEffect(() => {
    // Empty cart is handled by the early return in render below — nothing to build.
    if (snapshot.length === 0) return;
    let alive = true;
    buildCartQuote(snapshot).then((res) => {
      if (!alive) return;
      if (res.ok) setQuote(res.quote);
      else setError(res.error);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [snapshot]);

  const validUntil = useMemo(() => {
    const d = new Date(meta.date);
    d.setDate(d.getDate() + 7);
    return d;
  }, [meta.date]);

  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  // ---- Empty / loading / error states -------------------------------------
  if (snapshot.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        body="Add the items you need to your cart, then come back to build a quotation."
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-2xl bg-white p-16 text-muted shadow-card ring-1 ring-line">
        <Loader2 className="h-5 w-5 animate-spin" /> Building your quotation…
      </div>
    );
  }

  if (error || !quote) {
    return (
      <EmptyState
        title="Couldn't build the quotation"
        body={error || "Please try again."}
      />
    );
  }

  const itemCount = quote.groups.reduce((n, g) => n + g.lines.length, 0);

  return (
    <div>
      <div className="no-print mb-5 flex flex-wrap items-center gap-3">
        <Link href="/cart" className={buttonClasses("outline", "md")}>
          <ArrowLeft className="h-4 w-4" /> Change items
        </Link>
        <button
          onClick={() => window.print()}
          className={buttonClasses("accent", "md")}
        >
          <Download className="h-4 w-4" /> Save as PDF
        </button>
      </div>

      {/* The printable quotation sheet */}
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
              Electric · Sanitary · Fancy Lights{phone ? ` · ${phone}` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
              Quotation
            </p>
            <p className="mt-1 font-mono text-sm font-bold tabular-nums text-ink">
              {meta.number}
            </p>
            <p className="mt-1 text-[13px] text-muted">{fmtDate(meta.date)}</p>
          </div>
        </div>

        {/* One block per brand */}
        {quote.groups.map((g, gi) => (
          <div key={gi} className="border-b border-line last:border-b-0">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-paper px-6 py-3 sm:px-8">
              <div className="flex items-center gap-3">
                {g.logoUrl ? (
                  <div className="relative h-7 w-16">
                    <Image
                      src={g.logoUrl}
                      alt={g.brandName}
                      fill
                      sizes="64px"
                      className="object-contain"
                    />
                  </div>
                ) : null}
                <span className="font-display text-[15px] font-extrabold text-brand-dark">
                  {g.brandName}
                </span>
              </div>
              {g.discountPercent > 0 && (
                <span className="rounded-lg bg-accent px-2.5 py-0.5 text-xs font-bold tabular-nums text-white">
                  {g.discountPercent}% dealer discount
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                    <th className="p-3 sm:px-8">Item</th>
                    <th className="p-3 text-right">Rate</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Original</th>
                    <th className="p-3 text-right sm:pr-8">After discount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {g.lines.map((l) => (
                    <tr key={l.productId}>
                      <td className="p-3 sm:px-8">
                        <p className="font-semibold text-ink">{l.name}</p>
                        <p className="text-xs text-muted">{l.unit}</p>
                      </td>
                      <td className="p-3 text-right tabular-nums text-muted">
                        {formatPrice(l.price)}
                      </td>
                      <td className="p-3 text-center font-semibold tabular-nums text-ink">
                        {l.quantity}
                      </td>
                      <td className="p-3 text-right tabular-nums text-muted">
                        {g.discountPercent > 0 ? (
                          <span className="line-through">{formatPrice(l.listTotal)}</span>
                        ) : (
                          formatPrice(l.listTotal)
                        )}
                      </td>
                      <td className="p-3 text-right font-semibold tabular-nums text-ink sm:pr-8">
                        {formatPrice(l.netTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {g.discountPercent > 0 && (
              <div className="flex justify-end gap-6 bg-white px-6 py-2 text-xs text-muted sm:px-8">
                <span>
                  {g.brandName} subtotal:{" "}
                  <span className="tabular-nums line-through">
                    {formatPrice(g.listTotal)}
                  </span>
                </span>
                <span className="font-semibold text-accent">
                  You save {formatPrice(g.discountTotal)}
                </span>
                <span className="font-bold text-ink">
                  = <span className="tabular-nums">{formatPrice(g.netTotal)}</span>
                </span>
              </div>
            )}
          </div>
        ))}

        {/* Grand totals */}
        <div className="border-t border-line bg-paper p-6 sm:p-8">
          <div className="ml-auto max-w-sm space-y-2.5 text-sm">
            <div className="flex justify-between text-muted">
              <span>Total (before discount)</span>
              <span className="tabular-nums">{formatPrice(quote.totals.list)}</span>
            </div>
            {quote.totals.discount > 0 && (
              <div className="flex justify-between font-semibold text-accent">
                <span>Total discount</span>
                <span className="tabular-nums">− {formatPrice(quote.totals.discount)}</span>
              </div>
            )}
            <div className="flex items-baseline justify-between border-t border-line pt-3">
              <span className="font-bold text-ink">Grand Total</span>
              <span className="font-display text-2xl font-extrabold tabular-nums text-brand">
                {formatPrice(quote.totals.net)}
              </span>
            </div>
            {quote.totals.discount > 0 && (
              <p className="text-right text-xs font-semibold text-accent">
                You save {formatPrice(quote.totals.discount)} in total
              </p>
            )}
          </div>

          <p className="mt-6 border-t border-line pt-4 text-xs leading-relaxed text-muted">
            {itemCount} item{itemCount === 1 ? "" : "s"} across{" "}
            {quote.groups.length} brand{quote.groups.length === 1 ? "" : "s"}. Prices
            are in PKR and valid until{" "}
            <strong className="font-semibold text-ink">{fmtDate(validUntil)}</strong>.
            Subject to stock availability at the time of order. This quotation is
            generated automatically from today&apos;s shop rates.
          </p>
        </div>
      </div>

      <div className="no-print mt-6 flex flex-wrap gap-3">
        <Link href="/checkout" className={buttonClasses("primary", "md")}>
          <ShoppingCart className="h-4 w-4" /> Place this as an order
        </Link>
        <Link href="/contact" className={buttonClasses("outline", "md")}>
          Contact the shop
        </Link>
      </div>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-brand/20 bg-white p-10 text-center">
      <p className="font-bold text-ink">{title}</p>
      <p className="mt-1 text-sm text-muted">{body}</p>
      <Link href="/products" className={buttonClasses("primary", "md", "mt-4")}>
        Browse products
      </Link>
    </div>
  );
}
