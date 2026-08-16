"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Save, Pencil, X, Upload, Trash2 } from "lucide-react";
import { saveBrandAction, deleteBrandAction } from "@/app/admin/actions";
import { uploadImageFromBrowser } from "@/lib/upload-image-client";
import { ACCEPT_ATTR } from "@/lib/upload-constants";
import { DeleteButton } from "./delete-button";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/forms/field";

export type BrandRow = {
  id: string;
  name: string;
  logoUrl: string | null;
  discountPercent: number;
  productCount: number;
};

export function BrandManager({ brands }: { brands: BrandRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<BrandRow | null>(null);
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [discount, setDiscount] = useState<string>("0");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function startEdit(b: BrandRow) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setEditing(b);
    setName(b.name);
    setLogoUrl(b.logoUrl || "");
    setDiscount(String(b.discountPercent ?? 0));
    setError(null);
  }
  function reset() {
    setEditing(null);
    setName("");
    setLogoUrl("");
    setDiscount("0");
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleFile(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const res = await uploadImageFromBrowser(files[0]);
      if (res.ok) setLogoUrl(res.url);
      else {
        console.error("[brand logo upload] failed:", res.error);
        setError(res.error);
      }
    } catch (e) {
      console.error("[brand logo upload] unexpected error:", e);
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData();
    if (editing) fd.set("id", editing.id);
    fd.set("name", name);
    fd.set("logoUrl", logoUrl);
    fd.set("discountPercent", discount || "0");
    const res = await saveBrandAction(fd);
    setSubmitting(false);
    if (res.ok) {
      reset();
      router.refresh();
    } else {
      setError(res.error);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form
        onSubmit={onSubmit}
        className="h-fit space-y-4 rounded-xl bg-white p-5 shadow-card ring-1 ring-black/5"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-brand-dark">
            {editing ? "Edit brand" : "Add brand"}
          </h2>
          {editing && (
            <button
              type="button"
              onClick={reset}
              aria-label="Cancel editing"
              className="text-muted hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-ink">
            Brand name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Brand name (e.g. Philips)"
            className={inputClass}
          />
        </div>

        {/* Quotation discount */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-ink">
            Quotation discount %
          </label>
          <div className="relative">
            <input
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              type="number"
              min={0}
              max={90}
              step="0.5"
              placeholder="0"
              className={`${inputClass} pr-9`}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted">
              %
            </span>
          </div>
          <p className="mt-1.5 text-xs text-muted">
            Taken off this brand&apos;s prices in the customer&apos;s instant
            quotation. Set 0 for no discount.
          </p>
        </div>

        {/* Logo */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-ink">
            Logo{" "}
            <span className="font-normal text-muted">
              — shown on the quotation page
            </span>
          </label>

          {logoUrl ? (
            <div className="flex items-center gap-3 rounded-lg border border-line bg-paper p-3">
              <div className="relative h-14 w-24 shrink-0">
                <Image
                  src={logoUrl}
                  alt="Brand logo preview"
                  fill
                  sizes="96px"
                  className="object-contain"
                />
              </div>
              <button
                type="button"
                onClick={() => setLogoUrl("")}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" /> Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-brand/30 bg-paper px-4 py-6 text-sm font-semibold text-brand transition hover:bg-brand-light disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> Upload logo
                </>
              )}
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT_ATTR}
            className="hidden"
            onChange={(e) => handleFile(e.target.files)}
          />
          <p className="mt-1.5 text-xs text-muted">
            A PNG with a transparent or white background works best.
          </p>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
        <Button
          type="submit"
          disabled={submitting || uploading}
          className="w-full"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : editing ? (
            <Save className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {editing ? "Save" : "Add brand"}
        </Button>
      </form>

      <div className="lg:col-span-2">
        {brands.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand/20 bg-white p-10 text-center text-muted">
            No brands yet. Add your first one on the left.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl bg-white shadow-card ring-1 ring-black/5">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted">
                  <th className="p-3">Logo</th>
                  <th className="p-3">Brand</th>
                  <th className="p-3 text-center">Quote discount</th>
                  <th className="p-3 text-center">Products</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {brands.map((b) => (
                  <tr key={b.id} className="hover:bg-brand-light/30">
                    <td className="p-3">
                      {b.logoUrl ? (
                        <div className="relative h-9 w-16">
                          <Image
                            src={b.logoUrl}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-muted">— none —</span>
                      )}
                    </td>
                    <td className="p-3 font-semibold text-ink">{b.name}</td>
                    <td className="p-3 text-center">
                      {b.discountPercent > 0 ? (
                        <span className="inline-block rounded-md bg-accent/10 px-2 py-0.5 text-xs font-bold tabular-nums text-accent">
                          {b.discountPercent}% off
                        </span>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                    <td className="p-3 text-center text-muted">
                      {b.productCount}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEdit(b)}
                          aria-label="Edit"
                          className="rounded-md p-2 text-brand hover:bg-brand-light"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <DeleteButton
                          id={b.id}
                          action={deleteBrandAction}
                          compact
                          confirmText={`Delete brand "${b.name}"? Products keep their data but lose this brand.`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
