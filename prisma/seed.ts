/**
 * Seed script — run with:  npm run db:seed
 *
 * Creates:
 *  - the first admin user (from ADMIN_EMAIL / ADMIN_PASSWORD in .env)
 *  - a Settings row
 *  - brands, categories (Electric / Sanitary / Fancy Lights)
 *  - a realistic starter catalog of products
 *
 * Safe to re-run: it upserts by unique slug/email so it won't create duplicates.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import slugify from "slugify";

/**
 * The shop's real, official brands (mirrors the "What we stock" cards on the
 * About page). Kept in step with prisma/sync-brands.ts.
 */
const OFFICIAL_BRANDS = [
  "Pakistan Cables",
  "GM Cables",
  "Fast Cables",
  "Newage Cables",
  "English Cables",
  "Pak Cables",
  "Schneider",
  "Terasaki",
  "Hyundai",
  "Legrand",
  "Royal",
  "SK",
  "Pak Fan",
  "Taimoor",
  "Hino",
  "Philips",
  "Pak Light",
  "Lahore Light",
  "Alva",
  "Popular Pipes",
  "Dura Flow",
  "Faisal",
  "TU",
];

const prisma = new PrismaClient();

function slug(s: string): string {
  return slugify(s, { lower: true, strict: true, trim: true });
}

async function main() {
  // ---- Admin user ----------------------------------------------------------
  const email = (process.env.ADMIN_EMAIL || "owner@samadtraders.example")
    .toLowerCase()
    .trim();
  const password = process.env.ADMIN_PASSWORD || "admin12345";
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: "Shop Owner" },
  });
  console.log(`✔ Admin user ready: ${email}`);

  // ---- Settings row --------------------------------------------------------
  await prisma.setting.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main", shopName: "Samad Traders" },
  });

  // ---- Brands --------------------------------------------------------------
  const brandNames = [
    "Philips",
    "Osram",
    "Havells",
    "GM",
    "Opple",
    "Sonex",
    "Master",
    "Porta",
    "Rossi",
    "Sitara",
  ];
  const brands: Record<string, string> = {};
  for (const name of brandNames) {
    const b = await prisma.brand.upsert({
      where: { slug: slug(name) },
      update: {},
      create: { name, slug: slug(name) },
    });
    brands[name] = b.id;
  }
  // The shop's real, official brands — shown on the slider and in quotations.
  for (const name of OFFICIAL_BRANDS) {
    await prisma.brand.upsert({
      where: { slug: slug(name) },
      update: {},
      create: { name, slug: slug(name) },
    });
  }
  console.log(
    `✔ brands ready (${brandNames.length} demo + ${OFFICIAL_BRANDS.length} official)`
  );

  // ---- Categories ----------------------------------------------------------
  const categoryDefs = [
    // ELECTRIC
    { name: "Wall Switches & Sockets", department: "ELECTRIC", desc: "Modular wall switches, sockets and switch plates from trusted brands." },
    { name: "Wires & Cables", department: "ELECTRIC", desc: "Copper wires and cables for home and commercial wiring." },
    { name: "Circuit Breakers & DBs", department: "ELECTRIC", desc: "MCBs, breakers and distribution boards for safe wiring." },
    { name: "LED Bulbs & Tubes", department: "ELECTRIC", desc: "Energy-saving LED bulbs, tube lights and panel lights." },
    { name: "Ceiling Fans", department: "ELECTRIC", desc: "Ceiling, bracket and exhaust fans for every room." },
    { name: "Extension Boards", department: "ELECTRIC", desc: "Multi-plug extension boards and power strips." },
    // SANITARY
    { name: "Bathroom Faucets & Taps", department: "SANITARY", desc: "Basin mixers, pillar taps and kitchen faucets." },
    { name: "Wash Basins", department: "SANITARY", desc: "Wall-hung and pedestal wash basins in modern designs." },
    { name: "Commodes & Toilets", department: "SANITARY", desc: "One-piece and two-piece commodes and toilet suites." },
    { name: "Showers & Shower Sets", department: "SANITARY", desc: "Hand showers, rain showers and complete shower sets." },
    { name: "PPRC & PVC Fittings", department: "SANITARY", desc: "Pipes, elbows and fittings for plumbing." },
    { name: "Bathroom Accessories", department: "SANITARY", desc: "Towel rails, soap holders and bathroom hardware." },
    // FANCY_LIGHTS
    { name: "Chandeliers", department: "FANCY_LIGHTS", desc: "Statement chandeliers for lounges and dining rooms." },
    { name: "Wall & Bracket Lights", department: "FANCY_LIGHTS", desc: "Decorative wall lights and outdoor bracket lights." },
    { name: "Ceiling & Pendant Lights", department: "FANCY_LIGHTS", desc: "Modern ceiling lights and hanging pendant lights." },
    { name: "LED Strips & Profile", department: "FANCY_LIGHTS", desc: "Flexible LED strips and aluminium profile lighting." },
    { name: "Outdoor & Garden Lights", department: "FANCY_LIGHTS", desc: "Weatherproof gate, garden and facade lights." },
  ];

  const categories: Record<string, { id: string; department: string }> = {};
  let order = 0;
  for (const c of categoryDefs) {
    const cat = await prisma.category.upsert({
      where: { slug: slug(c.name) },
      update: { description: c.desc, department: c.department as never },
      create: {
        name: c.name,
        slug: slug(c.name),
        department: c.department as never,
        description: c.desc,
        sortOrder: order++,
      },
    });
    categories[c.name] = { id: cat.id, department: c.department };
  }
  console.log(`✔ ${categoryDefs.length} categories ready`);

  // ---- Products ------------------------------------------------------------
  type P = {
    name: string;
    category: string;
    brand?: string;
    price: number;
    oldPrice?: number;
    unit?: string;
    short: string;
    desc?: string;
    featured?: boolean;
    specs?: { label: string; value: string }[];
  };

  const products: P[] = [
    // Electric
    { name: "3-Gang 2-Way Wall Switch", category: "Wall Switches & Sockets", brand: "GM", price: 480, oldPrice: 550, unit: "per piece", short: "Premium 3-gang modular switch with fireproof body.", featured: true, specs: [{ label: "Gangs", value: "3" }, { label: "Rating", value: "16A" }, { label: "Colour", value: "White" }] },
    { name: "Single Socket 16A with Cover", category: "Wall Switches & Sockets", brand: "GM", price: 320, unit: "per piece", short: "Heavy-duty 16A power socket with safety shutter." },
    { name: "7/29 Copper Wire (Coil)", category: "Wires & Cables", brand: "Sitara", price: 6450, unit: "per 90m coil", short: "Pure copper 7/29 house wiring cable, 90-meter coil.", featured: true, specs: [{ label: "Conductor", value: "Pure Copper" }, { label: "Length", value: "90 m" }] },
    { name: "Single Pole MCB 20A", category: "Circuit Breakers & DBs", brand: "Havells", price: 690, unit: "per piece", short: "Miniature circuit breaker for overload protection." },
    { name: "9W LED Bulb (Cool White)", category: "LED Bulbs & Tubes", brand: "Philips", price: 240, oldPrice: 300, unit: "per piece", short: "Energy-saving 9W LED bulb, B22/E27 base.", featured: true, specs: [{ label: "Wattage", value: "9W" }, { label: "Colour", value: "Cool White 6500K" }] },
    { name: "18W LED Tube Light 4ft", category: "LED Bulbs & Tubes", brand: "Osram", price: 560, unit: "per piece", short: "Slim 4-foot LED tube, ready-to-fit with fixture." },
    { name: "56\" Ceiling Fan — Deluxe", category: "Ceiling Fans", brand: "GM", price: 8900, oldPrice: 9600, unit: "per piece", short: "High-speed 56-inch ceiling fan with copper winding.", featured: true, specs: [{ label: "Size", value: "56 inch" }, { label: "Winding", value: "99% Copper" }] },
    { name: "6-Way Extension Board", category: "Extension Boards", brand: "GM", price: 1150, unit: "per piece", short: "6-socket extension board with 3-meter cable and switch." },

    // Sanitary
    { name: "Single-Lever Basin Mixer", category: "Bathroom Faucets & Taps", brand: "Sonex", price: 3450, oldPrice: 3900, unit: "per piece", short: "Chrome-finish single-lever basin mixer tap.", featured: true, specs: [{ label: "Finish", value: "Chrome" }, { label: "Material", value: "Brass" }] },
    { name: "Pillar Cock Tap", category: "Bathroom Faucets & Taps", brand: "Master", price: 980, unit: "per piece", short: "Durable pillar cock tap with ceramic disc." },
    { name: "Wall-Hung Wash Basin", category: "Wash Basins", brand: "Porta", price: 4200, unit: "per piece", short: "Modern white ceramic wall-hung wash basin.", featured: true },
    { name: "One-Piece Commode — Modern", category: "Commodes & Toilets", brand: "Porta", price: 18500, oldPrice: 21000, unit: "per piece", short: "Sleek one-piece commode with dual-flush system.", featured: true, specs: [{ label: "Type", value: "One-piece" }, { label: "Flush", value: "Dual" }] },
    { name: "Rain Shower Set (8 inch)", category: "Showers & Shower Sets", brand: "Rossi", price: 5600, unit: "per set", short: "Overhead 8-inch rain shower with arm and mixer." },
    { name: "PPRC Pipe 1 inch", category: "PPRC & PVC Fittings", brand: "Master", price: 410, unit: "per meter", short: "Hot & cold PPRC pipe, pressure-rated for plumbing." },
    { name: "Stainless Towel Rail 24\"", category: "Bathroom Accessories", brand: "Sonex", price: 1350, unit: "per piece", short: "Rust-free stainless steel towel rail." },

    // Fancy Lights
    { name: "8-Light Crystal Chandelier", category: "Chandeliers", brand: "Opple", price: 34500, oldPrice: 39000, unit: "per piece", short: "Elegant 8-light crystal chandelier for lounge & dining.", featured: true, specs: [{ label: "Lights", value: "8" }, { label: "Style", value: "Crystal" }] },
    { name: "Modern LED Wall Light", category: "Wall & Bracket Lights", brand: "Opple", price: 2200, unit: "per piece", short: "Up-down LED wall light for indoor and outdoor use." },
    { name: "Round LED Ceiling Panel 24W", category: "Ceiling & Pendant Lights", brand: "Philips", price: 2650, unit: "per piece", short: "Surface-mounted round LED ceiling light, 24W.", featured: true },
    { name: "Pendant Hanging Light — Gold", category: "Ceiling & Pendant Lights", brand: "Opple", price: 3100, unit: "per piece", short: "Decorative gold pendant light for kitchens & bars." },
    { name: "RGB LED Strip 5m with Remote", category: "LED Strips & Profile", brand: "Philips", price: 1450, oldPrice: 1800, unit: "per roll", short: "Colour-changing 5-meter RGB LED strip with remote.", featured: true },
    { name: "Outdoor Gate Light — Black", category: "Outdoor & Garden Lights", brand: "Rossi", price: 1900, unit: "per piece", short: "Weatherproof wall gate light for entrances." },
  ];

  for (const p of products) {
    const cat = categories[p.category];
    if (!cat) continue;
    await prisma.product.upsert({
      where: { slug: slug(p.name) },
      update: {
        price: p.price,
        oldPrice: p.oldPrice ?? null,
        featured: p.featured ?? false,
      },
      create: {
        name: p.name,
        slug: slug(p.name),
        shortDesc: p.short,
        description:
          p.desc ||
          `${p.short} Available now at Samad Traders, Lahore. Visit our shop or place an order online for fast local delivery. Ask us for a quotation on bulk quantities.`,
        price: p.price,
        oldPrice: p.oldPrice ?? null,
        unit: p.unit ?? "per piece",
        featured: p.featured ?? false,
        inStock: true,
        isActive: true,
        categoryId: cat.id,
        brandId: p.brand ? brands[p.brand] : null,
        specs: p.specs ? (p.specs as never) : undefined,
      },
    });
  }
  console.log(`✔ ${products.length} products ready`);
  console.log("\n✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
