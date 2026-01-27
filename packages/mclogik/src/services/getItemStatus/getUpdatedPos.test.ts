import { type Pos } from '@mcbroken/db'
import { describe, expect, it } from 'vitest'

import { type GetItemStatus } from './getItemStatus/getItemStatusEu'
import { getFailedPos, getUpdatedPos } from './getUpdatedPos'

describe('getUpdatedPos', () => {
  const createMockPos = (overrides: Partial<Pos> = {}): Pos => ({
    id: 'store-123',
    nationalStoreNumber: '12345',
    name: 'Test Store',
    latitude: '40.7128',
    longitude: '-74.0060',
    country: 'US',
    hasMobileOrdering: true,
    errorCounter: 0,
    isResponsive: true,
    mcFlurryCount: 0,
    mcFlurryError: 0,
    mcFlurryStatus: 'UNKNOWN',
    mcSundaeCount: 0,
    mcSundaeError: 0,
    mcSundaeStatus: 'UNKNOWN',
    milkshakeCount: 0,
    milkshakeError: 0,
    milkshakeStatus: 'UNKNOWN',
    customItems: [],
    lastChecked: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  })

  const createMockItemStatus = (): GetItemStatus => ({
    milkshake: { count: 5, unavailable: 1, status: 'PARTIAL_AVAILABLE' },
    mcFlurry: { count: 3, unavailable: 0, status: 'AVAILABLE' },
    mcSundae: { count: 2, unavailable: 2, status: 'UNAVAILABLE' },
    custom: []
  })

  describe('getUpdatedPos', () => {
    it('should build update payload with item status data', () => {
      const pos = createMockPos()
      const itemStatus = createMockItemStatus()

      const result = getUpdatedPos(pos, itemStatus)

      expect(result.id).toBe('store-123')
      expect(result.milkshakeCount).toBe(5)
      expect(result.milkshakeError).toBe(1)
      expect(result.milkshakeStatus).toBe('PARTIAL_AVAILABLE')
      expect(result.mcFlurryCount).toBe(3)
      expect(result.mcFlurryError).toBe(0)
      expect(result.mcFlurryStatus).toBe('AVAILABLE')
      expect(result.mcSundaeCount).toBe(2)
      expect(result.mcSundaeError).toBe(2)
      expect(result.mcSundaeStatus).toBe('UNAVAILABLE')
    })

    it('should reset errorCounter to 0 on success', () => {
      const pos = createMockPos({ errorCounter: 5 })
      const itemStatus = createMockItemStatus()

      const result = getUpdatedPos(pos, itemStatus)

      expect(result.errorCounter).toBe(0)
    })

    it('should set isResponsive to true on success', () => {
      const pos = createMockPos({ isResponsive: false, errorCounter: 10 })
      const itemStatus = createMockItemStatus()

      const result = getUpdatedPos(pos, itemStatus)

      expect(result.isResponsive).toBe(true)
    })

    it('should map custom items correctly', () => {
      const pos = createMockPos()
      const itemStatus: GetItemStatus = {
        ...createMockItemStatus(),
        custom: [
          { name: 'CustomItem1', count: 10, unavailable: 2, status: 'PARTIAL_AVAILABLE' },
          { name: 'CustomItem2', count: 5, unavailable: 5, status: 'UNAVAILABLE' }
        ]
      }

      const result = getUpdatedPos(pos, itemStatus)

      expect(result.customItems).toHaveLength(2)
      expect(result.customItems).toEqual([
        { name: 'CustomItem1', count: 10, error: 2, status: 'PARTIAL_AVAILABLE' },
        { name: 'CustomItem2', count: 5, error: 5, status: 'UNAVAILABLE' }
      ])
    })
  })

  describe('getFailedPos', () => {
    it('should increment errorCounter on failure', () => {
      const pos = createMockPos({ errorCounter: 0 })

      const result = getFailedPos(pos)

      expect(result.errorCounter).toBe(1)
    })

    it('should keep isResponsive true when below threshold', () => {
      const pos = createMockPos({ errorCounter: 0 })

      const result = getFailedPos(pos)

      expect(result.isResponsive).toBe(true)
      expect(result.errorCounter).toBe(1)
    })

    it('should keep isResponsive true at errorCounter 1 (threshold is 3)', () => {
      const pos = createMockPos({ errorCounter: 1 })

      const result = getFailedPos(pos)

      expect(result.isResponsive).toBe(true)
      expect(result.errorCounter).toBe(2)
    })

    it('should set isResponsive false at exactly ERROR_THRESHOLD (3)', () => {
      const pos = createMockPos({ errorCounter: 2 })

      const result = getFailedPos(pos)

      expect(result.errorCounter).toBe(3)
      expect(result.isResponsive).toBe(false)
    })

    it('should keep isResponsive false when above threshold', () => {
      const pos = createMockPos({ errorCounter: 5 })

      const result = getFailedPos(pos)

      expect(result.errorCounter).toBe(6)
      expect(result.isResponsive).toBe(false)
    })

    it('should handle very high error counter values', () => {
      const pos = createMockPos({ errorCounter: 1000 })

      const result = getFailedPos(pos)

      expect(result.errorCounter).toBe(1001)
      expect(result.isResponsive).toBe(false)
    })

    it('should preserve the store id', () => {
      const pos = createMockPos({ id: 'my-unique-store-id' })

      const result = getFailedPos(pos)

      expect(result.id).toBe('my-unique-store-id')
    })

    it('should only include id, errorCounter, and isResponsive fields', () => {
      const pos = createMockPos()

      const result = getFailedPos(pos)

      expect(Object.keys(result)).toEqual(['id', 'errorCounter', 'isResponsive'])
    })
  })
})
