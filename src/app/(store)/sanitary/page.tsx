import type { Metadata } from "next";
import { DepartmentView } from "@/components/catalog/department-view";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 600;

export const metadata: Metadata = buildMetadata({
  title: "Sanitary Shop in Lahore — Bathroom Fittings, Faucets & Commodes",
  description:
    "Sanitary ware and bathroom fittings in Lahore: basin mixers and taps, wash basins, commodes and toilets, showers, PPRC/PVC pipes and bathroom accessories. Live prices.",
  path: "/sanitary",
  keywords: ["sanitary shop Lahore", "bathroom fittings Lahore", "wash basin Lahore", "commode Lahore"],
});

export default async function SanitaryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <DepartmentView
      department="SANITARY"
      label="Sanitary"
      href="/sanitary"
      intro="Complete bathroom and plumbing solutions — basin mixers and pillar taps, modern wash basins, one-piece and two-piece commodes, rain and hand showers, PPRC and PVC pipes and fittings, plus bathroom accessories. Quality sanitary ware for your new home or renovation in Lahore."
      searchParams={await searchParams}
    />
  );
}
