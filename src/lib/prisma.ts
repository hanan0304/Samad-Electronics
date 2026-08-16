import { PrismaClient } from "@prisma/client";

/**
 * A single shared PrismaClient instance.
 *
 * In development Next.js reloads modules on every change, which would otherwise
 * create a new database connection each time and exhaust the pool. We cache the
 * client on `globalThis` to reuse it across hot reloads.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
