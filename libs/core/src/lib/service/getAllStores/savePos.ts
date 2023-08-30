import { createPrismaClient } from '@mcbroken/db';
import { CreatePos } from '../../types';
import { Logger } from '@sailplane/logger';

const logger = new Logger('savePos');

export async function savePos(posArray: CreatePos[]) {
  const prisma = createPrismaClient();

  logger.info(`saving ${posArray.length} pos`);

  try {
    await prisma.$transaction(
      posArray.map((pos) => {
        return prisma.pos.upsert({
          where: {
            nationalStoreNumber: pos.nationalStoreNumber,
          },
          update: {
            hasMobileOrdering: pos.hasMobileOrdering,
          },
          create: pos,
        });
      }),
    );
  } catch (error) {
    logger.error(error);
    logger.error('error while saving pos');
  } finally {
    await prisma.$disconnect();
  }
}
