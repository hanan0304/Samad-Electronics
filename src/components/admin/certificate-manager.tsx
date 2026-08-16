"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Plus,
  Save,
  Pencil,
  X,
  Upload,
  Trash2,
  FileCheck2,
  ExternalLink,
} from "lucide-react";
import { saveCertificateAction, deleteCertificateAction } from "@/app/admin/actions";
import {
  uploadImageFromBrowser,
  uploadDocumentFromBrowser,
} from "@/lib/upload-image-client";
import { ACCEPT_ATTR, ACCEPT_DOC_ATTR } from "@/lib/upload-constants";
import { DeleteButton } from "./delete-button";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/forms/field";

export type CertificateRow = {
  id: string;
  name: string;
  logoUrl: string | null;
  fileUrl: string | null;
  sortOrder: number;
};

/** Add the companies you are officially certified by, with logo + certificate. */
export function CertificateManager({ items }: { items: CertificateRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<CertificateRow | null>(null);
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function startEdit(c: CertificateRow) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setEditing(c);
    setName(c.name);
    setLogoUrl(c.logoUrl || "");
    setFileUrl(c.fileUrl || "");
    setSortOrder(String(c.sortOrder ?? 0));
    setError(null);
  }
  function reset() {
    setEditing(null);
    setName("");
    setLogoUrl("");
    setFileUrl("");
    setSortOrder("0");
    setError(null);
    if (logoRef.current) logoRef.current.value = "";
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleLogo(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setUploadingLogo(true);
    try {
      const res = await uploadImageFromBrowser(files[0]);
      if (res.ok) setLogoUrl(res.url);
      else {
        console.error("[certificate logo upload] failed:", res.error);
        setError(res.error);
      }
    } catch (e) {
      console.error("[certificate logo upload] unexpected error:", e);
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setUploadingLogo(false);
      if (logoRef.current) logoRef.current.value = "";
    }
  }

  async function handleFile(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setUploadingFile(true);
    try {
      const res = await uploadDocumentFromBrowser(files[0]);
      if (res.ok) setFileUrl(res.url);
      else {
        console.error("[certificate file upload] failed:", res.error);
        setError(res.error);
      }
    } catch (e) {
      console.error("[certificate file upload] unexpected error:", e);
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setUploadingFile(false);
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
    fd.set("fileUrl", fileUrl);
    fd.set("sortOrder", sortOrder || "0");
    const res = await saveCertificateAction(fd);
    setSubmitting(false);
    if (res.ok) {
      reset();
      router.refresh();
    } else {
      setError(res.error);
    }
  }

  const busy = submitting || uploadingLogo || uploadingFile;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form
        onSubmit={onSubmit}
        className="h-fit space-y-4 rounded-xl bg-white p-5 shadow-card ring-1 ring-black/5"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-brand-dark">
            {editing ? "Edit certificate" : "Add certificate"}
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
            Company name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Popular Pipes"
            className={inputClass}
          />
        </div>

        {/* Logo */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-ink">
            Company logo
          </label>
          {logoUrl ? (
            <div className="flex items-center gap-3 rounded-lg border border-line bg-paper p-3">
              <div className="relative h-14 w-24 shrink-0">
                <Image
                  src={logoUrl}
                  alt="Logo preview"
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
              onClick={() => logoRef.current?.click()}
              disabled={uploadingLogo}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-brand/30 bg-paper px-4 py-5 text-sm font-semibold text-brand transition hover:bg-brand-light disabled:opacity-60"
            >
              {uploadingLogo ? (
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
            ref={logoRef}
            type="file"
            accept={ACCEPT_ATTR}
            className="hidden"
            onChange={(e) => handleLogo(e.target.files)}
          />
        </div>

        {/* Certificate file */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-ink">
            Certificate file
          </label>
          {fileUrl ? (
            <div className="flex items-center gap-3 rounded-lg border border-line bg-paper p-3">
              <FileCheck2 className="h-6 w-6 shrink-0 text-brand" />
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
              >
                View file <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setFileUrl("")}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" /> Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingFile}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-brand/30 bg-paper px-4 py-5 text-sm font-semibold text-brand transition hover:bg-brand-light disabled:opacity-60"
            >
              {uploadingFile ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> Upload certificate
                </>
              )}
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT_DOC_ATTR}
            className="hidden"
            onChange={(e) => handleFile(e.target.files)}
          />
          <p className="mt-1.5 text-xs text-muted">
            A photo, scan or PDF of the certificate. Max 10 MB.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-ink">
            Order
          </label>
          <input
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            type="number"
            min={0}
            className={inputClass}
          />
          <p className="mt-1.5 text-xs text-muted">
            Lower numbers appear first on the About page.
          </p>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
        <Button type="submit" disabled={busy} className="w-full">
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : editing ? (
            <Save className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {editing ? "Save" : "Add certificate"}
        </Button>
      </form>

      <div className="lg:col-span-2">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand/20 bg-white p-10 text-center text-muted">
            No certificates yet. Add your first one on the left — it will show
            on your About page.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl bg-white shadow-card ring-1 ring-black/5">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted">
                  <th className="p-3">Logo</th>
                  <th className="p-3">Company</th>
                  <th className="p-3 text-center">Certificate</th>
                  <th className="p-3 text-center">Order</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((c) => (
                  <tr key={c.id} className="hover:bg-brand-light/30">
                    <td className="p-3">
                      {c.logoUrl ? (
                        <div className="relative h-9 w-16">
                          <Image
                            src={c.logoUrl}
                            alt={c.name}
                            fill
                            sizes="64px"
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-muted">— none —</span>
                      )}
                    </td>
                    <td className="p-3 font-semibold text-ink">{c.name}</td>
                    <td className="p-3 text-center">
                      {c.fileUrl ? (
                        <a
                          href={c.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
                        >
                          View <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted">— none —</span>
                      )}
                    </td>
                    <td className="p-3 text-center tabular-nums text-muted">
                      {c.sortOrder}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEdit(c)}
                          aria-label={`Edit ${c.name}`}
                          className="rounded-md p-2 text-brand hover:bg-brand-light"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <DeleteButton
                          id={c.id}
                          action={deleteCertificateAction}
                          compact
                          confirmText={`Delete the certificate for "${c.name}"? This cannot be undone.`}
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
