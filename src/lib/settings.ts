import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";
import { toInternationalNumber } from "@/lib/utils";

export type ResolvedSettings = {
  shopName: string;
  phone: string;
  phone2: string;
  whatsapp: string;
  /** Ready-to-use WhatsApp chat URL (custom short link, or built from the number). */
  whatsappLink: string;
  email: string;
  address: string;
  mapEmbedUrl: string;
  mapLink: string;
  facebook: string;
  instagram: string;
};

/**
 * Prefer an explicit wa.me short link; otherwise build one from the number.
 * Pakistani numbers written locally ("0309…") become international ("92309…").
 */
function waLink(custom?: string | null, number?: string | null): string {
  const link = custom?.trim();
  if (link) return link;
  const digits = (number || "").replace(/[^\d]/g, "");
  if (!digits) return "";
  const intl = digits.startsWith("92")
    ? digits
    : digits.startsWith("0")
      ? `92${digits.slice(1)}`
      : digits;
  return `https://wa.me/${intl}`;
}

/**
 * Returns the shop contact settings, using the editable DB row when present
 * and falling back to the defaults in src/config/site.ts. Safe to call even
 * before the database is set up (falls back to config on any error).
 */
export async function getSettings(): Promise<ResolvedSettings> {
  const fallback: ResolvedSettings = {
    shopName: siteConfig.name,
    phone: siteConfig.contact.phone,
    phone2: siteConfig.contact.phone2,
    whatsapp: siteConfig.contact.whatsapp,
    whatsappLink: waLink(
      siteConfig.contact.whatsappLink,
      siteConfig.contact.whatsapp
    ),
    email: siteConfig.contact.email,
    address: siteConfig.contact.fullAddress,
    mapEmbedUrl: siteConfig.contact.mapEmbedUrl,
    mapLink: siteConfig.contact.mapLink,
    facebook: siteConfig.social.facebook,
    instagram: siteConfig.social.instagram,
  };

  try {
    const row = await prisma.setting.findUnique({ where: { id: "main" } });
    if (!row) return fallback;
    return {
      shopName: row.shopName || fallback.shopName,
      phone: row.phone || fallback.phone,
      phone2: row.phone2 || fallback.phone2,
      whatsapp: row.whatsapp || fallback.whatsapp,
      whatsappLink:
        waLink(row.whatsappLink, row.whatsapp) || fallback.whatsappLink,
      email: row.email || fallback.email,
      address: row.address || fallback.address,
      mapEmbedUrl: row.mapEmbedUrl || fallback.mapEmbedUrl,
      mapLink: row.mapLink || fallback.mapLink,
      facebook: row.facebook || fallback.facebook,
      instagram: row.instagram || fallback.instagram,
    };
  } catch {
    return fallback;
  }
}

/**
 * The shop's WhatsApp number in international form (e.g. "92309…"), ready to
 * drop into a `wa.me/<number>` link. Used to show a "Contact on WhatsApp"
 * button on every product card. Safe to call before the DB is set up — it
 * falls back to the number in src/config/site.ts.
 */
export async function getWhatsAppNumber(): Promise<string> {
  try {
    const s = await getSettings();
    return toInternationalNumber(s.whatsapp);
  } catch {
    return toInternationalNumber(siteConfig.contact.whatsapp);
  }
}
