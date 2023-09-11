import { type GetItemStatus } from '@libs/services/getItemStatus/getItemStatus/getItemStatusEu'
import { type UpdatePos } from '@libs/types'
import { type Pos } from '@prisma/client'

export function getUpdatedPos(pos: Pos, itemStatus: GetItemStatus) {
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
    }))
  }

  return updatedPos
}
