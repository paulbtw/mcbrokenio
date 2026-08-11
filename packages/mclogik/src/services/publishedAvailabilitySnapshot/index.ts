import { prisma } from '@mcbroken/db/client'

import { createS3StorageClient } from '../../clients/StorageClient'
import { EXPORT_BUCKET } from '../../constants'
import { createPosRepository } from '../../repositories'

import {
  type PublishAvailabilitySnapshotResult,
  PublishedAvailabilitySnapshotModule
} from './PublishedAvailabilitySnapshotModule'

const posRepository = createPosRepository(prisma)
let publishedAvailabilitySnapshotModule:
  | PublishedAvailabilitySnapshotModule
  | undefined

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

  publishedAvailabilitySnapshotModule = new PublishedAvailabilitySnapshotModule({
    loadStores: () => posRepository.findActive(),
    publishJson: (key, value) => storageClient.uploadJson(key, value),
    currentDate: () => new Date(),
    now: Date.now
  })

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
  PublishAvailabilitySnapshotResult,
  PublishedAvailabilityStatistics
} from './PublishedAvailabilitySnapshotModule'
export {
  PUBLISHED_AVAILABILITY_SNAPSHOT_SCHEMA_VERSION,
  type PublishedAvailabilitySnapshot
} from './PublishedAvailabilitySnapshotModule'
