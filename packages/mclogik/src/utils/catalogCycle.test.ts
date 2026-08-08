import { describe, expect, it } from 'vitest'

import {
  getCatalogCycleId,
  getPreviousCatalogCycleId
} from './catalogCycle'

describe('getCatalogCycleId', () => {
  it('uses the most recent Sunday in UTC for the weekly catalog cycle', () => {
    expect(getCatalogCycleId(new Date('2026-08-02T00:05:00.000Z'))).toBe(
      '2026-08-02'
    )
    expect(getCatalogCycleId(new Date('2026-08-08T23:59:59.999Z'))).toBe(
      '2026-08-02'
    )
  })

  it('keeps retries after Sunday in the same cycle', () => {
    expect(getCatalogCycleId(new Date('2026-08-03T08:00:00.000Z'))).toBe(
      '2026-08-02'
    )
  })

  it('handles a cycle that crosses a year boundary', () => {
    expect(getCatalogCycleId(new Date('2027-01-01T12:00:00.000Z'))).toBe(
      '2026-12-27'
    )
  })
})

describe('getPreviousCatalogCycleId', () => {
  it('returns the immediately preceding weekly cycle across month and year boundaries', () => {
    expect(getPreviousCatalogCycleId('2026-08-02')).toBe('2026-07-26')
    expect(getPreviousCatalogCycleId('2027-01-03')).toBe('2026-12-27')
  })
})
