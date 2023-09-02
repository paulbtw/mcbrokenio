import { createPrismaClient } from '@mcbroken/db';
import { UpdatePos } from '../../types';
import { Logger } from '@sailplane/logger';

const logger = new Logger('updatePos');

export async function updatePos(posArray: UpdatePos[]) {
  const prisma = createPrismaClient();

  logger.info(`saving ${posArray.length} pos`);

  try {
    await prisma.$transaction(
      posArray.map((pos) => {
        if (typeof pos.id !== 'string') {
          throw Error('pos.id is missing');
        }

        return prisma.pos.update({
          where: { id: pos.id },
          data: {
            ...pos,
            lastChecked: new Date(),
          },
        });
      }),
    );
  } catch (error) {
    logger.error('error while saving pos');
  } finally {
    await prisma.$disconnect();
  }
}
