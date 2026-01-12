import { type PrismaClient } from '@mcbroken/db'
import { Logger } from '@sailplane/logger'

const logger = new Logger('StatsRepository')

/**
 * Statistics for a country or aggregate
 */
export interface CountryStats {
  country: string
  total: number
  trackable: number
  availableMilkshakes: number
  totalMilkshakes: number
  availableMcFlurry: number
  totalMcFlurry: number
  availableMcSundae: number
  totalMcSundae: number
}

/**
 * Raw query result from database
 */
interface StatsQueryResult {
  total: bigint | number
  trackable: bigint | number
  availablemilkshakes: bigint | number
  totalmilkshakes: bigint | number
  availablemcflurry: bigint | number
  totalmcflurry: bigint | number
  availablemcsundae: bigint | number
  totalmcsundae: bigint | number
  country: string
}

/**
 * Repository interface for Stats data access
 */
export interface StatsRepository {
  /**
   * Get aggregated statistics for all countries
   * Includes per-country breakdown and an aggregate row
   */
  getAggregatedStats(): Promise<CountryStats[]>
}

/**
 * Prisma implementation of StatsRepository
 */
export class PrismaStatsRepository implements StatsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getAggregatedStats(): Promise<CountryStats[]> {
    try {
      const result = await this.prisma.$queryRaw<StatsQueryResult[]>`
        SELECT COUNT(*) AS TOTAL,
          COUNT(CASE WHEN "hasMobileOrdering" = TRUE THEN 1 END) AS TRACKABLE,
          COUNT(CASE WHEN "milkshakeStatus" = 'AVAILABLE' THEN 1 END) AS AVAILABLEMILKSHAKES,
          COUNT(CASE WHEN "milkshakeStatus" NOT IN ('UNKNOWN', 'NOT_APPLICABLE') THEN 1 END) AS TOTALMILKSHAKES,
          COUNT(CASE WHEN "mcFlurryStatus" = 'AVAILABLE' THEN 1 END) AS AVAILABLEMCFLURRY,
          COUNT(CASE WHEN "mcFlurryStatus" NOT IN ('UNKNOWN', 'NOT_APPLICABLE') THEN 1 END) AS TOTALMCFLURRY,
          COUNT(CASE WHEN "mcSundaeStatus" = 'AVAILABLE' THEN 1 END) AS AVAILABLEMCSUNDAE,
          COUNT(CASE WHEN "mcSundaeStatus" NOT IN ('UNKNOWN', 'NOT_APPLICABLE') THEN 1 END) AS TOTALMCSUNDAE,
          "country"
        FROM "Pos" GROUP BY "country"
        UNION ALL SELECT COUNT(*) as TOTAL,
          COUNT(CASE WHEN "hasMobileOrdering" = TRUE THEN 1 END) AS TRACKABLE,
          COUNT(CASE WHEN "milkshakeStatus" = 'AVAILABLE' THEN 1 END) AS AVAILABLEMILKSHAKES,
          COUNT(CASE WHEN "milkshakeStatus" NOT IN ('UNKNOWN', 'NOT_APPLICABLE') THEN 1 END) AS TOTALMILKSHAKES,
          COUNT(CASE WHEN "mcFlurryStatus" = 'AVAILABLE' THEN 1 END) AS AVAILABLEMCFLURRY,
          COUNT(CASE WHEN "mcFlurryStatus" NOT IN ('UNKNOWN', 'NOT_APPLICABLE') THEN 1 END) AS TOTALMCFLURRY,
          COUNT(CASE WHEN "mcSundaeStatus" = 'AVAILABLE' THEN 1 END) AS AVAILABLEMCSUNDAE,
          COUNT(CASE WHEN "mcSundaeStatus" NOT IN ('UNKNOWN', 'NOT_APPLICABLE') THEN 1 END) AS TOTALMCSUNDAE,
          'UNKNOWN' AS country
        FROM "Pos"`

      // Convert bigint to number and normalize field names
      return result.map((row) => ({
        country: row.country,
        total: Number(row.total),
        trackable: Number(row.trackable),
        availableMilkshakes: Number(row.availablemilkshakes),
        totalMilkshakes: Number(row.totalmilkshakes),
        availableMcFlurry: Number(row.availablemcflurry),
        totalMcFlurry: Number(row.totalmcflurry),
        availableMcSundae: Number(row.availablemcsundae),
        totalMcSundae: Number(row.totalmcsundae)
      }))
    } catch (error) {
      logger.error(error as Error)
      throw new Error('Failed to get aggregated stats')
    }
  }
}

/**
 * Factory function to create a PrismaStatsRepository instance
 */
export function createStatsRepository(prisma: PrismaClient): StatsRepository {
  return new PrismaStatsRepository(prisma)
}
