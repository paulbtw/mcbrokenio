import { prisma } from '@mcbroken/db'
import { Logger } from '@sailplane/logger'

import { type UpdatePos } from '../../types'

const logger = new Logger('updatePos')

/**
 * Update item status for multiple POS records in the database.
 *
 * @remarks
 * **Breaking Change:** This function no longer calls `prisma.$disconnect()`.
 * Callers are responsible for managing the Prisma client lifecycle.
 * For Lambda handlers, connection cleanup happens automatically at the end of the handler.
 * For long-running processes, ensure you handle connection cleanup appropriately.
 *
 * @param posArray - Array of POS records with updated status information
 * @throws Re-throws any database errors after logging
 */
export async function updatePos(posArray: UpdatePos[]) {


  logger.info(`saving ${posArray.length} pos`)

  const now = new Date()

  try {
    await prisma.$transaction(
      posArray.map((pos) => {
        if (typeof pos.id !== 'string') {
          throw Error('pos.id is missing')
        }

        return prisma.pos.update({
          where: {
            id: pos.id
          },
          data: {
            mcFlurryCount: pos.mcFlurryCount,
            mcFlurryError: pos.mcFlurryError,
            mcFlurryStatus: pos.mcFlurryStatus,
            mcSundaeCount: pos.mcSundaeCount,
            mcSundaeError: pos.mcSundaeError,
            mcSundaeStatus: pos.mcSundaeStatus,
            milkshakeCount: pos.milkshakeCount,
            milkshakeError: pos.milkshakeError,
            milkshakeStatus: pos.milkshakeStatus,
            customItems: pos.customItems,
            errorCounter: pos.errorCounter,
            isResponsive: pos.isResponsive,
            lastChecked: now,
            updatedAt: now
          }
        })
      })
    )
  } catch (error) {
    logger.error(error as Error)
    logger.error('error while saving pos')
    throw error
  }
}
