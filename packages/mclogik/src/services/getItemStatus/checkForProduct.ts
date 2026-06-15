import { ItemStatus } from '@mcbroken/db'

import { type ProductCodeConfig } from '../../types'
import { normalizeProductCodeConfig } from '../../utils/productCodeConfig'

/**
 * Check product availability based on outage codes.
 *
 * @deprecated Use `checkProductAvailability` from `@mcbroken/mclogik/clients` instead.
 * This function is maintained for backward compatibility but the new implementation
 * in `ItemStatusService` provides the same logic with better testability through
 * dependency injection.
 *
 * @example
 * // Instead of:
 * import { checkForProduct } from '@mcbroken/mclogik/getItemStatus'
 *
 * // Use:
 * import { checkProductAvailability } from '@mcbroken/mclogik/clients'
 */
export function checkForProduct(
  outrageProductList: string[],
  items: ProductCodeConfig
): {
    status: ItemStatus
    count: number
    unavailable: number
  } {
  const normalizedItems = normalizeProductCodeConfig(items)

  if (normalizedItems.kind === 'unavailable') {
    return {
      status: ItemStatus.NOT_APPLICABLE,
      count: 0,
      unavailable: 0
    }
  }

  const count = normalizedItems.codes.length
  let unavailable = 0

  if (normalizedItems.codes.length === 0) {
    return {
      status: ItemStatus.UNAVAILABLE,
      count,
      unavailable
    }
  }

  normalizedItems.codes.forEach((item) => {
    if (outrageProductList.includes(item)) {
      unavailable++
    }
  })

  let status: ItemStatus = ItemStatus.AVAILABLE

  if (unavailable === count) {
    status = ItemStatus.UNAVAILABLE
  } else if (unavailable > 0) {
    status = ItemStatus.PARTIAL_AVAILABLE
  }

  return {
    status,
    count,
    unavailable
  }
}
