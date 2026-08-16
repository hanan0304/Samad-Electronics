"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Pencil, X, Plus } from "lucide-react";
import { saveCategoryAction, deleteCategoryAction } from "@/app/admin/actions";
import { DeleteButton } from "./delete-button";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/forms/field";

export type CategoryRow = {
  id: string;
  name: string;
  department: "ELECTRIC" | "SANITARY" | "FANCY_LIGHTS";
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
};

const DEPT_LABEL: Record<string, string> = {
  ELECTRIC: "Electric",
  SANITARY: "Sanitary",
  FANCY_LIGHTS: "Fancy Lights",
};

export function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // A key to reset the uncontrolled form when switching between add/edit.
  const [formKey, setFormKey] = useState(0);

  function startEdit(cat: CategoryRow) {
    setEditing(cat);
    setError(null);
    setFormKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function reset() {
    setEditing(null);
    setError(null);
    setFormKey((k) => k + 1);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await saveCategoryAction(fd);
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
        key={formKey}
        onSubmit={onSubmit}
        className="h-fit space-y-4 rounded-xl bg-white p-5 shadow-card ring-1 ring-black/5"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-brand-dark">
            {editing ? "Edit category" : "Add category"}
          </h2>
          {editing && (
            <button type="button" onClick={reset} className="text-sm text-muted hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {editing && <input type="hidden" name="id" value={editing.id} />}

        <Field label="Name" required>
          <input name="name" required defaultValue={editing?.name} className={inputClass} placeholder="e.g. Wall Switches & Sockets" />
        </Field>
        <Field label="Department" required>
          <select name="department" required defaultValue={editing?.department || "ELECTRIC"} className={inputClass}>
            <option value="ELECTRIC">Electric</option>
            <option value="SANITARY">Sanitary</option>
            <option value="FANCY_LIGHTS">Fancy Lights</option>
          </select>
        </Field>
        <Field label="Description" hint="Shown on the category page and in Google results.">
          <textarea name="description" rows={3} defaultValue={editing?.description || ""} className={inputClass} />
        </Field>
        <Field label="Sort order" hint="Lower numbers appear first.">
          <input name="sortOrder" type="number" defaultValue={editing?.sortOrder ?? 0} className={inputClass} />
        </Field>
        <label className="flex items-center gap-2 text-sm font-medium text-ink">
          <input type="checkbox" name="isActive" defaultChecked={editing ? editing.isActive : true} className="h-4 w-4 accent-[color:var(--color-brand)]" />
          Visible in store
        </label>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>
        )}

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {editing ? "Save changes" : "Add category"}
        </Button>
      </form>

      <div className="lg:col-span-2">
        {categories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand/20 bg-white p-10 text-center text-muted">
            No categories yet. Add your first one on the left.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl bg-white shadow-card ring-1 ring-black/5">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted">
                  <th className="p-3">Name</th>
                  <th className="p-3">Department</th>
                  <th className="p-3 text-center">Products</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-brand-light/30">
                    <td className="p-3 font-semibold text-ink">{c.name}</td>
                    <td className="p-3 text-muted">{DEPT_LABEL[c.department]}</td>
                    <td className="p-3 text-center text-muted">{c.productCount}</td>
                    <td className="p-3 text-center">
                      {c.isActive ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Active</span>
                      ) : (
                        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-600">Hidden</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => startEdit(c)} aria-label="Edit" className="rounded-md p-2 text-brand hover:bg-brand-light">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <DeleteButton id={c.id} action={deleteCategoryAction} compact confirmText={`Delete category "${c.name}"?`} />
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
