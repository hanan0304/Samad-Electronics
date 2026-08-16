import { createClient } from "@supabase/supabase-js";

/**
 * Browser-side Supabase client. Uses ONLY the public URL + anon/publishable key
 * (both NEXT_PUBLIC_*), so it is safe to ship to the browser. It is used purely
 * to push file bytes to a pre-signed upload URL (uploadToSignedUrl) — the signed
 * token authorises that single write, so no session or RLS policy is involved.
 */
// Strip any stray surrounding quotes/whitespace a host may keep in the value.
const clean = (v: string | undefined) =>
  (v || "").trim().replace(/^["']+|["']+$/g, "").trim();

const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
const anonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const supabaseBrowser = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
