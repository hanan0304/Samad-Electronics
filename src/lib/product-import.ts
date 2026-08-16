import "server-only";
import type { Department } from "@prisma/client";

/**
 * Bulk product import — reading a supplier's spreadsheet.
 *
 * Handles .xlsx / .xls (via exceljs) and .csv. Headers are matched loosely so
 * a shop owner does not have to rename their columns: "Product Name", "name",
 * "PRODUCT" and "item" all map to the same field.
 */

export type ImportRow = {
  /** 1-based row number in the original file, for error messages. */
  row: number;
  name: string;
  price: number | null;
  oldPrice: number | null;
  unit: string;
  sku: string;
  category: string;
  /** Raw department text from the sheet (mapped to an enum at import time). */
  department: string;
  brand: string;
  shortDesc: string;
  /** Product photo links (Cloudinary or any direct https image URL). */
  images: string[];
  /** Problems that stop this row being imported. */
  errors: string[];
};

/** Every header we understand, mapped to our field name. */
const HEADER_ALIASES: Record<string, string> = {
  name: "name",
  product: "name",
  "product name": "name",
  item: "name",
  "item name": "name",
  title: "name",

  price: "price",
  rate: "price",
  "sale price": "price",
  "selling price": "price",
  "new price": "price",
  amount: "price",

  "old price": "oldPrice",
  "was price": "oldPrice",
  mrp: "oldPrice",
  "list price": "oldPrice",
  "previous price": "oldPrice",

  unit: "unit",
  uom: "unit",
  "unit of measure": "unit",

  sku: "sku",
  code: "sku",
  "item code": "sku",
  "product code": "sku",

  category: "category",
  categories: "category",
  type: "category",
  "sub category": "category",
  subcategory: "category",

  department: "department",
  section: "department",
  "main category": "department",

  brand: "brand",
  company: "brand",
  make: "brand",
  manufacturer: "brand",

  "short description": "shortDesc",
  "short desc": "shortDesc",
  description: "shortDesc",
  details: "shortDesc",
  notes: "shortDesc",

  image: "images",
  images: "images",
  "image url": "images",
  "image urls": "images",
  "image link": "images",
  "image links": "images",
  photo: "images",
  photos: "images",
  "photo url": "images",
  "photo link": "images",
  picture: "images",
  img: "images",
};

/** Pull the http(s) image links out of one cell (comma/space/;/| separated). */
function parseImageUrls(raw: string): string[] {
  return raw
    .split(/[\s,;|]+/)
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\/\S+$/i.test(s));
}

/**
 * Trade price lists often label the item column "Description" with no separate
 * name column. Only fall back to it when there is no explicit name column, so a
 * file containing BOTH never mistakes the description for the product name.
 */
const NAME_FALLBACKS = ["shortDesc"];

/**
 * Map free-text from the sheet's "Department" column to one of the three fixed
 * departments. Accepts common spellings/synonyms; returns null if it can't tell
 * (the caller then falls back to a sensible default).
 */
export function parseDepartment(raw: string): Department | null {
  const s = raw.trim().toLowerCase();
  if (!s) return null;
  if (/electr|wir|cable|switch|breaker|fan|db|meter/.test(s)) return "ELECTRIC";
  if (/sanit|bath|plumb|pipe|ppr|pvc|tap|toilet|basin|commode|shower|faucet/.test(s))
    return "SANITARY";
  if (/fancy|light|lamp|chandelier|led|decor|pendant/.test(s)) return "FANCY_LIGHTS";
  return null;
}

function normaliseHeader(h: string): string | null {
  const key = String(h || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
  return HEADER_ALIASES[key] ?? null;
}

/** "Rs 1,450.00" / "1450" / 1450 → 1450 */
function parseNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const cleaned = String(v).replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function text(v: unknown): string {
  if (v === null || v === undefined) return "";
  // exceljs can hand back rich text / formula result objects.
  if (typeof v === "object") {
    const o = v as { text?: string; result?: unknown; richText?: { text: string }[] };
    if (typeof o.text === "string") return o.text.trim();
    if (Array.isArray(o.richText)) return o.richText.map((r) => r.text).join("").trim();
    if (o.result !== undefined) return String(o.result).trim();
    return "";
  }
  return String(v).trim();
}

/** Split one CSV line, honouring quoted fields containing commas. */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQuotes = false;
      } else cur += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function toGrid(csv: string): unknown[][] {
  return csv
    .split(/\r?\n/)
    .filter((l) => l.trim() !== "")
    .map(splitCsvLine);
}

async function xlsxToGrid(buffer: ArrayBuffer): Promise<unknown[][]> {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const sheet = wb.worksheets[0];
  if (!sheet) return [];
  const grid: unknown[][] = [];
  sheet.eachRow({ includeEmpty: false }, (row) => {
    const values = row.values as unknown[];
    // exceljs uses 1-based arrays with a leading hole.
    grid.push(values.slice(1));
  });
  return grid;
}

/**
 * Turn an uploaded spreadsheet into validated rows ready for preview.
 * Never throws on bad data — problems are attached to each row instead.
 */
export async function parseProductFile(file: File): Promise<{
  rows: ImportRow[];
  headerProblem?: string;
}> {
  const name = file.name.toLowerCase();
  let grid: unknown[][];

  if (name.endsWith(".csv")) {
    grid = toGrid(await file.text());
  } else {
    grid = await xlsxToGrid(await file.arrayBuffer());
  }

  if (grid.length < 2) {
    return {
      rows: [],
      headerProblem:
        "The file looks empty. It needs a header row and at least one product.",
    };
  }

  const headers = grid[0].map((h) => normaliseHeader(text(h)));

  // No explicit name column? Promote the first acceptable fallback instead.
  if (!headers.includes("name")) {
    const idx = headers.findIndex((h) => h && NAME_FALLBACKS.includes(h));
    if (idx !== -1) headers[idx] = "name";
  }
  if (!headers.includes("name")) {
    return {
      rows: [],
      headerProblem:
        'No product name column found. Add a column called "Name" (or "Product"), and one called "Price".',
    };
  }
  if (!headers.includes("price")) {
    return {
      rows: [],
      headerProblem:
        'No price column found. Add a column called "Price" (or "Rate").',
    };
  }

  const rows: ImportRow[] = [];
  for (let i = 1; i < grid.length; i++) {
    const cells = grid[i];
    const get = (field: string): unknown => {
      const idx = headers.indexOf(field);
      return idx === -1 ? "" : cells[idx];
    };

    const rowName = text(get("name"));
    const price = parseNumber(get("price"));
    // Skip completely blank lines silently.
    if (!rowName && price === null) continue;

    const errors: string[] = [];
    if (!rowName) errors.push("Missing product name");
    if (price === null) errors.push("Missing or invalid price");
    else if (price < 0) errors.push("Price cannot be negative");

    rows.push({
      row: i + 1,
      name: rowName,
      price,
      oldPrice: parseNumber(get("oldPrice")),
      unit: text(get("unit")) || "per piece",
      sku: text(get("sku")),
      category: text(get("category")),
      department: text(get("department")),
      brand: text(get("brand")),
      shortDesc: text(get("shortDesc")),
      images: parseImageUrls(text(get("images"))),
      errors,
    });
  }

  return { rows };
}
