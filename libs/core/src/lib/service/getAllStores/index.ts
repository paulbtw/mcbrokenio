import { createPrismaClient } from '@mcbroken/db';

async function Test() {
  const prisma = createPrismaClient();

  await prisma.$disconnect();
}

export default Test;
