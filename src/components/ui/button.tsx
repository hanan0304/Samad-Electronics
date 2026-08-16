import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "accent" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm disabled:opacity-50 disabled:pointer-events-none disabled:translate-y-0 whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-white shadow-sm hover:bg-brand-dark hover:shadow-[0_6px_18px_rgba(14,82,87,0.35)]",
  accent:
    "bg-accent text-white shadow-[0_4px_14px_rgba(180,95,46,0.35)] hover:bg-accent-dark hover:shadow-[0_8px_22px_rgba(180,95,46,0.5)]",
  outline:
    "border border-brand/30 text-brand hover:border-brand/60 hover:bg-brand-light hover:shadow-md",
  ghost: "text-brand hover:bg-brand-light hover:shadow-sm",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-[0_6px_18px_rgba(220,38,38,0.4)]",
};

const sizes: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5",
  md: "text-sm px-4 py-2.5",
  lg: "text-base px-6 py-3",
};

export function buttonClasses(
  variant: Variant = "primary",
  size: Size = "md",
  className?: string
) {
  return cn(base, variants[variant], sizes[size], className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button className={buttonClasses(variant, size, className)} {...props} />
  );
}
