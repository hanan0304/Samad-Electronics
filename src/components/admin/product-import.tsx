"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Loader2,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import {
  parseImportFileAction,
  importProductsAction,
} from "@/app/admin/actions";
import type { ImportRow } from "@/lib/product-import";
import { Button, buttonClasses } from "@/components/ui/button";
import { inputClass } from "@/components/forms/field";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

type Category = { id: string; name: string };

/** Example file the owner can fill in — keeps the expected format obvious. */
const TEMPLATE_CSV = [
  "Name,Price,Old Price,Unit,Department,Category,Brand,Short Description,Image URL",
  '9W LED Bulb (Cool White),240,300,per piece,Fancy Lights,LED Bulbs & Tubes,Philips,Energy-saving 9W LED bulb,https://res.cloudinary.com/demo/image/upload/sample.jpg',
  '7/29 Copper Wire,6450,,per 90m coil,Electric,Wires & Cables,Fast Cables,Pure copper house wiring cable,',
  'PPRC Pipe 1 inch,410,,per meter,Sanitary,PPRC & PVC Fittings,Popular Pipes,Hot & cold PPRC pipe,',
].join("\n");

export function ProductImport({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ImportRow[] | null>(null);
  const [fallbackCategory, setFallbackCategory] = useState(
    categories[0]?.id ?? ""
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{
    created: number;
    skipped: { row: number; reason: string }[];
    newCategories: number;
  } | null>(null);

  const valid = rows?.filter((r) => r.errors.length === 0) ?? [];
  const invalid = rows?.filter((r) => r.errors.length > 0) ?? [];

  async function onFile(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setDone(null);
    setRows(null);
    setFileName(files[0].name);
    setBusy(true);
    const fd = new FormData();
    fd.set("file", files[0]);
    const res = await parseImportFileAction(fd);
    setBusy(false);
    if (res.ok) setRows(res.rows);
    else setError(res.error);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function runImport() {
    if (!rows) return;
    setBusy(true);
    setError(null);
    const res = await importProductsAction(rows, fallbackCategory);
    setBusy(false);
    if (res.ok) {
      setDone({
        created: res.created,
        skipped: res.skipped,
        newCategories: res.newCategories,
      });
      setRows(null);
      router.refresh();
    } else {
      setError(res.error);
    }
  }

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "samad-traders-product-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // ---- Finished -----------------------------------------------------------
  if (done) {
    return (
      <div className="max-w-2xl rounded-xl bg-white p-6 shadow-card ring-1 ring-black/5">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-8 w-8 shrink-0 text-green-600" />
          <div>
            <h2 className="text-lg font-extrabold text-brand-dark">
              {done.created} product{done.created === 1 ? "" : "s"} added
            </h2>
            <p className="text-sm text-muted">
              They are live on your store now.
            </p>
          </div>
        </div>

        {done.newCategories > 0 && (
          <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800 ring-1 ring-green-200">
            {done.newCategories} new categor
            {done.newCategories === 1 ? "y was" : "ies were"} created automatically
            from your file — they now show in Admin and on the website.
          </p>
        )}

        {done.skipped.length > 0 && (
          <div className="mt-5 rounded-lg bg-amber-50 p-4 ring-1 ring-amber-200">
            <p className="flex items-center gap-2 text-sm font-bold text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              {done.skipped.length} row
              {done.skipped.length === 1 ? " was" : "s were"} skipped
            </p>
            <ul className="mt-2 space-y-1 text-sm text-amber-900">
              {done.skipped.slice(0, 12).map((s) => (
                <li key={s.row}>
                  Row {s.row}: {s.reason}
                </li>
              ))}
              {done.skipped.length > 12 && (
                <li>…and {done.skipped.length - 12} more</li>
              )}
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/admin/products" className={buttonClasses("primary", "md")}>
            View products
          </Link>
          <button
            onClick={() => {
              setDone(null);
              setFileName("");
            }}
            className={buttonClasses("outline", "md")}
          >
            Import another file
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* How it works */}
      <div className="max-w-3xl rounded-xl bg-white p-5 shadow-card ring-1 ring-black/5">
        <h2 className="font-bold text-brand-dark">How this works</h2>
        <ol className="mt-3 space-y-2 text-sm text-muted">
          <li>
            <strong className="text-ink">1.</strong> Put your products in an
            Excel or CSV file — one product per row.
          </li>
          <li>
            <strong className="text-ink">2.</strong> It must have a{" "}
            <strong className="text-ink">Name</strong> column and a{" "}
            <strong className="text-ink">Price</strong> column. Old Price, Unit,
            Department, Category, Brand, Short Description and Image URL are
            optional. You don&apos;t need an SKU/code column — it&apos;s created
            automatically.
          </li>
          <li>
            <strong className="text-ink">•</strong> If you write a{" "}
            <strong className="text-ink">Category</strong> that doesn&apos;t exist
            yet, it&apos;s created for you under the{" "}
            <strong className="text-ink">Department</strong> you give (Electric,
            Sanitary or Fancy Lights) and shown on the website automatically.
          </li>
          <li>
            <strong className="text-ink">•</strong> Add photos by pasting an{" "}
            <strong className="text-ink">Image URL</strong> (a Cloudinary link, or
            any direct https image link) — it becomes the product&apos;s photo
            automatically. For more than one photo, separate the links with a
            space or a <code>|</code> in the same cell.
          </li>
          <li>
            <strong className="text-ink">3.</strong> Upload it below, check the
            preview, then confirm. Nothing is saved until you confirm.
          </li>
        </ol>
        <button
          onClick={downloadTemplate}
          className={buttonClasses("outline", "sm", "mt-4")}
        >
          <Download className="h-4 w-4" /> Download example file
        </button>

        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
          <strong>About PDFs:</strong> a PDF cannot be read reliably — every PDF
          lays its table out differently, so prices would come out wrong. If
          your list is a PDF, open it and save it as Excel or CSV first, then
          upload that.
        </p>
      </div>

      {/* Upload */}
      <div className="max-w-3xl">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand/30 bg-white px-6 py-10 text-brand transition hover:bg-brand-light disabled:opacity-60"
        >
          {busy && !rows ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="font-semibold">Reading your file…</span>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8" />
              <span className="font-semibold">
                Choose an Excel or CSV file
              </span>
              <span className="text-sm text-muted">
                .xlsx, .xls or .csv — up to 8 MB
              </span>
            </>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => onFile(e.target.files)}
        />
        {fileName && (
          <p className="mt-2 flex items-center gap-2 text-sm text-muted">
            <FileSpreadsheet className="h-4 w-4" /> {fileName}
          </p>
        )}
        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
      </div>

      {/* Preview */}
      {rows && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-lg bg-green-50 px-3 py-1.5 text-sm font-bold text-green-700 ring-1 ring-green-200">
              {valid.length} ready to import
            </span>
            {invalid.length > 0 && (
              <span className="rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-800 ring-1 ring-amber-200">
                {invalid.length} will be skipped
              </span>
            )}
          </div>

          {categories.length > 0 && (
            <div className="max-w-md">
              <label className="mb-1 block text-sm font-semibold text-ink">
                Category for rows that don&apos;t name one
              </label>
              <select
                value={fallbackCategory}
                onChange={(e) => setFallbackCategory(e.target.value)}
                className={inputClass}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-muted">
                Rows whose Category matches an existing one use it. A new Category
                name is created automatically (under its Department). Only rows
                with no Category at all fall back to the one chosen here.
              </p>
            </div>
          )}

          <div className="overflow-x-auto rounded-xl bg-white shadow-card ring-1 ring-black/5">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted">
                  <th className="p-3">Row</th>
                  <th className="p-3">Name</th>
                  <th className="p-3 text-right">Price</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Brand</th>
                  <th className="p-3">Photo</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.slice(0, 100).map((r) => (
                  <tr
                    key={r.row}
                    className={r.errors.length ? "bg-amber-50/60" : ""}
                  >
                    <td className="p-3 tabular-nums text-muted">{r.row}</td>
                    <td className="p-3 font-semibold text-ink">
                      {r.name || <span className="text-muted">—</span>}
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {r.price === null ? "—" : formatPrice(r.price)}
                    </td>
                    <td className="p-3 text-muted">{r.unit}</td>
                    <td className="p-3 text-muted">{r.department || "—"}</td>
                    <td className="p-3 text-muted">{r.category || "—"}</td>
                    <td className="p-3 text-muted">{r.brand || "—"}</td>
                    <td className="p-3">
                      {r.images.length > 0 ? (
                        <span className="inline-flex items-center gap-1.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={r.images[0]}
                            alt=""
                            className="h-8 w-8 rounded object-cover ring-1 ring-black/10"
                          />
                          {r.images.length > 1 && (
                            <span className="text-xs text-muted">
                              +{r.images.length - 1}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      {r.errors.length ? (
                        <span className="text-xs font-semibold text-amber-800">
                          {r.errors.join(", ")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Ready
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 100 && (
              <p className="border-t p-3 text-center text-xs text-muted">
                Showing the first 100 rows — all {rows.length} will be imported.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={runImport} disabled={busy || valid.length === 0}>
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Import {valid.length} product{valid.length === 1 ? "" : "s"}
            </Button>
            <button
              onClick={() => {
                setRows(null);
                setFileName("");
              }}
              className={buttonClasses("outline", "md")}
            >
              <ArrowLeft className="h-4 w-4" /> Choose a different file
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
