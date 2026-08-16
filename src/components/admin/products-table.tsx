"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Star, Trash2, Loader2 } from "lucide-react";
import { ProductImage } from "@/components/product/product-image";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteProductAction, deleteProductsAction } from "@/app/admin/actions";
import { formatPrice } from "@/lib/utils";

export type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  inStock: boolean;
  featured: boolean;
  isActive: boolean;
  categoryName: string;
  brandName: string | null;
  image: string | null;
};

/**
 * Admin products table with row selection and a bulk-delete bar — so many
 * products can be removed in one go (e.g. clearing out the sample catalogue),
 * not one at a time.
 */
export function ProductsTable({ products }: { products: AdminProductRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const allOnPage = products.length > 0 && selected.size === products.length;
  const someSelected = selected.size > 0;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === products.length ? new Set() : new Set(products.map((p) => p.id))
    );
  }

  function bulkDelete() {
    const ids = [...selected];
    if (ids.length === 0) return;
    if (
      !window.confirm(
        `Delete ${ids.length} selected product${ids.length === 1 ? "" : "s"}? This cannot be undone.`
      )
    )
      return;
    startTransition(async () => {
      const res = await deleteProductsAction(ids);
      if (res.ok) {
        setSelected(new Set());
        router.refresh();
      } else {
        window.alert(res.error);
      }
    });
  }

  return (
    <div className="space-y-3">
      {/* Bulk action bar */}
      {someSelected && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-light/60 p-3 ring-1 ring-brand/15">
          <p className="text-sm font-semibold text-ink">
            {selected.size} selected
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelected(new Set())}
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-muted hover:text-ink"
            >
              Clear
            </button>
            <button
              onClick={bulkDelete}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete {selected.size} selected
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl bg-white shadow-card ring-1 ring-black/5">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted">
              <th className="p-3">
                <input
                  type="checkbox"
                  checked={allOnPage}
                  onChange={toggleAll}
                  aria-label="Select all"
                  className="h-4 w-4 accent-[color:var(--color-brand)]"
                />
              </th>
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Brand</th>
              <th className="p-3 text-right">Price</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((p) => {
              const checked = selected.has(p.id);
              return (
                <tr
                  key={p.id}
                  className={checked ? "bg-brand-light/40" : "hover:bg-brand-light/30"}
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(p.id)}
                      aria-label={`Select ${p.name}`}
                      className="h-4 w-4 accent-[color:var(--color-brand)]"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-brand-light">
                        <ProductImage url={p.image} alt={p.name} sizes="48px" />
                      </span>
                      <div className="min-w-0">
                        <p className="flex items-center gap-1 font-semibold text-ink">
                          {p.featured && (
                            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                          )}
                          {p.name}
                        </p>
                        <p className="text-xs text-muted">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-muted">{p.categoryName}</td>
                  <td className="p-3 text-muted">{p.brandName || "—"}</td>
                  <td className="p-3 text-right font-semibold text-brand">
                    {formatPrice(p.price)}
                  </td>
                  <td className="p-3 text-center">
                    {!p.isActive ? (
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-600">
                        Hidden
                      </span>
                    ) : p.inStock ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                        In stock
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                        Out
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/products/${p.id}`}
                        aria-label="Edit"
                        className="rounded-md p-2 text-brand hover:bg-brand-light"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteButton
                        id={p.id}
                        action={deleteProductAction}
                        compact
                        confirmText={`Delete "${p.name}"? This cannot be undone.`}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
