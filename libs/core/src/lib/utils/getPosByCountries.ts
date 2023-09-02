import { PrismaClient } from '@prisma/client';

export function getPosByCountries(prisma: PrismaClient, countries?: string[]) {
  try {
    return prisma.pos.findMany({
      where: {
        country: {
          in: countries,
        },
        hasMobileOrdering: true,
      },
      take: 2000,
      orderBy: {
        updatedAt: 'asc',
      },
    });
  } catch (error) {
    throw Error('Error while getting pos by countries');
  }
}
