import { Prisma, type PrismaClient } from '@mcbroken/db'
import { Logger } from '@sailplane/logger'

import { type CreatePos } from '../types'
import { getPreviousCatalogCycleId } from '../utils/catalogCycle'
import { chunkArray } from '../utils/chunkArray'

const logger = new Logger('CatalogLifecycleRepository')

const PREPARED_STATEMENT_LIMIT = 32767 - 1
const OBSERVATION_VALUE_COUNT = 9
const DEFAULT_MISSING_CYCLES_BEFORE_CLOSE = 3
const DEFAULT_CLOSED_RETENTION_DAYS = 90
const DEFAULT_MINIMUM_COVERAGE_RATIO = 0.8
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

export interface CatalogScopeRefreshInput {
  cycleId: string
  country: string
  scope: string
  expectedScopes: string[]
  complete: boolean
  stores: CreatePos[]
  observedAt: Date
}

export interface CatalogScopeRefreshResult {
  storesPersisted: number
  scopeCompleted: boolean
  cycleFinalized: boolean
  reconciliationSkipped: boolean
  storesMarkedMissing: number
  storesClosed: number
  storesPurged: number
}

export interface CatalogLifecycleRepository {
  recordScopeRefresh(
    input: CatalogScopeRefreshInput
  ): Promise<CatalogScopeRefreshResult>
}

interface CatalogLifecycleOptions {
  missingCyclesBeforeClose?: number
  closedRetentionDays?: number
  minimumCoverageRatio?: number
}

function createResult(
  storesPersisted: number,
  overrides: Partial<CatalogScopeRefreshResult> = {}
): CatalogScopeRefreshResult {
  return {
    storesPersisted,
    scopeCompleted: false,
    cycleFinalized: false,
    reconciliationSkipped: false,
    storesMarkedMissing: 0,
    storesClosed: 0,
    storesPurged: 0,
    ...overrides
  }
}

export class PrismaCatalogLifecycleRepository implements CatalogLifecycleRepository {
  private readonly missingCyclesBeforeClose: number
  private readonly closedRetentionDays: number
  private readonly minimumCoverageRatio: number

  constructor(
    private readonly prisma: PrismaClient,
    options: CatalogLifecycleOptions = {}
  ) {
    this.missingCyclesBeforeClose =
      options.missingCyclesBeforeClose ?? DEFAULT_MISSING_CYCLES_BEFORE_CLOSE
    this.closedRetentionDays =
      options.closedRetentionDays ?? DEFAULT_CLOSED_RETENTION_DAYS
    this.minimumCoverageRatio =
      options.minimumCoverageRatio ?? DEFAULT_MINIMUM_COVERAGE_RATIO

    if (this.missingCyclesBeforeClose < 2) {
      throw new Error('missingCyclesBeforeClose must be at least 2')
    }
    if (this.closedRetentionDays < 0) {
      throw new Error('closedRetentionDays cannot be negative')
    }
    if (this.minimumCoverageRatio < 0 || this.minimumCoverageRatio > 1) {
      throw new Error('minimumCoverageRatio must be between 0 and 1')
    }
  }

  async recordScopeRefresh(
    input: CatalogScopeRefreshInput
  ): Promise<CatalogScopeRefreshResult> {
    const expectedScopes = [...new Set(input.expectedScopes)]

    if (!expectedScopes.includes(input.scope)) {
      throw new Error(
        `Catalog scope ${input.scope} is not configured for ${input.country}`
      )
    }

    try {
      const newerCycle = await this.prisma.catalogRefreshCycle.findFirst({
        where: {
          country: input.country,
          cycleId: { gt: input.cycleId },
          finalizedAt: { not: null }
        },
        select: { cycleId: true }
      })

      if (newerCycle != null) {
        return createResult(0)
      }

      return await this.prisma.$transaction(async (tx) => {
        await tx.$queryRaw`
          SELECT pg_advisory_xact_lock(
            hashtext('mcbroken-catalog'),
            hashtext(${input.country})
          )
        `

        const newerCycleAfterLock =
          await tx.catalogRefreshCycle.findFirst({
            where: {
              country: input.country,
              cycleId: { gt: input.cycleId },
              finalizedAt: { not: null }
            },
            select: { cycleId: true }
          })

        if (newerCycleAfterLock != null) {
          return createResult(0)
        }

        const storesPersisted = await this.observeStores(
          tx,
          input.stores,
          input.cycleId,
          input.observedAt
        )
        const retentionCutoff = new Date(
          input.observedAt.getTime() -
            this.closedRetentionDays * MILLISECONDS_PER_DAY
        )
        const purged = await tx.pos.deleteMany({
          where: {
            country: input.country,
            closedAt: { lte: retentionCutoff }
          }
        })

        if (!input.complete) {
          return createResult(storesPersisted, {
            storesPurged: purged.count
          })
        }

        await tx.catalogRefreshCycle.upsert({
          where: {
            cycleId_country: {
              cycleId: input.cycleId,
              country: input.country
            }
          },
          create: {
            cycleId: input.cycleId,
            country: input.country
          },
          update: {}
        })
        await tx.catalogRefreshScope.upsert({
          where: {
            cycleId_country_scope: {
              cycleId: input.cycleId,
              country: input.country,
              scope: input.scope
            }
          },
          create: {
            cycleId: input.cycleId,
            country: input.country,
            scope: input.scope,
            discoveredStoreCount: input.stores.length,
            completedAt: input.observedAt
          },
          update: {
            discoveredStoreCount: input.stores.length,
            completedAt: input.observedAt
          }
        })

        const completedScopeCount = await tx.catalogRefreshScope.count({
          where: {
            cycleId: input.cycleId,
            country: input.country,
            scope: { in: expectedScopes }
          }
        })

        if (completedScopeCount < expectedScopes.length) {
          return createResult(storesPersisted, {
            scopeCompleted: true,
            storesPurged: purged.count
          })
        }

        const claim = await tx.catalogRefreshCycle.updateMany({
          where: {
            cycleId: input.cycleId,
            country: input.country,
            finalizedAt: null
          },
          data: { finalizedAt: input.observedAt }
        })

        if (claim.count === 0) {
          return createResult(storesPersisted, {
            scopeCompleted: true,
            storesPurged: purged.count
          })
        }

        const [knownStoreCount, observedStoreCount, previousHealthyCycle] =
          await Promise.all([
            tx.pos.count({
              where: { country: input.country, closedAt: null }
            }),
            tx.pos.count({
              where: {
                country: input.country,
                lastCatalogSeenCycle: input.cycleId
              }
            }),
            tx.catalogRefreshCycle.findFirst({
              where: {
                country: input.country,
                finalizedAt: { not: null },
                reconciliationSkipped: false,
                observedStoreCount: { not: null },
                cycleId: { lt: input.cycleId }
              },
              orderBy: { cycleId: 'desc' },
              select: { cycleId: true, observedStoreCount: true }
            })
          ])
        const previousObservedStoreCount =
          previousHealthyCycle?.observedStoreCount
        const isInitialBaseline = previousHealthyCycle == null
        const coverageReference = isInitialBaseline
          ? knownStoreCount
          : previousObservedStoreCount != null &&
              previousObservedStoreCount > 0
            ? previousObservedStoreCount
            : knownStoreCount
        const reconciliationSkipped =
          coverageReference > 0 &&
          observedStoreCount / coverageReference < this.minimumCoverageRatio

        await tx.catalogRefreshCycle.update({
          where: {
            cycleId_country: {
              cycleId: input.cycleId,
              country: input.country
            }
          },
          data: {
            reconciliationSkipped,
            knownStoreCount,
            observedStoreCount
          }
        })

        if (reconciliationSkipped) {
          logger.warn(
            `Skipping ${input.country} catalog reconciliation: observed ${observedStoreCount}/${coverageReference} stores from the coverage baseline`
          )
          return createResult(storesPersisted, {
            scopeCompleted: true,
            cycleFinalized: true,
            reconciliationSkipped: true,
            storesPurged: purged.count
          })
        }

        if (previousHealthyCycle == null) {
          return createResult(storesPersisted, {
            scopeCompleted: true,
            cycleFinalized: true,
            storesPurged: purged.count
          })
        }

        const closeThreshold = this.missingCyclesBeforeClose - 1
        const previousCycleId = getPreviousCatalogCycleId(input.cycleId)
        const notSeenInCurrentCycle = {
          OR: [
            { lastCatalogSeenCycle: null },
            { lastCatalogSeenCycle: { lt: input.cycleId } }
          ]
        }
        const closed = await tx.pos.updateMany({
          where: {
            country: input.country,
            closedAt: null,
            missingCatalogCycles: { gte: closeThreshold },
            lastMissingCatalogCycle: previousCycleId,
            ...notSeenInCurrentCycle
          },
          data: {
            missingCatalogCycles: this.missingCyclesBeforeClose,
            lastMissingCatalogCycle: input.cycleId,
            closedAt: input.observedAt
          }
        })
        const missing = await tx.pos.updateMany({
          where: {
            country: input.country,
            closedAt: null,
            missingCatalogCycles: { lt: closeThreshold },
            lastMissingCatalogCycle: previousCycleId,
            ...notSeenInCurrentCycle
          },
          data: {
            missingCatalogCycles: { increment: 1 },
            lastMissingCatalogCycle: input.cycleId
          }
        })
        const restarted = await tx.pos.updateMany({
          where: {
            country: input.country,
            closedAt: null,
            AND: [
              notSeenInCurrentCycle,
              {
                OR: [
                  { lastMissingCatalogCycle: null },
                  { lastMissingCatalogCycle: { not: previousCycleId } }
                ]
              }
            ]
          },
          data: {
            missingCatalogCycles: 1,
            lastMissingCatalogCycle: input.cycleId
          }
        })

        return createResult(storesPersisted, {
          scopeCompleted: true,
          cycleFinalized: true,
          storesMarkedMissing: missing.count + restarted.count,
          storesClosed: closed.count,
          storesPurged: purged.count
        })
      })
    } catch (error) {
      logger.error(error as Error)
      throw new Error(
        `Failed to record Store Catalog scope ${input.scope}: ${error instanceof Error ? error.message : error}`
      )
    }
  }

  private async observeStores(
    client: Prisma.TransactionClient,
    stores: CreatePos[],
    cycleId: string,
    observedAt: Date
  ): Promise<number> {
    if (stores.length === 0) {
      return 0
    }

    const chunks = chunkArray(
      [...stores],
      Math.floor(PREPARED_STATEMENT_LIMIT / OBSERVATION_VALUE_COUNT)
    )

    try {
      let storesPersisted = 0

      for (const chunk of chunks) {
        storesPersisted += await client.$executeRaw`
            INSERT INTO "Pos" (
              id,
              "nationalStoreNumber",
              name,
              latitude,
              longitude,
              "hasMobileOrdering",
              country,
              "lastCatalogSeenAt",
              "lastCatalogSeenCycle"
            ) VALUES ${Prisma.join(
              chunk.map(
                (store) =>
                  Prisma.sql`(${Prisma.join([
                    store.id,
                    store.nationalStoreNumber,
                    store.name,
                    store.latitude,
                    store.longitude,
                    store.hasMobileOrdering,
                    store.country,
                    observedAt,
                    cycleId
                  ])})`
              )
            )}
            ON CONFLICT (id) DO UPDATE SET
              "hasMobileOrdering" = EXCLUDED."hasMobileOrdering",
              "lastCatalogSeenAt" = EXCLUDED."lastCatalogSeenAt",
              "lastCatalogSeenCycle" = EXCLUDED."lastCatalogSeenCycle",
              "missingCatalogCycles" = 0,
              "lastMissingCatalogCycle" = NULL,
              "closedAt" = NULL
            WHERE "Pos"."lastCatalogSeenCycle" IS NULL
              OR EXCLUDED."lastCatalogSeenCycle" > "Pos"."lastCatalogSeenCycle"
              OR (
                EXCLUDED."lastCatalogSeenCycle" = "Pos"."lastCatalogSeenCycle"
                AND EXCLUDED."lastCatalogSeenAt" >= "Pos"."lastCatalogSeenAt"
              )
          `
      }

      return storesPersisted
    } catch (error) {
      logger.error(error as Error)
      throw new Error(
        `Failed to persist Store Catalog observations: ${error instanceof Error ? error.message : error}`
      )
    }
  }
}

/**
 * Creates the persistence adapter for Store Catalog lifecycle reconciliation.
 *
 * @param prisma - Shared Prisma client used by the serverless runtime
 * @returns A repository that records scoped refreshes and reconciles closures
 */
export function createCatalogLifecycleRepository(
  prisma: PrismaClient
): CatalogLifecycleRepository {
  return new PrismaCatalogLifecycleRepository(prisma)
}
