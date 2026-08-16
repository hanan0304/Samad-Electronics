/**
 * Central site configuration.
 *
 * Edit the values here (and the matching rows in the Admin → Settings page)
 * to change how the shop appears across the whole site and in Google results.
 *
 * The public site URL comes from the NEXT_PUBLIC_SITE_URL environment variable
 * so you can change your domain in ONE place (.env) once you buy it.
 */

export const siteConfig = {
  /** Brand / shop name shown in the header, footer, and page titles. */
  name: "Samad Traders",
  /** Short legal/long name used in some SEO contexts. */
  legalName: "Samad Traders — Electric, Sanitary & Fancy Lights",
  /** One-line description used as the default meta description. */
  description:
    "Samad Traders in Lahore — your one-stop shop for electric goods, sanitary ware, bathroom fittings and fancy lights. Live prices, trusted brands, and fast local service.",
  /** Public base URL. Overridden by NEXT_PUBLIC_SITE_URL in the environment. */
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.samadtraders.com",

  /** City / area you serve — used heavily for local SEO. */
  city: "Lahore",
  region: "Punjab",
  country: "Pakistan",
  countryCode: "PK",

  /** Contact details (also editable in Admin → Settings, which overrides these). */
  contact: {
    /** Shop landline. */
    phone: "042-35114229",
    /** Second contact number (mobile). */
    phone2: "0309-5198898",
    whatsapp: "0309-5198898",
    /** Custom wa.me short link from WhatsApp Business (takes priority). */
    whatsappLink: "https://wa.me/message/NF4E4GXXBDVHK1",
    email: "info@samadtraders.com",
    addressLine: "18-2-C2 Main College Road, Near Butt Chowk, Township",
    area: "Township, Lahore",
    fullAddress:
      "18-2-C2 Main College Road, Near Butt Chowk, Opposite Old NADRA Office, Township, Lahore, Punjab, Pakistan",
    /** Google Maps embed URL — pins the verified "Samad Traders" business listing. */
    mapEmbedUrl:
      "https://www.google.com/maps?q=Samad+Traders+Electric+Sanitary+%26+Fancy+Lighting,+Main+College+Road,+Township,+Lahore&output=embed",
    /** A normal Google Maps link (for the "Get Directions" button). */
    mapLink:
      "https://www.google.com/maps/search/?api=1&query=Samad+Traders+Electric+Sanitary+%26+Fancy+Lighting,+Main+College+Road,+Township,+Lahore",
    geo: { lat: 31.4697, lng: 74.3095 },
  },

  /** Opening hours shown on the contact page and in LocalBusiness structured data. */
  hours: [
    { days: "Monday – Saturday", open: "09:00", close: "21:00" },
    { days: "Friday", open: "09:00", close: "12:30 & 14:30 – 21:00" },
    { days: "Sunday", open: "Closed", close: "" },
  ],

  /** Social / external links (leave blank to hide). */
  social: {
    facebook: "",
    instagram: "",
    youtube: "",
  },

  /** Keywords that describe the business, used for SEO defaults. */
  keywords: [
    "electric shop Lahore",
    "sanitary shop Lahore",
    "fancy lights Lahore",
    "bathroom fittings Lahore",
    "electric switches Lahore",
    "sanitary ware Lahore",
    "wiring accessories Lahore",
    "LED lights Lahore",
    "Samad Traders",
  ],
} as const;

export type SiteConfig = typeof siteConfig;
