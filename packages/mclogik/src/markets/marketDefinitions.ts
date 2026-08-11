import { CountryInfos } from '../constants/CountryInfos'
import {
  type APIType,
  asCatalogScope,
  asMarketCode,
  type CatalogScope,
  type ICountryInfos,
  type MarketCode
} from '../types'

export interface MarketDefinition extends Omit<ICountryInfos, 'catalogScope'> {
  market: MarketCode
  catalogScope: CatalogScope
}

/**
 * Selects from the application's closed set of supported Market definitions.
 * Catalog Scope keys are scheduling slices; `country` remains the commercial
 * Market shared by stores and Product Availability configuration.
 */
export function selectMarketDefinitions(
  apiType: APIType,
  catalogScopes?: CatalogScope[]
): MarketDefinition[] {
  return Object.entries(CountryInfos)
    .filter(
      ([scope, definition]) =>
        definition.getStores.api === apiType &&
        (catalogScopes == null ||
          catalogScopes.includes(
            asCatalogScope(scope as ICountryInfos['country'])
          ))
    )
    .map(([scope, definition]) => ({
      ...definition,
      market: asMarketCode(definition.country),
      catalogScope: asCatalogScope(scope as ICountryInfos['country'])
    }))
}

/** Selects one Product Availability definition for each requested Market. */
export function selectAvailabilityMarketDefinitions(
  apiType: APIType,
  markets?: MarketCode[]
): MarketDefinition[] {
  const definitionsByMarket = new Map<MarketCode, MarketDefinition>()

  for (const definition of selectMarketDefinitions(apiType)) {
    if (
      (markets == null || markets.includes(definition.market)) &&
      !definitionsByMarket.has(definition.market)
    ) {
      definitionsByMarket.set(definition.market, definition)
    }
  }

  return Array.from(definitionsByMarket.values())
}

/** Returns the distinct persisted market codes selected for an API. */
export function getMarketCodes(
  apiType: APIType,
  catalogScopes?: CatalogScope[]
): MarketCode[] {
  return Array.from(
    new Set(
      selectMarketDefinitions(apiType, catalogScopes).map(
        (definition) => definition.market
      )
    )
  )
}

/** Returns every Catalog Scope that must complete a Market refresh cycle. */
export function getExpectedCatalogScopes(
  apiType: APIType,
  marketCode: MarketCode
): CatalogScope[] {
  return selectMarketDefinitions(apiType)
    .filter((definition) => definition.market === marketCode)
    .map((definition) => definition.catalogScope)
}
