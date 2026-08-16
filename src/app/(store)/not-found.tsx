import Link from "next/link";
import Image from "next/image";
import { Home, Search } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-screen flex-col items-center justify-center py-16 text-center">
      {/* Unmatched URLs render outside the storefront layout, so carry the
          brand here rather than leaving the page unbranded. */}
      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <Image
          src="/logo-mark.png"
          alt=""
          width={467}
          height={711}
          className="h-9 w-auto"
        />
        <span className="text-lg font-extrabold text-brand-dark">
          {siteConfig.name}
        </span>
      </Link>
      <p className="text-6xl font-extrabold text-brand">404</p>
      <h1 className="mt-3 text-2xl font-bold text-ink">Page not found</h1>
      <p className="mt-2 max-w-md text-muted">
        Sorry, we couldn&apos;t find that page. It may have been moved or the product
        may no longer be available.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonClasses("primary", "md")}>
          <Home className="h-4 w-4" /> Go home
        </Link>
        <Link href="/products" className={buttonClasses("outline", "md")}>
          <Search className="h-4 w-4" /> Browse products
        </Link>
      </div>
    </div>
  );
}
