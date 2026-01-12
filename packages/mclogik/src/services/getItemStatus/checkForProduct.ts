import { ItemStatus } from '@mcbroken/db'

import { NOT_APPLICABLE_MARKER } from '../../clients'

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
  items: string[]
): {
    status: ItemStatus
    count: number
    unavailable: number
  } {
  const count = items.length
  let unavailable = 0

  if (items.length === 0) {
    return {
      status: ItemStatus.UNAVAILABLE,
      count,
      unavailable
    }
  }

  if (items.includes(NOT_APPLICABLE_MARKER)) {
    return {
      status: ItemStatus.NOT_APPLICABLE,
      count,
      unavailable
    }
  }

  items.forEach((item) => {
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
