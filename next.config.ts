import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Hosts we OPTIMIZE. Any other https image link pasted into the import sheet
    // still renders — ProductImage falls back to `unoptimized` for unknown hosts,
    // which bypasses this allow-list.
    remotePatterns: [
      // Product photos uploaded to our Supabase Storage public buckets.
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/**" },
      // Cloudinary — the recommended host for image links in the bulk import sheet.
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  experimental: {
    // Admin photo/logo uploads go through a Server Action, whose request body
    // is capped at 1MB by default — so any real photo silently failed to
    // upload. Product photos and brand logos are allowed up to 5MB, so lift the
    // limit to 6MB (5MB file + multipart overhead).
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
