import { type PrismaClient } from '@mcbroken/db'

interface QueryResult {
  total: number
  trackable: number
  availablemilkshakes: number
  totalmilkshakes: number
  availablemcflurry: number
  totalmcflurry: number
  availablemcsundae: number
  totalmcsundae: number
  country: string
}

export async function generateStats(prisma: PrismaClient) {
  const result = await prisma.$queryRaw<QueryResult[]>`
  SELECT COUNT(*) AS TOTAL,
    COUNT(CASE WHEN "hasMobileOrdering" = TRUE AND "isResponsive" = TRUE THEN 1 END) AS TRACKABLE,
    COUNT(CASE WHEN "milkshakeStatus" = 'AVAILABLE' AND "isResponsive" = TRUE THEN 1 END) AS AVAILABLEMILKSHAKES,
    COUNT(CASE WHEN "milkshakeStatus" NOT IN ('UNKNOWN', 'NOT_APPLICABLE') AND "isResponsive" = TRUE THEN 1 END) AS TOTALMILKSHAKES,
    COUNT(CASE WHEN "mcFlurryStatus" = 'AVAILABLE' AND "isResponsive" = TRUE THEN 1 END) AS AVAILABLEMCFLURRY,
    COUNT(CASE WHEN "mcFlurryStatus" NOT IN ('UNKNOWN', 'NOT_APPLICABLE') AND "isResponsive" = TRUE THEN 1 END) AS TOTALMCFLURRY,
    COUNT(CASE WHEN "mcSundaeStatus" = 'AVAILABLE' AND "isResponsive" = TRUE THEN 1 END) AS AVAILABLEMCSUNDAE,
    COUNT(CASE WHEN "mcSundaeStatus" NOT IN ('UNKNOWN', 'NOT_APPLICABLE') AND "isResponsive" = TRUE THEN 1 END) AS TOTALMCSUNDAE,
    "country"
    FROM "Pos" GROUP BY "country"
    UNION ALL SELECT COUNT(*) as TOTAL,
    COUNT(CASE WHEN "hasMobileOrdering" = TRUE AND "isResponsive" = TRUE THEN 1 END) AS TRACKABLE,
    COUNT(CASE WHEN "milkshakeStatus" = 'AVAILABLE' AND "isResponsive" = TRUE THEN 1 END) AS AVAILABLEMILKSHAKES,
    COUNT(CASE WHEN "milkshakeStatus" NOT IN ('UNKNOWN', 'NOT_APPLICABLE') AND "isResponsive" = TRUE THEN 1 END) AS TOTALMILKSHAKES,
    COUNT(CASE WHEN "mcFlurryStatus" = 'AVAILABLE' AND "isResponsive" = TRUE THEN 1 END) AS AVAILABLEMCFLURRY,
    COUNT(CASE WHEN "mcFlurryStatus" NOT IN ('UNKNOWN', 'NOT_APPLICABLE') AND "isResponsive" = TRUE THEN 1 END) AS TOTALMCFLURRY,
    COUNT(CASE WHEN "mcSundaeStatus" = 'AVAILABLE' AND "isResponsive" = TRUE THEN 1 END) AS AVAILABLEMCSUNDAE,
    COUNT(CASE WHEN "mcSundaeStatus" NOT IN ('UNKNOWN', 'NOT_APPLICABLE') AND "isResponsive" = TRUE THEN 1 END) AS TOTALMCSUNDAE,
    'UNKNOWN' AS country
    FROM "Pos"`

  return result
}
