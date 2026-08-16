/**
 * Sync the official brands into the database — run with:
 *   npm run db:sync-brands
 *
 * Purely ADDITIVE and safe to re-run: it upserts each brand in
 * `OFFICIAL_BRANDS` by its unique slug and never deletes or renames anything,
 * so your products and their existing brands are left untouched. New brands get
 * created; brands that already exist are left exactly as they are (logo and
 * discount preserved).
 *
 * After running this, the official brands appear on the home-page slider and in
 * the quotation brand picker. You can then upload logos or set dealer discounts
 * from Admin → Brands.
 *
 * NOTE: keep this list in step with the "What we stock" cards on the About page
 * (src/app/(store)/about/page.tsx) — that page is where these brands are shown.
 */
import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const OFFICIAL_BRANDS = [
  // Cables — 100% original
  "Pakistan Cables",
  "GM Cables",
  "Fast Cables",
  "Newage Cables",
  "English Cables",
  "Pak Cables",
  // Electrical (switches, breakers, changeovers, submeters & DBs)
  "Schneider",
  "Terasaki",
  "Hyundai",
  "Legrand",
  // Fans
  "Royal",
  "SK",
  "Pak Fan",
  "Taimoor",
  "Hino",
  // Lighting
  "Philips",
  "Pak Light",
  "Lahore Light",
  "Alva",
  // Sanitary
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
  let created = 0;
  let existing = 0;
  for (const name of OFFICIAL_BRANDS) {
    const s = slug(name);
    const found = await prisma.brand.findUnique({ where: { slug: s } });
    if (found) {
      existing += 1;
      continue;
    }
    await prisma.brand.create({ data: { name, slug: s } });
    created += 1;
    console.log(`  + added ${name}`);
  }
  console.log(
    `\n✔ Official brands synced — ${created} added, ${existing} already present, ${OFFICIAL_BRANDS.length} total.`
  );
}

main()
  .catch((e) => {
    console.error("Brand sync failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
