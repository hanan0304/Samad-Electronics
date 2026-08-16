import Image from "next/image";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Product image with a graceful placeholder when no photo has been uploaded yet.
 */
export function ProductImage({
  url,
  alt,
  className,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px",
  priority = false,
}: {
  url: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!url) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-brand-light text-brand/40",
          className
        )}
        aria-label={alt}
      >
        <Lightbulb className="h-10 w-10" strokeWidth={1.25} />
      </div>
    );
  }
  // We optimize images from hosts configured in next.config (Supabase storage,
  // Cloudinary). Any other pasted link (from the bulk import sheet) is rendered
  // unoptimized so it still displays without being on the allow-list.
  const optimizable =
    /\/\/[^/]+\.supabase\.co\/storage\//.test(url) ||
    /\/\/res\.cloudinary\.com\//.test(url);
  return (
    <Image
      src={url}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={!optimizable}
      className={cn("object-cover", className)}
    />
  );
}
