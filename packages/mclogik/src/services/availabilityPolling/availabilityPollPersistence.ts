import { type PrismaClient } from '@mcbroken/db'

import { asMarketCode, type MarketCode, type UpdatePos } from '../../types'
import { chunkArray } from '../../utils/chunkArray'

import { type AvailabilityPollStore } from './availabilityPollTypes'

const ELIGIBLE_STORE_LIMIT = 2000
const TRANSACTION_BATCH_SIZE = 100
const TRANSACTION_TIMEOUT_MS = 30_000

export interface AvailabilityPollPersistence {
  loadEligibleStores(
    marketCodes: MarketCode[]
  ): Promise<AvailabilityPollStore[]>
  saveUpdates(updates: UpdatePos[]): Promise<void>
}

export class PrismaAvailabilityPollPersistence implements AvailabilityPollPersistence {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly currentDate: () => Date = () => new Date()
  ) {}

  async loadEligibleStores(
    marketCodes: MarketCode[]
  ): Promise<AvailabilityPollStore[]> {
    const stores = await this.prisma.pos.findMany({
      where: {
        country: { in: marketCodes },
        hasMobileOrdering: true,
        closedAt: null
      },
      take: ELIGIBLE_STORE_LIMIT,
      orderBy: { updatedAt: 'asc' },
      select: {
        id: true,
        nationalStoreNumber: true,
        country: true,
        errorCounter: true
      }
    })

    return stores.map(({ country, ...store }) => ({
      ...store,
      market: asMarketCode(country)
    }))
  }

  async saveUpdates(updates: UpdatePos[]): Promise<void> {
    const validatedUpdates = updates.map((update) => {
      if (typeof update.id !== 'string') {
        throw new Error('Availability update is missing a store id')
      }

      return { ...update, id: update.id }
    })

    if (validatedUpdates.length === 0) {
      return
    }

    const updatedAt = this.currentDate()
    const batches = chunkArray(validatedUpdates, TRANSACTION_BATCH_SIZE)

    for (const batch of batches) {
      await this.prisma.$transaction(
        batch.map((update) =>
          this.prisma.pos.update({
            where: { id: update.id },
            data: {
              mcFlurryCount: update.mcFlurryCount,
              mcFlurryError: update.mcFlurryError,
              mcFlurryStatus: update.mcFlurryStatus,
              mcSundaeCount: update.mcSundaeCount,
              mcSundaeError: update.mcSundaeError,
              mcSundaeStatus: update.mcSundaeStatus,
              milkshakeCount: update.milkshakeCount,
              milkshakeError: update.milkshakeError,
              milkshakeStatus: update.milkshakeStatus,
              customItems: update.customItems,
              errorCounter: update.errorCounter,
              isResponsive: update.isResponsive,
              lastChecked: updatedAt,
              updatedAt
            }
          })
        ),
        { timeout: TRANSACTION_TIMEOUT_MS }
      )
    }
  }
}
