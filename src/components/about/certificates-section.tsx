import Image from "next/image";
import { ShieldCheck, FileCheck2 } from "lucide-react";

export type CertificateCardDTO = {
  id: string;
  name: string;
  logoUrl: string | null;
  fileUrl: string | null;
};

/**
 * "Officially certified by" wall.
 *
 * Each company is a button: tapping it opens that company's certificate in a
 * new tab. Companies added from Admin → Certificates appear here automatically.
 */
export function CertificatesSection({
  items,
}: {
  items: CertificateCardDTO[];
}) {
  if (items.length === 0) return null;

  return (
    <section data-reveal className="mt-12">
      <div className="flex items-center gap-2.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-light text-brand">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-extrabold text-brand-dark sm:text-2xl">
            We hold official certificates
          </h2>
          <p className="text-sm text-muted">
            Authorised and certified by the companies we supply — tap any logo
            to view the certificate.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((c) => {
          const inner = (
            <>
              <div className="grid h-16 w-full place-items-center">
                {c.logoUrl ? (
                  <div className="relative h-14 w-full">
                    <Image
                      src={c.logoUrl}
                      alt={c.name}
                      fill
                      sizes="(min-width: 1024px) 180px, 40vw"
                      className="object-contain transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <span className="px-2 text-center font-display text-base font-extrabold leading-tight text-brand-dark">
                    {c.name}
                  </span>
                )}
              </div>
              <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-accent">
                <FileCheck2 className="h-3.5 w-3.5" />
                {c.fileUrl ? "View certificate" : "Certified"}
              </span>
            </>
          );

          const cls =
            "group flex flex-col items-center justify-center rounded-xl bg-white p-4 shadow-sm ring-1 ring-line transition-all duration-200";

          // Only make it a link when there is actually a file to open.
          return c.fileUrl ? (
            <a
              key={c.id}
              href={c.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={`View ${c.name} certificate`}
              className={`${cls} hover:-translate-y-1 hover:shadow-card hover:ring-brand/25`}
            >
              {inner}
            </a>
          ) : (
            <div key={c.id} className={cls}>
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
}
