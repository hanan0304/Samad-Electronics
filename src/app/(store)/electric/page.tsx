import type { Metadata } from "next";
import { DepartmentView } from "@/components/catalog/department-view";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 600;

export const metadata: Metadata = buildMetadata({
  title: "Electric Shop in Lahore — Switches, Wires, LED Bulbs & Fans",
  description:
    "Buy electrical goods in Lahore: wall switches, sockets, wires & cables, circuit breakers, LED bulbs, tube lights, ceiling fans and more. Live prices, trusted brands.",
  path: "/electric",
  keywords: ["electric switches Lahore", "wires Lahore", "LED bulbs Lahore", "ceiling fans Lahore"],
});

export default async function ElectricPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <DepartmentView
      department="ELECTRIC"
      label="Electric"
      href="/electric"
      intro="Everything for your home and commercial wiring — modular switches and sockets, copper wires and cables, MCBs and distribution boards, energy-saving LED bulbs and tube lights, ceiling fans and extension boards. Genuine brands at honest, up-to-date prices from Samad Traders, Lahore."
      searchParams={await searchParams}
    />
  );
}
