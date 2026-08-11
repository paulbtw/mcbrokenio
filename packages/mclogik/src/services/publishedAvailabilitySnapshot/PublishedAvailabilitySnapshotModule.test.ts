import { ItemStatus, type Pos } from '@mcbroken/db'
import { describe, expect, it, vi } from 'vitest'

import {
  PUBLISHED_AVAILABILITY_SNAPSHOT_SCHEMA_VERSION,
  type PublishedAvailabilitySnapshotDependencies,
  PublishedAvailabilitySnapshotModule
} from './PublishedAvailabilitySnapshotModule'

function createStore(overrides: Partial<Pos> = {}): Pos {
  return {
    id: 'US-1',
    nationalStoreNumber: '1',
    name: 'Store',
    latitude: '40',
    longitude: '-70',
    country: 'US',
    hasMobileOrdering: true,
    isResponsive: true,
    errorCounter: 0,
    milkshakeCount: 1,
    milkshakeError: 0,
    milkshakeStatus: ItemStatus.AVAILABLE,
    mcFlurryCount: 1,
    mcFlurryError: 1,
    mcFlurryStatus: ItemStatus.PARTIAL_AVAILABLE,
    mcSundaeCount: 0,
    mcSundaeError: 0,
    mcSundaeStatus: ItemStatus.NOT_APPLICABLE,
    customItems: [],
    lastChecked: new Date('2026-08-01T00:00:00.000Z'),
    lastCatalogSeenAt: new Date('2026-08-01T00:00:00.000Z'),
    lastCatalogSeenCycle: '2026-07-26',
    missingCatalogCycles: 0,
    lastMissingCatalogCycle: null,
    closedAt: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-01T00:00:00.000Z'),
    ...overrides
  }
}

function createDependencies(stores: Pos[]) {
  const published = new Map<string, unknown>()
  const publicationOrder: string[] = []
  const dependencies: PublishedAvailabilitySnapshotDependencies = {
    loadStores: vi.fn().mockResolvedValue(stores),
    publishJson: vi.fn().mockImplementation(async (key, value) => {
      publicationOrder.push(key)
      published.set(key, value)
    }),
    currentDate: vi
      .fn()
      .mockReturnValue(new Date('2026-08-11T08:00:00.000Z')),
    now: vi.fn().mockReturnValueOnce(1_000).mockReturnValue(1_125)
  }

  return { dependencies, publicationOrder, published }
}

describe('PublishedAvailabilitySnapshotModule', () => {
  it('publishes one canonical snapshot from one Store Catalog view', async () => {
    const stores = [
      createStore(),
      createStore({
        id: 'US-2',
        nationalStoreNumber: '2',
        isResponsive: false,
        milkshakeStatus: ItemStatus.AVAILABLE,
        mcFlurryStatus: ItemStatus.AVAILABLE,
        mcSundaeStatus: ItemStatus.AVAILABLE
      }),
      createStore({
        id: 'CA-1',
        nationalStoreNumber: '1',
        country: 'CA',
        hasMobileOrdering: false,
        milkshakeStatus: ItemStatus.UNAVAILABLE,
        mcFlurryStatus: ItemStatus.UNKNOWN,
        mcSundaeStatus: ItemStatus.AVAILABLE
      })
    ]
    const { dependencies, published } = createDependencies(stores)
    const module = new PublishedAvailabilitySnapshotModule(dependencies)

    const result = await module.publish()

    expect(dependencies.loadStores).toHaveBeenCalledTimes(1)
    expect(dependencies.publishJson).toHaveBeenCalledTimes(3)
    expect(published.get('snapshot.json')).toEqual({
      schemaVersion: PUBLISHED_AVAILABILITY_SNAPSHOT_SCHEMA_VERSION,
      publishedAt: '2026-08-11T08:00:00.000Z',
      markers: expect.objectContaining({
        type: 'FeatureCollection',
        features: expect.arrayContaining([
          expect.objectContaining({
            properties: expect.objectContaining({ id: 'US-1' })
          }),
          expect.objectContaining({
            properties: expect.objectContaining({
              id: 'US-2',
              dot: 'GREY'
            })
          })
        ])
      }),
      statistics: expect.any(Array)
    })
    expect(published.get('marker.json')).toEqual(
      expect.objectContaining({
        type: 'FeatureCollection',
        features: expect.arrayContaining([
          expect.objectContaining({
            properties: expect.objectContaining({ id: 'US-1' })
          }),
          expect.objectContaining({
            properties: expect.objectContaining({
              id: 'US-2',
              dot: 'GREY'
            })
          })
        ])
      })
    )
    expect(published.get('stats.json')).toEqual([
      {
        total: 2,
        trackable: 1,
        availablemilkshakes: 1,
        totalmilkshakes: 1,
        availablemcflurry: 0,
        totalmcflurry: 1,
        availablemcsundae: 0,
        totalmcsundae: 0,
        country: 'US'
      },
      {
        total: 1,
        trackable: 0,
        availablemilkshakes: 0,
        totalmilkshakes: 1,
        availablemcflurry: 0,
        totalmcflurry: 0,
        availablemcsundae: 1,
        totalmcsundae: 1,
        country: 'CA'
      },
      {
        total: 3,
        trackable: 1,
        availablemilkshakes: 1,
        totalmilkshakes: 2,
        availablemcflurry: 0,
        totalmcflurry: 1,
        availablemcsundae: 1,
        totalmcsundae: 1,
        country: 'UNKNOWN'
      }
    ])
    expect(result).toEqual({
      storesPublished: 3,
      statisticsRowsPublished: 3,
      filesPublished: ['snapshot.json', 'marker.json', 'stats.json'],
      publishedAt: '2026-08-11T08:00:00.000Z',
      durationMs: 125
    })
  })

  it('publishes an empty marker set and aggregate row for an empty Store Catalog', async () => {
    const { dependencies, published } = createDependencies([])
    const module = new PublishedAvailabilitySnapshotModule(dependencies)

    const result = await module.publish()

    expect(published.get('marker.json')).toEqual({
      type: 'FeatureCollection',
      features: []
    })
    expect(published.get('stats.json')).toEqual([
      {
        total: 0,
        trackable: 0,
        availablemilkshakes: 0,
        totalmilkshakes: 0,
        availablemcflurry: 0,
        totalmcflurry: 0,
        availablemcsundae: 0,
        totalmcsundae: 0,
        country: 'UNKNOWN'
      }
    ])
    expect(result.storesPublished).toBe(0)
  })

  it('rejects Store Catalog read failures without publishing', async () => {
    const { dependencies } = createDependencies([])
    vi.mocked(dependencies.loadStores).mockRejectedValue(
      new Error('database unavailable')
    )
    const module = new PublishedAvailabilitySnapshotModule(dependencies)

    await expect(module.publish()).rejects.toThrow('database unavailable')
    expect(dependencies.publishJson).not.toHaveBeenCalled()
  })

  it('publishes the canonical snapshot before compatibility representations', async () => {
    const { dependencies, publicationOrder } = createDependencies([
      createStore()
    ])
    const module = new PublishedAvailabilitySnapshotModule(dependencies)

    await module.publish()

    expect(publicationOrder).toEqual([
      'snapshot.json',
      'marker.json',
      'stats.json'
    ])
  })

  it('does not attempt compatibility publication when the canonical snapshot fails', async () => {
    const { dependencies } = createDependencies([createStore()])
    vi.mocked(dependencies.publishJson).mockRejectedValueOnce(
      new Error('storage unavailable')
    )
    const module = new PublishedAvailabilitySnapshotModule(dependencies)

    await expect(module.publish()).rejects.toThrow('storage unavailable')
    expect(dependencies.publishJson).toHaveBeenCalledTimes(1)
    expect(dependencies.publishJson).toHaveBeenCalledWith(
      'snapshot.json',
      expect.any(Object)
    )
  })

  it('rejects if a compatibility representation cannot be published', async () => {
    const { dependencies } = createDependencies([createStore()])
    vi.mocked(dependencies.publishJson).mockImplementation(async (key) => {
      if (key === 'stats.json') {
        throw new Error('storage unavailable')
      }
    })
    const module = new PublishedAvailabilitySnapshotModule(dependencies)

    await expect(module.publish()).rejects.toThrow('storage unavailable')
    expect(dependencies.publishJson).toHaveBeenCalledWith(
      'snapshot.json',
      expect.any(Object)
    )
    expect(dependencies.publishJson).toHaveBeenCalledWith(
      'marker.json',
      expect.any(Object)
    )
    expect(dependencies.publishJson).toHaveBeenCalledWith(
      'stats.json',
      expect.any(Array)
    )
  })
})
