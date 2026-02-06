import { ObjectCannedACL, PutObjectCommand, type PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3'
import { prisma } from '@mcbroken/db'
import { Logger } from '@sailplane/logger'
import { gzipSync } from 'node:zlib'

import { EXPORT_BUCKET } from '../../constants'

import { createGeoJson } from './generateGeoJson'
import { generateStats } from './generateStats'

const s3 = new S3Client({ region: 'eu-central-1', apiVersion: '2012-10-17' })
const logger = new Logger('createJson')

let lastExportedAt: Date | null = null

function gzipJson(data: unknown, replacer?: (key: string, value: unknown) => unknown): Buffer {
  const json = JSON.stringify(data, replacer)
  return gzipSync(json)
}

export async function createJson() {

  try {
    // Check if any data has changed since last export
    const latestUpdate = await prisma.pos.findFirst({
      select: { updatedAt: true },
      orderBy: { updatedAt: 'desc' }
    })

    if (lastExportedAt != null && latestUpdate != null && latestUpdate.updatedAt <= lastExportedAt) {
      logger.info('No data changes since last export, skipping')
      return
    }

    const allPos = await prisma.pos.findMany()

    const json = createGeoJson(allPos)
    const stats = await generateStats(prisma)

    const bigIntReplacer = (_key: string, value: unknown) => {
      if (typeof value === 'bigint') {
        return Number(value)
      }
      return value
    }

    // Build per-country GeoJSON files
    const countriesMap = new Map<string, typeof json.features>()
    for (const feature of json.features) {
      const country = feature.properties.id.split('-')[0] ?? 'UNKNOWN'
      if (!countriesMap.has(country)) {
        countriesMap.set(country, [])
      }
      countriesMap.get(country)!.push(feature)
    }

    const uploads: Promise<unknown>[] = []

    // Global marker.json (gzipped)
    const globalParams: PutObjectCommandInput = {
      Bucket: EXPORT_BUCKET,
      Key: 'marker.json',
      Body: gzipJson(json),
      ContentType: 'application/json',
      ContentEncoding: 'gzip',
      ACL: ObjectCannedACL.public_read
    }
    uploads.push(s3.send(new PutObjectCommand(globalParams)))

    // Stats (gzipped)
    const statsParams: PutObjectCommandInput = {
      Bucket: EXPORT_BUCKET,
      Key: 'stats.json',
      Body: gzipJson(stats, bigIntReplacer),
      ContentType: 'application/json',
      ContentEncoding: 'gzip',
      ACL: ObjectCannedACL.public_read
    }
    uploads.push(s3.send(new PutObjectCommand(statsParams)))

    // Per-country marker files (gzipped)
    for (const [country, features] of countriesMap) {
      const countryGeoJson = {
        type: 'FeatureCollection' as const,
        features
      }
      const countryParams: PutObjectCommandInput = {
        Bucket: EXPORT_BUCKET,
        Key: `marker-${country}.json`,
        Body: gzipJson(countryGeoJson),
        ContentType: 'application/json',
        ContentEncoding: 'gzip',
        ACL: ObjectCannedACL.public_read
      }
      uploads.push(s3.send(new PutObjectCommand(countryParams)))
    }

    await Promise.all(uploads)

    lastExportedAt = new Date()
    logger.info(`Exported ${countriesMap.size} country files + global marker.json + stats.json`)
  } catch (error) {
    console.error('Error in createJson:', error)
    throw error
  }
}
