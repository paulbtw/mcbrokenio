import { describe, expect, it } from 'vitest'

import { APIType, asCatalogScope, asMarketCode, UsLocations } from '../types'

import {
  getExpectedCatalogScopes,
  getMarketCodes,
  selectMarketDefinitions
} from './marketDefinitions'

describe('MarketDefinitions', () => {
  it('selects a Catalog Scope while preserving its commercial Market', () => {
    const markets = selectMarketDefinitions(APIType.US, [
      asCatalogScope(UsLocations.US2)
    ])

    expect(markets).toHaveLength(1)
    expect(markets[0]).toMatchObject({
      market: UsLocations.US,
      country: UsLocations.US,
      catalogScope: UsLocations.US2
    })
  })

  it('deduplicates split Catalog Scopes when selecting Market countries', () => {
    expect(
      getMarketCodes(APIType.US, [
        asCatalogScope(UsLocations.US),
        asCatalogScope(UsLocations.US2)
      ])
    ).toEqual([UsLocations.US])
  })

  it('lists every expected Catalog Scope for reconciliation', () => {
    expect(
      getExpectedCatalogScopes(APIType.US, asMarketCode(UsLocations.US))
    ).toEqual([
      UsLocations.US,
      UsLocations.US2,
      UsLocations.US3,
      UsLocations.US4,
      UsLocations.US5,
      UsLocations.US6
    ])
  })
})
