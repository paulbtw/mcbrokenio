/* eslint-disable @typescript-eslint/promise-function-async */
import { type CreatePos } from '@libs/types'
import { chunkArray } from '@libs/utils/chunkArray'
import { createPrismaClient } from '@libs/utils/createPrismaClient'
import { Prisma } from '@prisma/client'
import { Logger } from '@sailplane/logger'

const logger = new Logger('savePos')

const PREPARED_STATEMENT_LIMIT = 32767 - 1
const PREPARED_STATEMENT_COUNT = 7

export async function savePos(posArray: CreatePos[]) {
  const prisma = createPrismaClient()

  const chunkedPosArray = chunkArray(posArray, Math.floor(PREPARED_STATEMENT_LIMIT / PREPARED_STATEMENT_COUNT))

  try {
    await prisma.$transaction(
      chunkedPosArray.map((chunk) => {
        return prisma.$executeRaw`INSERT INTO "Pos" (id, "nationalStoreNumber", name, latitude, longitude, "hasMobileOrdering", country) VALUES ${Prisma.join(
          chunk.map(
            (value) =>
              Prisma.sql`(${Prisma.join([
                value.id,
                value.nationalStoreNumber,
                value.name,
                value.latitude,
                value.longitude,
                value.hasMobileOrdering,
                value.country
              ])})`
          )
        )}
        ON CONFLICT (id) DO UPDATE SET "hasMobileOrdering" = EXCLUDED."hasMobileOrdering"`
      })
    )
  } catch (error) {
    logger.error(error as Error)
    logger.error('error while saving pos')
  } finally {
    await prisma.$disconnect()
  }
}
