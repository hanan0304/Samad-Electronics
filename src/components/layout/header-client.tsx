"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  Phone,
  ChevronDown,
  Zap,
  Droplets,
  Lightbulb,
} from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { cn } from "@/lib/utils";

export type NavCategory = { name: string; slug: string };
export type NavData = {
  ELECTRIC: NavCategory[];
  SANITARY: NavCategory[];
  FANCY_LIGHTS: NavCategory[];
};

const DEPARTMENTS = [
  { key: "ELECTRIC", label: "Electric", href: "/electric", Icon: Zap },
  { key: "SANITARY", label: "Sanitary", href: "/sanitary", Icon: Droplets },
  {
    key: "FANCY_LIGHTS",
    label: "Fancy Lights",
    href: "/fancy-lights",
    Icon: Lightbulb,
  },
] as const;

export function HeaderClient({
  nav,
  phone,
  phone2,
  shopName,
}: {
  nav: NavData;
  phone: string;
  phone2: string;
  shopName: string;
}) {
  const { totalItems, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDept, setOpenDept] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  /** The instant-quotation flow is cart-free. */
  const isQuoteFlow = pathname.startsWith("/quotation");

  // Stop the page scrolling behind the open mobile drawer.
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  /** Is this nav link the page the visitor is currently on? */
  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  /** Same idea for the mobile drawer, where an underline reads poorly. */
  function mobileLinkClass(href: string) {
    return cn(
      "block rounded-lg px-3 py-2.5 font-semibold transition-colors",
      isActive(href)
        ? "bg-brand-light text-brand"
        : "text-ink hover:bg-brand-light hover:text-brand"
    );
  }

  /** Shared styling for a top-level nav link, with a clear active state. */
  function navLinkClass(href: string) {
    return cn(
      "relative px-3 py-3 text-sm font-semibold transition-colors after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-full after:transition-all",
      isActive(href)
        ? "text-brand after:bg-accent"
        : "text-ink hover:text-brand after:bg-transparent hover:after:bg-brand/30"
    );
  }

  function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const q = String(data.get("q") || "").trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
    setMobileOpen(false);
  }

  /**
   * Clicking a nav link for the page you are already on (e.g. "Home" while on
   * the home page) is a no-op in the App Router, so nothing happens. Treat it
   * as "take me back to the top" instead, and always close the mobile menu.
   */
  function onNavClick(href: string) {
    return (e: React.MouseEvent<HTMLAnchorElement>) => {
      setMobileOpen(false);
      if (pathname === href) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
  }

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-line bg-white/85 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
      {/* Top info bar */}
      <div className="hidden bg-brand-darker text-white sm:block">
        <div className="container-page flex h-9 items-center justify-between text-xs">
          <p>
            Electric · Sanitary · Fancy Lights —{" "}
            <span className="text-accent-bright">SINCE 2000</span>
          </p>
          <div className="flex items-center gap-4">
            <a href={`tel:${phone}`} className="flex items-center gap-1.5 hover:text-accent">
              <Phone className="h-3.5 w-3.5" /> {phone}
            </a>
            {phone2 && (
              <a href={`tel:${phone2}`} className="flex items-center gap-1.5 hover:text-accent">
                <Phone className="h-3.5 w-3.5" /> {phone2}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="container-page flex h-16 items-center gap-3">
        <button
          className="lg:hidden -ml-1 p-2 text-brand"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>

        <Link
          href="/"
          onClick={onNavClick("/")}
          aria-label={`${shopName} — go to home page`}
          className="flex items-center gap-2 shrink-0"
        >
          <Image
            src="/logo-mark.png"
            alt=""
            width={467}
            height={711}
            priority
            className="h-9 w-auto"
          />
          <span className="text-lg font-extrabold leading-tight text-brand-dark">
            {shopName}
          </span>
        </Link>

        {/* Desktop search */}
        <form onSubmit={onSearch} className="ml-4 hidden flex-1 md:block">
          <div className="relative max-w-xl">
            <input
              name="q"
              type="search"
              placeholder="Search switches, taps, lights…"
              className="w-full rounded-xl border border-line bg-white py-2.5 pl-4 pr-11 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-brand p-2 text-white transition hover:bg-brand-dark"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1">
          {/* Someone in the quotation flow only wants prices — the cart would
              only distract them, so it is hidden on those pages. */}
          {!isQuoteFlow && (
          <button
            onClick={openCart}
            className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-brand hover:bg-brand-light"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden sm:inline text-sm font-semibold">Cart</span>
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold tabular-nums text-white shadow-sm">
                {totalItems}
              </span>
            )}
          </button>
          )}
        </div>
      </div>

      {/* Desktop nav */}
      <nav className="hidden border-t border-black/5 lg:block">
        <div className="container-page flex items-center gap-1">
          <Link href="/" onClick={onNavClick("/")} className={navLinkClass("/")}>
            Home
          </Link>
          {DEPARTMENTS.map(({ key, label, href, Icon }) => (
            <div
              key={key}
              className="group relative"
              onMouseEnter={() => setOpenDept(key)}
              onMouseLeave={() => setOpenDept(null)}
            >
              <Link
                href={href}
                onClick={onNavClick(href)}
                className={cn("flex items-center gap-1.5", navLinkClass(href))}
              >
                <Icon className="h-4 w-4" /> {label}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Link>
              {openDept === key && nav[key].length > 0 && (
                <div className="absolute left-0 top-full z-50 w-64 rounded-lg border border-black/5 bg-white p-2 shadow-xl">
                  {nav[key].map((c) => (
                    <Link
                      key={c.slug}
                      href={`/category/${c.slug}`}
                      className="block rounded-md px-3 py-2 text-sm text-ink hover:bg-brand-light hover:text-brand"
                    >
                      {c.name}
                    </Link>
                  ))}
                  <Link
                    href={href}
                    className="mt-1 block rounded-md px-3 py-2 text-sm font-semibold text-brand hover:bg-brand-light"
                  >
                    View all {label} →
                  </Link>
                </div>
              )}
            </div>
          ))}
          <Link href="/products" onClick={onNavClick("/products")} className={navLinkClass("/products")}>
            All Products
          </Link>
          <Link href="/about" onClick={onNavClick("/about")} className={navLinkClass("/about")}>
            About
          </Link>
          <Link href="/contact" onClick={onNavClick("/contact")} className={navLinkClass("/contact")}>
            Contact
          </Link>
        </div>
      </nav>
    </header>

      {/*
        Mobile menu — deliberately a SIBLING of <header>, not a child.
        The header uses backdrop-blur, and any filtered ancestor becomes the
        containing block for `position: fixed`, which would trap this drawer
        inside the header's own height instead of covering the screen.
      */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-brand-dark">{shopName}</span>
              <button aria-label="Close menu" onClick={() => setMobileOpen(false)}>
                <X className="h-6 w-6 text-ink" />
              </button>
            </div>

            <form onSubmit={onSearch} className="mt-4">
              <div className="relative">
                <input
                  name="q"
                  type="search"
                  placeholder="Search products…"
                  className="w-full rounded-lg border border-brand/20 py-2.5 pl-4 pr-11 text-sm outline-none focus:border-brand"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md bg-brand p-2 text-white"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>

            <nav className="mt-4 space-y-1">
              <Link href="/" onClick={onNavClick("/")} className={mobileLinkClass("/")}>
                Home
              </Link>
              {DEPARTMENTS.map(({ key, label, href, Icon }) => (
                <div key={key} className="rounded-md">
                  <div className="flex items-center">
                    <Link
                      href={href}
                      onClick={onNavClick(href)}
                      className={cn(
                        "flex flex-1 items-center gap-2",
                        mobileLinkClass(href)
                      )}
                    >
                      <Icon className="h-4 w-4 text-brand" /> {label}
                    </Link>
                    {nav[key].length > 0 && (
                      <button
                        aria-label={`Toggle ${label}`}
                        onClick={() =>
                          setOpenDept(openDept === key ? null : key)
                        }
                        className="p-2"
                      >
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            openDept === key && "rotate-180"
                          )}
                        />
                      </button>
                    )}
                  </div>
                  {openDept === key && (
                    <div className="ml-4 border-l border-brand/15 pl-2">
                      {nav[key].map((c) => (
                        <Link
                          key={c.slug}
                          href={`/category/${c.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className="block rounded-md px-3 py-2 text-sm text-muted hover:bg-brand-light hover:text-brand"
                        >
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link href="/products" onClick={onNavClick("/products")} className={mobileLinkClass("/products")}>
                All Products
              </Link>
              <Link href="/about" onClick={onNavClick("/about")} className={mobileLinkClass("/about")}>
                About
              </Link>
              <Link href="/contact" onClick={onNavClick("/contact")} className={mobileLinkClass("/contact")}>
                Contact
              </Link>
            </nav>

            <a
              href={`tel:${phone}`}
              className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-brand py-2.5 font-semibold text-white"
            >
              <Phone className="h-4 w-4" /> Call {phone}
            </a>
          </div>
        </div>
      )}
    </>
  );
}
