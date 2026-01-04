import { prisma } from '@mcbroken/db'
import { Logger } from '@sailplane/logger'

import { type UpdatePos } from '../../types'

const logger = new Logger('updatePos')

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
            lastChecked: now,
            updatedAt: now
          }
        })
      })
    )
  } catch (error) {
    logger.error(error as Error)

    logger.error('error while saving pos')
  } finally {
    await prisma.$disconnect()
  }
}
