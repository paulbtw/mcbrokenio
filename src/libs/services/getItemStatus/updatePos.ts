/* eslint-disable @typescript-eslint/promise-function-async */
import { type UpdatePos } from '@libs/types'
import { createPrismaClient } from '@libs/utils/createPrismaClient'
import { Logger } from '@sailplane/logger'

const logger = new Logger('updatePos')

export async function updatePos(posArray: UpdatePos[]) {
  const prisma = createPrismaClient()

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

        // return prisma.$executeRaw`UPDATE "Pos" SET "mcFlurryCount" = ${pos.mcFlurryCount}, "mcFlurryError" = ${pos.mcFlurryError}, "mcFlurryStatus" = ${pos.mcFlurryStatus}, "mcSundaeCount" = ${pos.mcSundaeCount}, "mcSundaeError" = ${pos.mcSundaeError}, "mcSundaeStatus" = ${pos.mcSundaeStatus}, "milkshakeCount" = ${pos.milkshakeCount}, "milkshakeError" = ${pos.milkshakeError}, "milkshakeStatus" = ${pos.milkshakeStatus}, "lastChecked" = ${pos.lastChecked} WHERE "id" = ${pos.id}`
      })
    )
  } catch (error) {
    logger.error(error as Error)

    logger.error('error while saving pos')
  } finally {
    await prisma.$disconnect()
  }
}
