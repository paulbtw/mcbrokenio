import { type PrismaClient } from '@mcbroken/db'
import { Logger } from '@sailplane/logger'

const logger = new Logger('getPosByCountries')

export async function getPosByCountries(prisma: PrismaClient, countries?: string[]) {
  try {
    return await prisma.pos.findMany({
      where: {
        country: {
          in: countries
        },
        hasMobileOrdering: true
      },
      take: 2000,
      orderBy: {
        updatedAt: 'asc'
      }
    })
  } catch (error) {
    logger.error(error as Error)
    throw Error('Error while getting pos by countries')
  }
}
