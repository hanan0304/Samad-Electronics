import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";

// Display face: confident, crafted headings.
const display = Bricolage_Grotesque({
  variable: "--font-display-face",
  subsets: ["latin"],
  display: "swap",
});
// Body/UI face: engineered and highly readable — suits a technical trade shop.
const body = IBM_Plex_Sans({
  variable: "--font-body-face",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  ...buildMetadata({}),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      {/* The storefront chrome lives in (store)/layout.tsx so that /admin
          renders on its own, without the shop header and footer. */}
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
