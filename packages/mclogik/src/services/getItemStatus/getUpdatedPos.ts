import { type Pos } from '@mcbroken/db'

import { type UpdatePos } from '../../types'

import { type GetItemStatus } from './getItemStatus/getItemStatusEu'

/**
 * Number of consecutive API failures before marking a store as unresponsive.
 * Value of 3 balances false positives (transient network issues) against
 * detection speed (quickly identifying truly broken APIs).
 */
const ERROR_THRESHOLD = 3

/**
 * Build update payload for a successful API response.
 * Resets errorCounter and ensures isResponsive = true.
 */
export function getUpdatedPos(pos: Pos, itemStatus: GetItemStatus): UpdatePos {
  const { milkshake, mcFlurry, mcSundae, custom } = itemStatus

  const updatedPos: UpdatePos = {
    id: pos.id,
    milkshakeCount: milkshake.count,
    milkshakeError: milkshake.unavailable,
    milkshakeStatus: milkshake.status,
    mcFlurryCount: mcFlurry.count,
    mcFlurryError: mcFlurry.unavailable,
    mcFlurryStatus: mcFlurry.status,
    mcSundaeCount: mcSundae.count,
    mcSundaeError: mcSundae.unavailable,
    mcSundaeStatus: mcSundae.status,
    customItems: custom.map((customItem) => ({
      name: customItem.name,
      count: customItem.count,
      error: customItem.unavailable,
      status: customItem.status
    })),
    errorCounter: 0,
    isResponsive: true
  }

  return updatedPos
}

/**
 * Build update payload for a failed API response.
 * Increments errorCounter and sets isResponsive = false if threshold reached.
 */
export function getFailedPos(pos: Pos): UpdatePos {
  const newErrorCount = pos.errorCounter + 1
  const isResponsive = newErrorCount < ERROR_THRESHOLD

  return {
    id: pos.id,
    errorCounter: newErrorCount,
    isResponsive
  }
}
