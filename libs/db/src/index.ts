import { PrismaClient } from '@prisma/client';

export const createPrismaClient = (): PrismaClient => {
  const prisma = new PrismaClient();
  return prisma;
};
