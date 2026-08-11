import { CountryInfos } from '../constants/CountryInfos'
import {
  type APIType,
  type ICountryInfos,
  type Locations
} from '../types'

export interface MarketDefinition extends ICountryInfos {
  catalogScope: Locations
}

/**
 * Selects from the application's closed set of supported Market definitions.
 * Catalog Scope keys are scheduling slices; `country` remains the commercial
 * Market shared by stores and Product Availability configuration.
 */
export function selectMarketDefinitions(
  apiType: APIType,
  catalogScopes?: Locations[]
): MarketDefinition[] {
  return Object.entries(CountryInfos)
    .filter(
      ([scope, definition]) =>
        definition.getStores.api === apiType &&
        (catalogScopes == null ||
          catalogScopes.includes(scope as Locations))
    )
    .map(([scope, definition]) => ({
      ...definition,
      catalogScope: scope as Locations
    }))
}

export function getMarketCountries(
  apiType: APIType,
  catalogScopes?: Locations[]
): string[] {
  return Array.from(
    new Set(
      selectMarketDefinitions(apiType, catalogScopes).map(
        (definition) => definition.country
      )
    )
  )
}

export function getExpectedCatalogScopes(
  apiType: APIType,
  country: string
): Locations[] {
  return selectMarketDefinitions(apiType)
    .filter((definition) => definition.country === country)
    .map((definition) => definition.catalogScope)
}
