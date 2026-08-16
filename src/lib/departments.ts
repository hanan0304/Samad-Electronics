import type { Department } from "@prisma/client";

export const DEPARTMENT_META: Record<
  Department,
  { label: string; href: string }
> = {
  ELECTRIC: { label: "Electric", href: "/electric" },
  SANITARY: { label: "Sanitary", href: "/sanitary" },
  FANCY_LIGHTS: { label: "Fancy Lights", href: "/fancy-lights" },
};
