import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import slugify from "slugify";

/** Merge Tailwind class names, resolving conflicts (later wins). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as Pakistani Rupees, e.g. 1250 → "Rs 1,250". */
export function formatPrice(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;
  if (!isFinite(n)) return "Rs 0";
  return `Rs ${new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
  }).format(n)}`;
}

/** Make a URL-friendly slug from any text. */
export function toSlug(text: string): string {
  return slugify(text, { lower: true, strict: true, trim: true });
}

/** A short human-friendly order/quote number, e.g. "ORD-7F3K2Q". */
export function generateRef(prefix: string): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) {
    s += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${prefix}-${s}`;
}

/** Format a date for the admin panel, e.g. "19 Jul 2026, 3:40 PM". */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

/** Truncate text to a max length, adding an ellipsis. */
export function truncate(text: string, max = 160): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}

/**
 * Turn a locally written Pakistani number into the international form that
 * wa.me links need: "0309-5198898" → "923095198898".
 */
export function toInternationalNumber(phone: string): string {
  const digits = (phone || "").replace(/[^\d]/g, "");
  if (!digits) return "";
  if (digits.startsWith("92")) return digits;
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  if (digits.length === 10) return `92${digits}`;
  return digits;
}
