import { prisma } from '@mcbroken/db/client'

import { createS3StorageClient } from '../../clients/StorageClient'
import { EXPORT_BUCKET } from '../../constants'

import {
  type PublishAvailabilitySnapshotResult,
  PublishedAvailabilitySnapshotModule
} from './PublishedAvailabilitySnapshotModule'

let publishedAvailabilitySnapshotModule:
  PublishedAvailabilitySnapshotModule | undefined

function getPublishedAvailabilitySnapshotModule(): PublishedAvailabilitySnapshotModule {
  if (publishedAvailabilitySnapshotModule != null) {
    return publishedAvailabilitySnapshotModule
  }

  if (typeof EXPORT_BUCKET !== 'string' || EXPORT_BUCKET.length === 0) {
    throw new Error('Export bucket is missing')
  }

  const storageClient = createS3StorageClient({
    bucket: EXPORT_BUCKET,
    region: 'eu-central-1',
    publicRead: true
  })

  publishedAvailabilitySnapshotModule = new PublishedAvailabilitySnapshotModule(
    {
      loadStores: () =>
        prisma.pos.findMany({
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
        }),
      publishJson: (key, value) => storageClient.uploadJson(key, value),
      currentDate: () => new Date(),
      now: Date.now
    }
  )

  return publishedAvailabilitySnapshotModule
}

/**
 * Publishes coherent marker and statistics files from one Store Catalog view.
 *
 * @returns A summary of the published snapshot
 */
export async function publishAvailabilitySnapshot(): Promise<PublishAvailabilitySnapshotResult> {
  return getPublishedAvailabilitySnapshotModule().publish()
}

export type { CustomItemType, GeoJson, GeoJsonPos } from '../../types/geoJson'
export type {
  LegacyPublishedAvailabilityStatistics,
  PublishAvailabilitySnapshotResult,
  PublishedAvailabilityStatistics
} from './PublishedAvailabilitySnapshotModule'
export {
  convertLegacyPublishedAvailabilityStatistics,
  PUBLISHED_AVAILABILITY_SNAPSHOT_SCHEMA_VERSION,
  type PublishedAvailabilitySnapshot
} from './PublishedAvailabilitySnapshotModule'
