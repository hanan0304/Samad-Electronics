import {
  createUploadUrlAction,
  createDocumentUploadUrlAction,
  type CreateUploadUrlResult,
} from "@/app/admin/actions";
import { supabaseBrowser } from "@/lib/supabase-browser";
import {
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_MB,
  ACCEPTED_HINT,
  isAllowedType,
  MAX_DOC_BYTES,
  MAX_DOC_MB,
  ACCEPTED_DOC_HINT,
  isAllowedDocType,
  formatMB,
} from "@/lib/upload-constants";

export type BrowserUploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/**
 * Push a file's bytes to Supabase Storage using a pre-signed URL. Shared by the
 * image and document uploaders — this is the step that bypasses the ~4.5 MB
 * Vercel Server Action body limit (bytes go browser → Supabase directly).
 */
async function putToSignedUrl(
  signed: Extract<CreateUploadUrlResult, { ok: true }>,
  file: File
): Promise<BrowserUploadResult> {
  const { error } = await supabaseBrowser.storage
    .from(signed.bucket)
    .uploadToSignedUrl(signed.path, signed.token, file, {
      contentType: file.type,
    });
  if (error) {
    const status = (error as { statusCode?: string | number }).statusCode;
    // Stage-tagged so it's obvious this failed in the BROWSER upload step, not
    // on the server. (signed.bucket is the value the server returned.)
    return {
      ok: false,
      error: `[browser upload] failed${status ? ` (${status})` : ""} for bucket ${JSON.stringify(signed.bucket)}: ${error.message}`,
    };
  }
  return { ok: true, url: signed.publicUrl };
}

/**
 * Upload one IMAGE straight from the browser to Supabase Storage.
 *
 * Flow: validate size + type on the client → ask the server for a signed upload
 * URL → PUT the bytes directly to Supabase. Never throws for expected problems.
 */
export async function uploadImageFromBrowser(
  file: File
): Promise<BrowserUploadResult> {
  if (!isAllowedType(file.type)) {
    return {
      ok: false,
      error: `“${file.name}” isn’t a supported image. Please use ${ACCEPTED_HINT}.`,
    };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `“${file.name}” is ${formatMB(file.size)} — the limit is ${MAX_UPLOAD_MB} MB. Please choose a smaller photo.`,
    };
  }

  try {
    const signed = await createUploadUrlAction(file.name, file.type, file.size);
    if (!signed.ok) return { ok: false, error: signed.message };
    return await putToSignedUrl(signed, file);
  } catch (e) {
    console.error("[uploadImageFromBrowser] unexpected error:", e);
    const detail = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `Upload failed: ${detail}` };
  }
}

/**
 * Upload one certificate FILE (PDF or image) straight from the browser to
 * Supabase Storage — same signed-URL flow as images, with the larger document
 * size limit and PDF allowed.
 */
export async function uploadDocumentFromBrowser(
  file: File
): Promise<BrowserUploadResult> {
  if (!isAllowedDocType(file.type)) {
    return {
      ok: false,
      error: `“${file.name}” isn’t a supported file. Please upload a ${ACCEPTED_DOC_HINT}.`,
    };
  }
  if (file.size > MAX_DOC_BYTES) {
    return {
      ok: false,
      error: `“${file.name}” is ${formatMB(file.size)} — the limit is ${MAX_DOC_MB} MB.`,
    };
  }

  try {
    const signed = await createDocumentUploadUrlAction(
      file.name,
      file.type,
      file.size
    );
    if (!signed.ok) return { ok: false, error: signed.message };
    return await putToSignedUrl(signed, file);
  } catch (e) {
    console.error("[uploadDocumentFromBrowser] unexpected error:", e);
    const detail = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `Upload failed: ${detail}` };
  }
}
