import { createClient } from "@supabase/supabase-js";
import { safeExtForName, safeExtForDoc } from "@/lib/upload-constants";

/**
 * Server-side Supabase client used for uploading/deleting product images.
 * Uses the SERVICE ROLE key, so this module must NEVER be imported into a
 * client component. It is only used inside server actions / route handlers.
 */

/**
 * Read an env var defensively: trim whitespace and strip any surrounding quotes.
 * Some hosts (and .env → dashboard copy/paste) keep the literal quotes from a
 * value like `BUCKET="product-images"`, which Supabase then rejects as
 * "Bucket name invalid". Stripping them here makes config robust either way.
 */
function cleanEnv(v: string | undefined): string {
  return (v || "").trim().replace(/^["']+|["']+$/g, "").trim();
}

const url = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
const serviceKey = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);

export const isStorageConfigured = Boolean(url && serviceKey);

/**
 * The single, authoritative bucket-name resolver used everywhere on the server.
 * Trims + strips quotes, falls back to the known default, logs exactly what it
 * resolved (name + length — a bucket name is NOT a secret), and throws a loud,
 * specific error if it somehow ends up empty. No undefined/dirty value ever
 * reaches storage.from() again.
 */
const DEFAULT_BUCKET = "product-images";

export function resolveBucket(): string {
  const raw = process.env.SUPABASE_STORAGE_BUCKET;
  const fromEnv = cleanEnv(raw);

  if (fromEnv) {
    // Normal path: value came from the env var.
    console.log(`[storage] bucket "${fromEnv}" (source: env SUPABASE_STORAGE_BUCKET)`);
    return fromEnv;
  }

  // Fallback path: env var missing/empty. Warn loudly so this can never drift
  // silently — a bucket name is not a secret, so we print exactly what we saw.
  console.warn(
    `[storage] WARNING: SUPABASE_STORAGE_BUCKET is missing/empty (raw=${JSON.stringify(raw)}) — ` +
      `falling back to default "${DEFAULT_BUCKET}". Set it (value: ${DEFAULT_BUCKET}, no quotes) in ` +
      `Vercel → Project → Settings → Environment Variables (Production) and redeploy to silence this.`
  );
  return DEFAULT_BUCKET;
}

function getAdminClient() {
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env."
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Create a short-lived SIGNED UPLOAD URL for a new product/brand image.
 *
 * The browser uploads the file bytes DIRECTLY to Supabase Storage with this
 * token, so the bytes never pass through our Vercel Server Action (whose ~4.5 MB
 * request-body limit used to silently reject real photos). The service-role key
 * is used only here, server-side, to mint the token — it is never returned to
 * the browser. The token authorises the single write, so no Storage RLS INSERT
 * policy is required.
 */
export async function createSignedProductImageUpload(fileName: string): Promise<{
  signedUrl: string;
  token: string;
  path: string;
  bucket: string;
  publicUrl: string;
}> {
  const client = getAdminClient();
  const bucket = resolveBucket();
  const path = `products/${crypto.randomUUID()}.${safeExtForName(fileName)}`;

  const { data, error } = await client.storage
    .from(bucket)
    .createSignedUploadUrl(path);
  if (error || !data) {
    throw new Error(
      `[server] createSignedUploadUrl failed for bucket ${JSON.stringify(bucket)} (len ${bucket.length}): ${error?.message || "unknown error"}`
    );
  }

  const { data: pub } = client.storage.from(bucket).getPublicUrl(path);
  return {
    signedUrl: data.signedUrl,
    token: data.token,
    path: data.path,
    bucket,
    publicUrl: pub.publicUrl,
  };
}

/**
 * Create a signed upload URL for a certificate FILE (PDF or image). Same
 * browser-direct flow as images (createSignedProductImageUpload), so large
 * scanned PDFs never hit the Vercel Server Action body limit. Stored under
 * `certificates/` in the same bucket (which now allows application/pdf).
 */
export async function createSignedDocumentUpload(fileName: string): Promise<{
  signedUrl: string;
  token: string;
  path: string;
  bucket: string;
  publicUrl: string;
}> {
  const client = getAdminClient();
  const bucket = resolveBucket();
  const path = `certificates/${crypto.randomUUID()}.${safeExtForDoc(fileName)}`;

  const { data, error } = await client.storage
    .from(bucket)
    .createSignedUploadUrl(path);
  if (error || !data) {
    throw new Error(
      `[server] createSignedUploadUrl failed for bucket ${JSON.stringify(bucket)} (len ${bucket.length}): ${error?.message || "unknown error"}`
    );
  }

  const { data: pub } = client.storage.from(bucket).getPublicUrl(path);
  return {
    signedUrl: data.signedUrl,
    token: data.token,
    path: data.path,
    bucket,
    publicUrl: pub.publicUrl,
  };
}

/** Delete an image by its public URL (best-effort; ignores errors). */
export async function deleteProductImageByUrl(publicUrl: string): Promise<void> {
  if (!isStorageConfigured) return;
  try {
    const client = getAdminClient();
    const activeBucket = resolveBucket();
    const marker = `/storage/v1/object/public/${activeBucket}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return;
    const path = publicUrl.slice(idx + marker.length);
    await client.storage.from(activeBucket).remove([path]);
  } catch {
    // Non-fatal: image cleanup should never block a delete.
  }
}
