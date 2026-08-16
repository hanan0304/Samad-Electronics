"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  BadgeCheck,
  ShoppingCart,
  FileText,
  MessageSquare,
  Settings,
  Menu,
  X,
  ExternalLink,
  LogOut,
  Store,
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

export type AdminCounts = {
  orders: number;
  quotations: number;
  inquiries: number;
};

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/categories", label: "Categories", Icon: FolderTree },
  { href: "/admin/brands", label: "Brands", Icon: Tag },
  { href: "/admin/certificates", label: "Certificates", Icon: BadgeCheck },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingCart, badge: "orders" as const },
  { href: "/admin/quotations", label: "Quotations", Icon: FileText, badge: "quotations" as const },
  { href: "/admin/inquiries", label: "Inquiries", Icon: MessageSquare, badge: "inquiries" as const },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
];

export function AdminShell({
  children,
  counts,
  adminName,
  shopName,
}: {
  children: React.ReactNode;
  counts: AdminCounts;
  adminName: string;
  shopName: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="space-y-1">
      {NAV.map(({ href, label, Icon, exact, badge }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        const count = badge ? counts[badge] : 0;
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-brand text-white"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="flex-1">{label}</span>
            {count > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-brand-darker">
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#f2f5f8] lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-brand-darker p-4 lg:flex">
        <SidebarHeader shopName={shopName} />
        <div className="mt-6 flex-1">{nav}</div>
        <SidebarFooter adminName={adminName} />
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between bg-brand-darker p-3 text-white lg:hidden">
        <button aria-label="Open menu" onClick={() => setOpen(true)}>
          <Menu className="h-6 w-6" />
        </button>
        <span className="font-bold">{shopName} Admin</span>
        <Link href="/" aria-label="View store">
          <ExternalLink className="h-5 w-5" />
        </Link>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[85%] flex-col bg-brand-darker p-4">
            <div className="flex items-center justify-between">
              <SidebarHeader shopName={shopName} />
              <button aria-label="Close menu" onClick={() => setOpen(false)} className="text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-6 flex-1">{nav}</div>
            <SidebarFooter adminName={adminName} />
          </aside>
        </div>
      )}

      <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}

function SidebarHeader({ shopName }: { shopName: string }) {
  return (
    <Link href="/admin" className="flex items-center gap-2 text-white">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-brand font-bold">
        S
      </span>
      <span className="font-extrabold leading-tight">{shopName}</span>
    </Link>
  );
}

function SidebarFooter({ adminName }: { adminName: string }) {
  return (
    <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
      <Link
        href="/"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
      >
        <Store className="h-4 w-4" /> View store
      </Link>
      <div className="px-3 text-xs text-white/50">Signed in as {adminName}</div>
      <form action={logoutAction}>
        <button
          type="submit"
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </form>
    </div>
  );
}
