import { Prisma, prisma } from '@mcbroken/db'
import { Logger } from '@sailplane/logger'

import { type CreatePos } from '../../types'
import { chunkArray } from '../../utils/chunkArray'

const logger = new Logger('savePos')

const PREPARED_STATEMENT_LIMIT = 32767 - 1
const PREPARED_STATEMENT_COUNT = 7

/**
 * Save or update multiple POS records in the database.
 *
 * @remarks
 * **Breaking Change:** This function no longer calls `prisma.$disconnect()`.
 * Callers are responsible for managing the Prisma client lifecycle.
 * For Lambda handlers, connection cleanup happens automatically at the end of the handler.
 * For long-running processes, ensure you handle connection cleanup appropriately.
 *
 * @param posArray - Array of POS records to upsert
 * @throws Re-throws any database errors after logging
 */
export async function savePos(posArray: CreatePos[]) {

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
    throw error
  }
}
