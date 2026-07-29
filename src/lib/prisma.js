// Prisma client singleton.
// When SKIP_DB=true (e.g. Vercel without a database), this module exports
// a null prisma client. The objects-server layer handles the fallback.

const SKIP_DB = process.env.SKIP_DB === "true";

/** @type {import("@prisma/client").PrismaClient | null} */
let prisma = null;

if (!SKIP_DB) {
  const { PrismaClient } = await import("@prisma/client");
  const globalForPrisma = globalThis;

  prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log:
        process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }
}

export { prisma };

