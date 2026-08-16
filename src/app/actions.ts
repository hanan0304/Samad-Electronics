"use server";

import { prisma } from "@/lib/prisma";
import { notifyOwner } from "@/lib/notify";
import { generateRef, formatPrice } from "@/lib/utils";
import {
  placeOrderSchema,
  quotationSchema,
  contactSchema,
} from "@/lib/validations";
import { siteConfig } from "@/config/site";

export type ActionResult =
  | { ok: true; ref?: string }
  | { ok: false; error: string };

/** Create with a unique human-friendly ref, retrying on rare collisions. */
async function withUniqueRef<T>(
  prefix: string,
  create: (ref: string) => Promise<T>
): Promise<T> {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await create(generateRef(prefix));
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code;
      if (code === "P2002" && attempt < 4) continue; // duplicate ref, retry
      throw e;
    }
  }
  throw new Error("Could not generate a unique reference. Please try again.");
}

// ---- Place order -----------------------------------------------------------

export async function placeOrder(input: unknown): Promise<ActionResult> {
  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid details." };
  }
  const data = parsed.data;

  try {
    // Re-price against the database so totals can't be tampered with client-side.
    const ids = data.items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: ids }, isActive: true },
      select: { id: true, name: true, price: true },
    });
    const priceMap = new Map(dbProducts.map((p) => [p.id, p]));

    const lineItems = data.items
      .map((i) => {
        const p = priceMap.get(i.productId);
        if (!p) return null;
        const unitPrice = p.price.toNumber();
        return {
          productId: p.id,
          productName: p.name,
          unitPrice,
          quantity: i.quantity,
          lineTotal: unitPrice * i.quantity,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    if (lineItems.length === 0) {
      return { ok: false, error: "The items in your cart are no longer available." };
    }

    const total = lineItems.reduce((n, i) => n + i.lineTotal, 0);

    const order = await withUniqueRef("ORD", (ref) =>
      prisma.order.create({
        data: {
          orderNumber: ref,
          customerName: data.customerName,
          phone: data.phone,
          email: data.email || null,
          address: data.address,
          city: data.city || "Lahore",
          notes: data.notes || null,
          total,
          items: { create: lineItems },
        },
      })
    );

    await notifyOwner({
      subject: `🛒 New Order ${order.orderNumber} — ${formatPrice(total)}`,
      lines: [
        `Customer: ${data.customerName}`,
        `Phone: ${data.phone}`,
        data.email ? `Email: ${data.email}` : "",
        `Address: ${data.address}, ${data.city || "Lahore"}`,
        data.notes ? `Notes: ${data.notes}` : "",
        "",
        ...lineItems.map(
          (i) => `• ${i.quantity} × ${i.productName} = ${formatPrice(i.lineTotal)}`
        ),
        "",
        `TOTAL: ${formatPrice(total)}`,
      ].filter(Boolean),
    });

    return { ok: true, ref: order.orderNumber };
  } catch (e) {
    console.error("[placeOrder] failed:", e);
    return {
      ok: false,
      error:
        "Sorry, we couldn't place your order right now. Please try again or call us.",
    };
  }
}

// ---- Request quotation -----------------------------------------------------

export async function requestQuotation(input: unknown): Promise<ActionResult> {
  const parsed = quotationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid details." };
  }
  const data = parsed.data;

  try {
    const ids = data.items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true },
    });
    const nameMap = new Map(dbProducts.map((p) => [p.id, p.name]));

    const items = data.items
      .map((i) => {
        const name = nameMap.get(i.productId);
        if (!name) return null;
        return { productId: i.productId, productName: name, quantity: i.quantity };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    if (items.length === 0) {
      return { ok: false, error: "Please add valid items to request a quotation." };
    }

    const quote = await withUniqueRef("QTN", (ref) =>
      prisma.quotation.create({
        data: {
          quoteNumber: ref,
          customerName: data.customerName,
          phone: data.phone,
          email: data.email || null,
          message: data.message || null,
          items: { create: items },
        },
      })
    );

    await notifyOwner({
      subject: `📝 New Quotation Request ${quote.quoteNumber}`,
      lines: [
        `Customer: ${data.customerName}`,
        `Phone: ${data.phone}`,
        data.email ? `Email: ${data.email}` : "",
        data.message ? `Message: ${data.message}` : "",
        "",
        ...items.map((i) => `• ${i.quantity} × ${i.productName}`),
      ].filter(Boolean),
    });

    return { ok: true, ref: quote.quoteNumber };
  } catch (e) {
    console.error("[requestQuotation] failed:", e);
    return {
      ok: false,
      error: "Sorry, we couldn't send your request. Please try again or call us.",
    };
  }
}

// ---- Instant mixed-brand quotation (from the cart) -------------------------

export type CartQuoteLine = {
  productId: string;
  name: string;
  unit: string;
  /** Current list (undiscounted) price per unit, in PKR. */
  price: number;
  quantity: number;
  listTotal: number;
  netTotal: number;
};

export type CartQuoteGroup = {
  brandName: string;
  logoUrl: string | null;
  discountPercent: number;
  lines: CartQuoteLine[];
  listTotal: number;
  discountTotal: number;
  netTotal: number;
};

export type CartQuote = {
  groups: CartQuoteGroup[];
  totals: { list: number; discount: number; net: number };
};

export type CartQuoteResult =
  | { ok: true; quote: CartQuote }
  | { ok: false; error: string };

/**
 * Build an instant, mixed-brand quotation straight from the customer's cart.
 *
 * Everything is re-priced from the database (never trusting client prices) and
 * grouped by the company that makes each item, so one quotation can span many
 * brands. Each brand's current dealer discount is applied to its own lines. The
 * result is shown on screen and saved as a PDF — it is not stored, so no admin
 * record is created (this is self-service pricing, like the per-brand builder).
 */
export async function buildCartQuote(
  input: { productId: string; quantity: number }[]
): Promise<CartQuoteResult> {
  if (!Array.isArray(input) || input.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }

  // Collapse duplicates and clamp quantities defensively.
  const wanted = new Map<string, number>();
  for (const i of input) {
    if (!i || typeof i.productId !== "string") continue;
    const q = Math.min(Math.max(Math.trunc(Number(i.quantity) || 0), 0), 9999);
    if (q > 0) wanted.set(i.productId, (wanted.get(i.productId) ?? 0) + q);
  }
  if (wanted.size === 0) return { ok: false, error: "Your cart is empty." };

  try {
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: [...wanted.keys()] }, isActive: true },
      select: {
        id: true,
        name: true,
        unit: true,
        price: true,
        brand: {
          select: { name: true, slug: true, logoUrl: true, discountPercent: true },
        },
      },
    });

    if (dbProducts.length === 0) {
      return { ok: false, error: "The items in your cart are no longer available." };
    }

    // Group by brand slug; unbranded items fall into one "Other items" group.
    const groups = new Map<string, CartQuoteGroup>();
    for (const p of dbProducts) {
      const quantity = wanted.get(p.id);
      if (!quantity) continue;
      const price = p.price.toNumber();
      const discountPercent = p.brand ? Number(p.brand.discountPercent) : 0;
      const listTotal = price * quantity;
      const netTotal = listTotal - (listTotal * discountPercent) / 100;

      const key = p.brand?.slug ?? "__none__";
      let g = groups.get(key);
      if (!g) {
        g = {
          brandName: p.brand?.name ?? "Other items",
          logoUrl: p.brand?.logoUrl ?? null,
          discountPercent,
          lines: [],
          listTotal: 0,
          discountTotal: 0,
          netTotal: 0,
        };
        groups.set(key, g);
      }
      g.lines.push({
        productId: p.id,
        name: p.name,
        unit: p.unit,
        price,
        quantity,
        listTotal,
        netTotal,
      });
      g.listTotal += listTotal;
      g.netTotal += netTotal;
      g.discountTotal += listTotal - netTotal;
    }

    // Branded groups first (biggest value on top); unbranded items last.
    const ordered = [...groups.entries()]
      .sort(([ka, a], [kb, b]) => {
        if (ka === "__none__") return 1;
        if (kb === "__none__") return -1;
        return b.netTotal - a.netTotal || a.brandName.localeCompare(b.brandName);
      })
      .map(([, g]) => g);

    const totals = ordered.reduce(
      (t, g) => ({
        list: t.list + g.listTotal,
        discount: t.discount + g.discountTotal,
        net: t.net + g.netTotal,
      }),
      { list: 0, discount: 0, net: 0 }
    );

    return { ok: true, quote: { groups: ordered, totals } };
  } catch (e) {
    console.error("[buildCartQuote] failed:", e);
    return {
      ok: false,
      error: "Sorry, we couldn't build your quotation right now. Please try again.",
    };
  }
}

// ---- Contact inquiry -------------------------------------------------------

export async function submitContact(input: unknown): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid details." };
  }
  const data = parsed.data;

  try {
    await prisma.contactInquiry.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        subject: data.subject || null,
        message: data.message,
      },
    });

    await notifyOwner({
      subject: `✉️ New Inquiry from ${data.name}`,
      lines: [
        `Name: ${data.name}`,
        `Phone: ${data.phone}`,
        data.email ? `Email: ${data.email}` : "",
        data.subject ? `Subject: ${data.subject}` : "",
        "",
        data.message,
      ].filter(Boolean),
    });

    return { ok: true };
  } catch (e) {
    console.error("[submitContact] failed:", e);
    return {
      ok: false,
      error: `Sorry, we couldn't send your message. Please call us at ${siteConfig.contact.phone}.`,
    };
  }
}
