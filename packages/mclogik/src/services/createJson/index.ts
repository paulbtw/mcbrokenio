import { ObjectCannedACL, PutObjectCommand, type PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3'
import { prisma } from '@mcbroken/db'

import { EXPORT_BUCKET } from '../../constants'

import { createGeoJson } from './generateGeoJson'
import { generateStats } from './generateStats'

const s3 = new S3Client({ region: 'eu-central-1', apiVersion: '2012-10-17' })

export async function createJson() {

  try {
    const allPos = await prisma.pos.findMany()

    const json = createGeoJson(allPos)
    const stats = await generateStats(prisma)

    const paramsGeoJson: PutObjectCommandInput = {
      Bucket: EXPORT_BUCKET,
      Key: 'marker.json',
      Body: JSON.stringify(json),
      ContentType: 'application/json',
      ACL: ObjectCannedACL.public_read
    }

    const paramsStatsJson: PutObjectCommandInput = {
      Bucket: EXPORT_BUCKET,
      Key: 'stats.json',
      Body: JSON.stringify(stats, (_key, value) => {
        if (typeof value === 'bigint') {
          return Number(value)
        }

        return value
      }),
      ContentType: 'application/json',
      ACL: ObjectCannedACL.public_read
    }

    await Promise.all([
      s3.send(new PutObjectCommand(paramsGeoJson)),
      s3.send(new PutObjectCommand(paramsStatsJson))
    ])
  } catch (error) {
    console.error('Error in createJson:', error)
    throw error
  }
}
