// /lib/prisma.ts - CORRECTED VERSION
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
  prismaConnectionCount: number;
};

// Connection pool configuration
const createPrismaClient = () => {
  const prisma = new PrismaClient({
    // Add logging in development
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  return prisma;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Initialize connection count tracking
if (!globalForPrisma.prismaConnectionCount) {
  globalForPrisma.prismaConnectionCount = 0;
}

// Connect to database and track connections
prisma
  .$connect()
  .then(() => {
    globalForPrisma.prismaConnectionCount++;
    console.log(
      `Prisma connected. Active connections: ${globalForPrisma.prismaConnectionCount}`
    );
  })
  .catch((error) => {
    console.error("Failed to connect to database:", error);
  });

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  console.log(`${signal} received, disconnecting Prisma...`);
  try {
    await prisma.$disconnect();
    globalForPrisma.prismaConnectionCount = 0;
    console.log("Prisma disconnected successfully");
  } catch (error) {
    console.error("Error disconnecting Prisma:", error);
  }
};

// Handle different shutdown signals
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("beforeExit", () => {
  console.log("Application shutting down, disconnecting Prisma...");
  prisma.$disconnect().catch(console.error);
});

export default prisma;
