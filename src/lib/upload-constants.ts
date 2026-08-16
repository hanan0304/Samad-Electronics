/**
 * Shared image-upload limits — the SINGLE source of truth, imported by BOTH the
 * browser (client validation + UI hint) and the server (signed-URL validation).
 * No magic numbers are duplicated anywhere else.
 *
 * MAX_UPLOAD_BYTES is kept in step with the Supabase bucket's own
 * `file_size_limit` (6 MiB) so the client, the server, and Storage all agree.
 */
export const MAX_UPLOAD_MB = 6;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024; // 6 MiB = 6291456

/**
 * MIME types the product/brand image uploader accepts. HEIC/HEIF are
 * deliberately excluded: next/image cannot render them in the browser, so a
 * stored HEIC would show as a broken image on the storefront.
 */
export const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;

/** File extensions matching ALLOWED_MIME, for the <input accept> attribute. */
export const ALLOWED_EXT = ["jpg", "jpeg", "png", "webp", "avif", "gif"] as const;

/** `accept` attribute value for the file input. */
export const ACCEPT_ATTR = ALLOWED_MIME.join(",");

/** Human-readable hint shown under the uploader. */
export const ACCEPTED_HINT = `JPG, PNG, WebP, AVIF or GIF up to ${MAX_UPLOAD_MB} MB`;

export function isAllowedType(type: string): boolean {
  return (ALLOWED_MIME as readonly string[]).includes(type);
}

/** Keep the original extension when it is one we allow, else default to jpg. */
export function safeExtForName(name: string): string {
  const ext = (name.split(".").pop() || "jpg").toLowerCase();
  return (ALLOWED_EXT as readonly string[]).includes(ext) ? ext : "jpg";
}

/** "8.2 MB" style label for messages. */
export function formatMB(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ---- Documents (certificate files: PDF or image) --------------------------
// Certificates are opened via a link (not next/image), so PDFs are fine here.
// The Supabase bucket's own limit is 10 MiB, kept in step with MAX_DOC_BYTES.

export const MAX_DOC_MB = 10;
export const MAX_DOC_BYTES = MAX_DOC_MB * 1024 * 1024; // 10 MiB = 10485760

/** MIME types the certificate-file uploader accepts: any allowed image + PDF. */
export const ALLOWED_DOC_MIME = [...ALLOWED_MIME, "application/pdf"] as const;

/** Extensions matching ALLOWED_DOC_MIME. */
export const ALLOWED_DOC_EXT = [...ALLOWED_EXT, "pdf"] as const;

/** `accept` attribute value for the certificate-file input. */
export const ACCEPT_DOC_ATTR = ALLOWED_DOC_MIME.join(",");

/** Human-readable hint for the certificate-file uploader. */
export const ACCEPTED_DOC_HINT = `PDF or image up to ${MAX_DOC_MB} MB`;

export function isAllowedDocType(type: string): boolean {
  return (ALLOWED_DOC_MIME as readonly string[]).includes(type);
}

/** Keep a PDF/image extension when allowed, else default to pdf. */
export function safeExtForDoc(name: string): string {
  const ext = (name.split(".").pop() || "pdf").toLowerCase();
  return (ALLOWED_DOC_EXT as readonly string[]).includes(ext) ? ext : "pdf";
}
