"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Upload,
  X,
  Plus,
  ArrowUp,
  ArrowDown,
  Save,
  ImageIcon,
} from "lucide-react";
import { saveProductAction } from "@/app/admin/actions";
import { uploadImageFromBrowser } from "@/lib/upload-image-client";
import { ACCEPT_ATTR, ACCEPTED_HINT } from "@/lib/upload-constants";
import { ProductImage } from "@/components/product/product-image";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/forms/field";

type ImageItem = { url: string; alt: string };
type SpecItem = { label: string; value: string };
/** A file currently being uploaded, or one that just failed. */
type PendingUpload = { id: string; name: string; status: "uploading" | "error"; error?: string };

export type ProductFormInitial = {
  id: string;
  name: string;
  shortDesc: string;
  description: string;
  price: string;
  oldPrice: string;
  unit: string;
  sku: string;
  categoryId: string;
  brandId: string;
  inStock: boolean;
  featured: boolean;
  isActive: boolean;
  specs: SpecItem[];
  images: ImageItem[];
};

export function ProductForm({
  categories,
  brands,
  initial,
}: {
  categories: { id: string; name: string; department: string }[];
  brands: { id: string; name: string }[];
  initial?: ProductFormInitial;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [images, setImages] = useState<ImageItem[]>(initial?.images || []);
  const [specs, setSpecs] = useState<SpecItem[]>(initial?.specs || []);
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // True while any file is still uploading — used to block form submit.
  const uploading = pending.some((p) => p.status === "uploading");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    // Upload each file on its own tile. One failing never aborts the others,
    // and every branch reports a result — nothing is ever silent.
    for (const file of Array.from(files)) {
      const tileId = crypto.randomUUID();
      setPending((prev) => [...prev, { id: tileId, name: file.name, status: "uploading" }]);
      try {
        const res = await uploadImageFromBrowser(file);
        if (res.ok) {
          setImages((prev) => [...prev, { url: res.url, alt: "" }]);
          setPending((prev) => prev.filter((p) => p.id !== tileId)); // tile → real thumbnail
        } else {
          console.error("[product upload] failed:", file.name, res.error);
          setPending((prev) =>
            prev.map((p) => (p.id === tileId ? { ...p, status: "error", error: res.error } : p))
          );
        }
      } catch (e) {
        // Belt-and-braces: an unexpected throw still lands on the tile, never silent.
        console.error("[product upload] unexpected error:", file.name, e);
        const detail = e instanceof Error ? e.message : "Unexpected error";
        setPending((prev) =>
          prev.map((p) => (p.id === tileId ? { ...p, status: "error", error: detail } : p))
        );
      }
    }
  }

  function dismissPending(id: string) {
    setPending((prev) => prev.filter((p) => p.id !== id));
  }

  function moveImage(index: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    fd.set("images", JSON.stringify(images));
    fd.set("specs", JSON.stringify(specs.filter((s) => s.label && s.value)));
    const res = await saveProductAction(fd);
    setSubmitting(false);
    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      setError(res.error);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main details */}
        <div className="space-y-4 lg:col-span-2">
          <Section title="Basic details">
            <Field label="Product name" required>
              <input name="name" required defaultValue={initial?.name} className={inputClass} placeholder="e.g. 9W LED Bulb (Cool White)" />
            </Field>
            <Field label="Short description" hint="One line shown in listings and Google results.">
              <input name="shortDesc" defaultValue={initial?.shortDesc} className={inputClass} placeholder="Energy-saving 9W LED bulb, B22/E27 base." />
            </Field>
            <Field label="Full description">
              <textarea name="description" rows={5} defaultValue={initial?.description} className={inputClass} placeholder="Describe the product, its features and uses…" />
            </Field>
          </Section>

          <Section title="Photos">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {images.map((img, i) => (
                <div key={img.url + i} className="rounded-lg border border-black/5 p-2">
                  <div className="relative aspect-square overflow-hidden rounded-md bg-brand-light">
                    <ProductImage url={img.url} alt={img.alt || "Product photo"} sizes="120px" />
                    <button
                      type="button"
                      onClick={() => setImages((p) => p.filter((_, idx) => idx !== i))}
                      aria-label="Remove photo"
                      className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white hover:bg-red-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <input
                    value={img.alt}
                    onChange={(e) =>
                      setImages((p) => p.map((x, idx) => (idx === i ? { ...x, alt: e.target.value } : x)))
                    }
                    placeholder="Alt text (SEO)"
                    className="mt-1 w-full rounded border border-brand/20 px-1.5 py-1 text-xs outline-none focus:border-brand"
                  />
                  <div className="mt-1 flex justify-center gap-1">
                    <button type="button" onClick={() => moveImage(i, -1)} aria-label="Move left" className="rounded p-1 text-muted hover:bg-brand-light">
                      <ArrowUp className="h-3.5 w-3.5 -rotate-90" />
                    </button>
                    <button type="button" onClick={() => moveImage(i, 1)} aria-label="Move right" className="rounded p-1 text-muted hover:bg-brand-light">
                      <ArrowDown className="h-3.5 w-3.5 -rotate-90" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Per-file tiles: a spinner while uploading, an error card if it failed */}
              {pending.map((p) => (
                <div
                  key={p.id}
                  className={`rounded-lg border p-2 ${p.status === "error" ? "border-red-200 bg-red-50" : "border-black/5"}`}
                >
                  <div className="relative grid aspect-square place-items-center rounded-md bg-brand-light/60 p-2 text-center">
                    {p.status === "uploading" ? (
                      <span className="flex flex-col items-center gap-1 text-brand">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="text-[11px] font-semibold">Uploading…</span>
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => dismissPending(p.id)}
                          aria-label="Dismiss failed upload"
                          className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white hover:bg-red-600"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <span className="flex flex-col items-center gap-1 text-red-700">
                          <ImageIcon className="h-6 w-6" />
                          <span className="text-[11px] font-bold">Upload failed</span>
                        </span>
                      </>
                    )}
                  </div>
                  <p className="mt-1 truncate text-[11px] text-muted" title={p.name}>
                    {p.name}
                  </p>
                  {p.status === "error" && p.error && (
                    <p className="mt-0.5 text-[11px] font-medium leading-snug text-red-700">
                      {p.error}
                    </p>
                  )}
                </div>
              ))}

              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-brand/30 text-brand hover:bg-brand-light">
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-6 w-6" />
                    <span className="text-xs font-semibold">Add photo</span>
                  </>
                )}
                <input
                  type="file"
                  accept={ACCEPT_ATTR}
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    handleFiles(e.target.files);
                    e.target.value = ""; // allow re-selecting the same file
                  }}
                  disabled={uploading}
                />
              </label>
            </div>
            <p className="flex items-center gap-1 text-xs text-muted">
              <ImageIcon className="h-3.5 w-3.5" /> The first photo is the main image. {ACCEPTED_HINT}.
            </p>
          </Section>

          <Section title="Specifications">
            <div className="space-y-2">
              {specs.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={s.label}
                    onChange={(e) => setSpecs((p) => p.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)))}
                    placeholder="Label (e.g. Wattage)"
                    className={inputClass}
                  />
                  <input
                    value={s.value}
                    onChange={(e) => setSpecs((p) => p.map((x, idx) => (idx === i ? { ...x, value: e.target.value } : x)))}
                    placeholder="Value (e.g. 9W)"
                    className={inputClass}
                  />
                  <button type="button" onClick={() => setSpecs((p) => p.filter((_, idx) => idx !== i))} aria-label="Remove spec" className="rounded-md p-2 text-muted hover:bg-red-50 hover:text-red-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setSpecs((p) => [...p, { label: "", value: "" }])}
                className="inline-flex items-center gap-1 rounded-lg border border-brand/20 px-3 py-1.5 text-sm font-semibold text-brand hover:bg-brand-light"
              >
                <Plus className="h-4 w-4" /> Add specification
              </button>
            </div>
          </Section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Section title="Pricing">
            <Field label="Price (Rs)" required>
              <input name="price" type="number" step="0.01" min="0" required defaultValue={initial?.price} className={inputClass} placeholder="240" />
            </Field>
            <Field label="Old price (Rs)" hint="Optional — shows a strike-through discount.">
              <input name="oldPrice" type="number" step="0.01" min="0" defaultValue={initial?.oldPrice} className={inputClass} placeholder="300" />
            </Field>
            <Field label="Unit">
              <input name="unit" defaultValue={initial?.unit || "per piece"} className={inputClass} placeholder="per piece" />
            </Field>
          </Section>

          <Section title="Organize">
            <Field label="Category" required>
              <select name="categoryId" required defaultValue={initial?.categoryId || ""} className={inputClass}>
                <option value="" disabled>Choose a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Brand">
              <select name="brandId" defaultValue={initial?.brandId || ""} className={inputClass}>
                <option value="">No brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </Field>
            <Field label="SKU / Code">
              <input name="sku" defaultValue={initial?.sku} className={inputClass} placeholder="Optional" />
            </Field>
          </Section>

          <Section title="Visibility">
            <Toggle name="inStock" label="In stock" defaultChecked={initial ? initial.inStock : true} />
            <Toggle name="featured" label="Featured on homepage" defaultChecked={initial ? initial.featured : false} />
            <Toggle name="isActive" label="Visible in store" defaultChecked={initial ? initial.isActive : true} />
          </Section>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={submitting || uploading}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Save Product
            </>
          )}
        </Button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="text-sm font-semibold text-muted hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 rounded-xl bg-white p-5 shadow-card ring-1 ring-black/5">
      <h2 className="font-bold text-brand-dark">{title}</h2>
      {children}
    </div>
  );
}

function Toggle({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-ink">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-[color:var(--color-brand)]" />
      {label}
    </label>
  );
}
