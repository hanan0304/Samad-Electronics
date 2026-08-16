import type { Metadata } from "next";
import { DepartmentView } from "@/components/catalog/department-view";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 600;

export const metadata: Metadata = buildMetadata({
  title: "Fancy Lights in Lahore — Chandeliers, Wall Lights & LED Decor",
  description:
    "Decorative fancy lights in Lahore: crystal chandeliers, wall and bracket lights, ceiling and pendant lights, RGB LED strips and outdoor garden lights. Live prices.",
  path: "/fancy-lights",
  keywords: ["fancy lights Lahore", "chandeliers Lahore", "wall lights Lahore", "LED strip Lahore"],
});

export default async function FancyLightsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <DepartmentView
      department="FANCY_LIGHTS"
      label="Fancy Lights"
      href="/fancy-lights"
      intro="Beautiful decorative lighting to transform any space — statement crystal chandeliers, modern wall and bracket lights, ceiling and hanging pendant lights, colour-changing RGB LED strips and weatherproof outdoor garden lights. Light up your home in style with Samad Traders, Lahore."
      searchParams={await searchParams}
    />
  );
}
