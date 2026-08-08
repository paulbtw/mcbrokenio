const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

/**
 * Returns the UTC Sunday that identifies a weekly Store Catalog refresh cycle.
 */
export function getCatalogCycleId(date: Date): string {
  const utcDayStart = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  )
  const sunday = new Date(utcDayStart - date.getUTCDay() * MILLISECONDS_PER_DAY)

  return sunday.toISOString().slice(0, 10)
}

/**
 * Returns the weekly cycle immediately before a validated UTC Sunday cycle.
 */
export function getPreviousCatalogCycleId(cycleId: string): string {
  const cycleStart = new Date(`${cycleId}T00:00:00.000Z`)

  if (
    Number.isNaN(cycleStart.getTime()) ||
    cycleStart.getUTCDay() !== 0 ||
    cycleStart.toISOString().slice(0, 10) !== cycleId
  ) {
    throw new Error(`Invalid Store Catalog cycle id: ${cycleId}`)
  }

  return new Date(
    cycleStart.getTime() - 7 * MILLISECONDS_PER_DAY
  ).toISOString().slice(0, 10)
}
