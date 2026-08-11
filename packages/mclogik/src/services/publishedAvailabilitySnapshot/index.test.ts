import { ItemStatus, type Pos } from '@mcbroken/db'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { publishAvailabilitySnapshot } from './index'

const mocks = vi.hoisted(() => {
  const findMany = vi.fn()
  const uploadJson = vi.fn()

  return {
    findMany,
    uploadJson,
    createS3StorageClient: vi.fn(() => ({ uploadJson }))
  }
})

vi.mock('@mcbroken/db/client', () => ({
  prisma: { pos: { findMany: mocks.findMany } }
}))

vi.mock('../../constants', () => ({ EXPORT_BUCKET: 'test-bucket' }))

vi.mock('../../clients/StorageClient', () => ({
  createS3StorageClient: mocks.createS3StorageClient
}))

function createStore(): Pos {
  return {
    id: 'US-1',
    nationalStoreNumber: '1',
    name: 'Store',
    latitude: '1',
    longitude: '2',
    country: 'US',
    hasMobileOrdering: true,
    isResponsive: true,
    errorCounter: 0,
    milkshakeCount: 1,
    milkshakeError: 0,
    milkshakeStatus: ItemStatus.AVAILABLE,
    mcFlurryCount: 1,
    mcFlurryError: 0,
    mcFlurryStatus: ItemStatus.AVAILABLE,
    mcSundaeCount: 1,
    mcSundaeError: 0,
    mcSundaeStatus: ItemStatus.AVAILABLE,
    customItems: [],
    lastChecked: null,
    lastCatalogSeenAt: new Date('2026-01-01T00:00:00.000Z'),
    lastCatalogSeenCycle: null,
    missingCatalogCycles: 0,
    lastMissingCatalogCycle: null,
    closedAt: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z')
  }
}

describe('publishAvailabilitySnapshot', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.findMany.mockResolvedValue([createStore()])
    mocks.uploadJson.mockResolvedValue(undefined)
  })

  it('composes one Store Catalog read with the production storage adapter', async () => {
    const result = await publishAvailabilitySnapshot()

    expect(mocks.findMany).toHaveBeenCalledWith({
      where: { closedAt: null },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        country: true,
        milkshakeStatus: true,
        milkshakeCount: true,
        milkshakeError: true,
        mcFlurryStatus: true,
        mcFlurryCount: true,
        mcFlurryError: true,
        mcSundaeStatus: true,
        mcSundaeCount: true,
        mcSundaeError: true,
        lastChecked: true,
        customItems: true,
        hasMobileOrdering: true,
        isResponsive: true
      }
    })
    expect(mocks.uploadJson).toHaveBeenNthCalledWith(
      1,
      'snapshot.json',
      expect.objectContaining({
        schemaVersion: 1,
        publishedAt: expect.any(String),
        markers: expect.objectContaining({ type: 'FeatureCollection' }),
        statistics: expect.any(Array)
      })
    )
    expect(mocks.uploadJson).toHaveBeenCalledWith(
      'marker.json',
      expect.objectContaining({ type: 'FeatureCollection' })
    )
    expect(mocks.uploadJson).toHaveBeenCalledWith(
      'stats.json',
      expect.arrayContaining([
        expect.objectContaining({
          country: 'UNKNOWN',
          availablemilkshakes: 1
        })
      ])
    )
    expect(result).toMatchObject({
      storesPublished: 1,
      statisticsRowsPublished: 2,
      filesPublished: ['snapshot.json', 'marker.json', 'stats.json'],
      schemaVersion: 1,
      publishedAt: expect.any(String)
    })
  })

  it('propagates storage failures for Lambda retry', async () => {
    mocks.uploadJson.mockRejectedValue(new Error('S3 unavailable'))

    await expect(publishAvailabilitySnapshot()).rejects.toThrow(
      'S3 unavailable'
    )
  })
})
