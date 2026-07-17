import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

// In Next.js development mode, files are re-evaluated on code changes due to Hot Module Replacement (HMR).
// This would normally create a new PrismaClient instance on every hot-reload, exhausting database connection limits.
// To prevent this, we declare a global variable on `globalThis` as globals are preserved across reloads.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Helper function to instantiate a new PrismaClient with a PostgreSQL driver adapter.
 */
function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  // Set up the PostgreSQL adapter for serverless/edge-compatible connections
  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter });
}

// Export the singleton prisma instance.
// Reuses the globally-cached instance if it exists; otherwise, creates a new one.
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// In non-production environments, save the instance to globalThis to prevent multiple clients from being initialized
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}