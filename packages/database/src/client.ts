import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';

const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ...(isLambda && { poolSize: 1 }),
});

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma || new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
