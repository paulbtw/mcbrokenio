import { PutObjectCommand, type PutObjectRequest, S3Client } from '@aws-sdk/client-s3'
import { EXPORT_BUCKET } from '@libs/constants'
import { createGeoJson } from '@libs/services/createJson/generateGeoJson'
import { generateStats } from '@libs/services/createJson/generateStats'
import { createPrismaClient } from '@libs/utils/createPrismaClient'

export async function createJson() {
  const prisma = createPrismaClient()

  const allPos = await prisma.pos.findMany()

  const json = createGeoJson(allPos)
  const stats = await generateStats(prisma)

  const s3 = new S3Client({ region: 'eu-central-1', apiVersion: '2012-10-17' })

  const paramsGeoJson: PutObjectRequest = {
    Bucket: EXPORT_BUCKET,
    Key: 'marker.json',
    Body: JSON.stringify(json),
    ContentType: 'application/json',
    ACL: 'public-read'
  }

  const paramsStatsJson: PutObjectRequest = {
    Bucket: EXPORT_BUCKET,
    Key: 'stats.json',
    Body: JSON.stringify(stats, (_key, value) => {
      if (typeof value === 'bigint') {
        return Number(value)
      }

      return value
    }),
    ContentType: 'application/json',
    ACL: 'public-read'
  }

  await s3.send(new PutObjectCommand(paramsGeoJson))
  await s3.send(new PutObjectCommand(paramsStatsJson))

  await prisma.$disconnect()
}
