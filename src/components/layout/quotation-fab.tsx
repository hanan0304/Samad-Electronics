import Link from "next/link";
import { FileText } from "lucide-react";

/**
 * Floating "Get a Quotation" button.
 *
 * Stacked directly above the WhatsApp button (which is 56px tall at bottom-5)
 * so the two never overlap on any screen size, and a customer can start a
 * quotation from any page without hunting through the menu.
 */
export function QuotationFab() {
  return (
    <Link
      href="/quotation"
      className="no-print fixed bottom-24 right-5 z-30 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-xs font-bold tracking-wide text-white shadow-[0_6px_20px_rgba(180,95,46,0.45)] ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-dark hover:shadow-[0_10px_26px_rgba(180,95,46,0.55)] sm:text-sm"
    >
      <FileText className="h-4 w-4 shrink-0" />
      GET A QUOTATION
    </Link>
  );
}
