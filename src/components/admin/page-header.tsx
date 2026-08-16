import Link from "next/link";
import { Plus, Upload } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export function PageHeader({
  title,
  subtitle,
  actionLabel,
  actionHref,
  secondaryLabel,
  secondaryHref,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
  /** An optional second, lower-emphasis action (e.g. a bulk import). */
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-dark">{title}</h1>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {secondaryLabel && secondaryHref && (
          <Link href={secondaryHref} className={buttonClasses("outline", "md")}>
            <Upload className="h-4 w-4" /> {secondaryLabel}
          </Link>
        )}
        {actionLabel && actionHref && (
          <Link href={actionHref} className={buttonClasses("primary", "md")}>
            <Plus className="h-4 w-4" /> {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
