import {
  type NormalizedProductCodeConfig,
  NOT_APPLICABLE_PRODUCT_MARKER,
  type ProductCodeConfig,
  type ProductMarker,
  UNAVAILABLE_PRODUCT_MARKER,
  type UnavailableProductConfig
} from '../types'

const legacyUnavailableMarkers = new Set<ProductMarker>([
  UNAVAILABLE_PRODUCT_MARKER,
  NOT_APPLICABLE_PRODUCT_MARKER
])

export function unavailableProduct(
  marker: ProductMarker = UNAVAILABLE_PRODUCT_MARKER
): UnavailableProductConfig {
  return {
    kind: 'unavailable',
    marker
  }
}

export function normalizeProductCodeConfig(
  config: ProductCodeConfig
): NormalizedProductCodeConfig {
  if (!Array.isArray(config)) {
    return { kind: 'unavailable' }
  }

  if (config.some((code): code is ProductMarker => legacyUnavailableMarkers.has(code as ProductMarker))) {
    return { kind: 'unavailable' }
  }

  return {
    kind: 'tracked',
    codes: config
  }
}
