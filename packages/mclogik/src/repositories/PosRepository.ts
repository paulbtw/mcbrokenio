import { type Pos, Prisma, type PrismaClient } from '@mcbroken/db'
import { Logger } from '@sailplane/logger'

import { chunkArray } from '../utils/chunkArray'

const logger = new Logger('PosRepository')

const PREPARED_STATEMENT_LIMIT = 32767 - 1
const PREPARED_STATEMENT_COUNT = 7

/**
 * Data transfer object for creating a new Pos record
 */
export type CreatePosInput = Prisma.PosCreateInput

/**
 * Data transfer object for updating a Pos record's item status
 */
export interface UpdatePosStatusInput {
  id: string
  mcFlurryCount: number
  mcFlurryError: number
  mcFlurryStatus: Prisma.PosUpdateInput['mcFlurryStatus']
  mcSundaeCount: number
  mcSundaeError: number
  mcSundaeStatus: Prisma.PosUpdateInput['mcSundaeStatus']
  milkshakeCount: number
  milkshakeError: number
  milkshakeStatus: Prisma.PosUpdateInput['milkshakeStatus']
  customItems: Prisma.InputJsonValue
}

/**
 * Options for finding stores by countries
 */
export interface FindByCountriesOptions {
  /** Only include stores with mobile ordering enabled */
  mobileOrderingOnly?: boolean
  /** Maximum number of records to return */
  limit?: number
  /** Order by update time ascending (oldest first) */
  orderByOldestFirst?: boolean
}

/**
 * Repository interface for Pos (Point of Sale / Store) data access
 * This abstraction allows for easy testing by swapping implementations
 */
export interface PosRepository {
  /**
   * Find all stores for the given countries
   */
  findByCountries(countries: string[], options?: FindByCountriesOptions): Promise<Pos[]>

  /**
   * Find all stores in the database
   */
  findAll(): Promise<Pos[]>

  /**
   * Update the item status for multiple stores
   * @returns The number of stores updated
   */
  updateManyStatus(posArray: UpdatePosStatusInput[]): Promise<number>

  /**
   * Upsert (insert or update) multiple stores
   * Updates hasMobileOrdering on conflict
   * @returns The number of stores affected
   */
  upsertMany(posArray: CreatePosInput[]): Promise<number>
}

/**
 * Prisma implementation of PosRepository
 */
export class PrismaPosRepository implements PosRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByCountries(
    countries: string[],
    options: FindByCountriesOptions = {}
  ): Promise<Pos[]> {
    const {
      mobileOrderingOnly = true,
      limit = 2000,
      orderByOldestFirst = true
    } = options

    try {
      return await this.prisma.pos.findMany({
        where: {
          country: { in: countries },
          ...(mobileOrderingOnly && { hasMobileOrdering: true })
        },
        take: limit,
        orderBy: orderByOldestFirst ? { updatedAt: 'asc' } : undefined
      })
    } catch (error) {
      logger.error(error as Error)
      throw new Error(`Failed to find stores by countries: ${error instanceof Error ? error.message : error}`)
    }
  }

  async findAll(): Promise<Pos[]> {
    try {
      return await this.prisma.pos.findMany()
    } catch (error) {
      logger.error(error as Error)
      throw new Error(`Failed to find all stores: ${error instanceof Error ? error.message : error}`)
    }
  }

  async updateManyStatus(posArray: UpdatePosStatusInput[]): Promise<number> {
    if (posArray.length === 0) {
      return 0
    }

    logger.info(`Updating status for ${posArray.length} stores`)
    const now = new Date()

    try {
      await this.prisma.$transaction(
        posArray.map((pos) => {
          if (typeof pos.id !== 'string') {
            throw new Error('pos.id is required and must be a string')
          }

          return this.prisma.pos.update({
            where: { id: pos.id },
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
      return posArray.length
    } catch (error) {
      logger.error(error as Error)
      throw new Error(`Failed to update store statuses: ${error instanceof Error ? error.message : error}`)
    }
  }

  async upsertMany(posArray: CreatePosInput[]): Promise<number> {
    if (posArray.length === 0) {
      return 0
    }

    logger.info(`Upserting ${posArray.length} stores`)
    const chunkedPosArray = chunkArray(
      posArray,
      Math.floor(PREPARED_STATEMENT_LIMIT / PREPARED_STATEMENT_COUNT)
    )

    try {
      await this.prisma.$transaction(
        chunkedPosArray.map((chunk) => {
          return this.prisma.$executeRaw`INSERT INTO "Pos" (id, "nationalStoreNumber", name, latitude, longitude, "hasMobileOrdering", country) VALUES ${Prisma.join(
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
      return posArray.length
    } catch (error) {
      logger.error(error as Error)
      throw new Error(`Failed to upsert stores: ${error instanceof Error ? error.message : error}`)
    }
  }
}

/**
 * Factory function to create a PrismaPosRepository instance
 */
export function createPosRepository(prisma: PrismaClient): PosRepository {
  return new PrismaPosRepository(prisma)
}
