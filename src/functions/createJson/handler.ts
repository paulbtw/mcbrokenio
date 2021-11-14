import { Logger } from '@sailplane/logger';
import { Handler } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import { PutObjectRequest } from 'aws-sdk/clients/s3';
import { Pos } from '../../entities';
import { createDatabaseConnection } from '../../utils';

const logger = new Logger('createJson');

export const main: Handler = async (_, context) => {
  logger.debug(`Starting the Lambda. ID: ${context.awsRequestId}`);

  logger.debug('Ensure Database Connection');
  await createDatabaseConnection();

  const allObject = await Pos.find();

  const json = allObject.map((pos) => {
    let dot = 'GREEN';
    if (!pos.hasMilchshake || !pos.hasMcFlurry || !pos.hasMcSundae) {
      if (!pos.hasMilchshake && !pos.hasMcFlurry && !pos.hasMcSundae) {
        dot = 'RED';
      } else {
        dot = 'YELLOW';
      }
    }
    return {
      geometry: {
        coordinates: [`${pos.latitude}`, `${pos.longitude}`, 0],
        type: 'Point',
      },
      properties: {
        hasMilchshake: pos.hasMilchshake,
        hasMcSundae: pos.hasMcSundae,
        hasMcFlurry: pos.hasMcFlurry,
        lastChecked: pos.lastCheck,
        name: pos.name,
        dot,
        open: pos.restaurantStatus,
      },
      type: 'Feature',
    };
  });
  logger.debugObject('JSON: ', json[0]);

  const finalJson = {
    type: 'FeatureCollection',
    features: json,
    crs: {
      type: 'name',
      properties: {},
    },
  };

  const s3 = new S3({ region: 'eu-central-1', apiVersion: '2012-10-17' });
  const params: PutObjectRequest = {
    Bucket: process.env.BUCKET as string,
    Key: 'marker.json',
    Body: JSON.stringify(finalJson),
    ContentType: 'application/json',
  };
  await s3
    .putObject(params, (err, data) => {
      logger.debug('CALLBACK');
      if (err) logger.errorObject('Error: ', err);
      else logger.debugObject('Put to s3 should have worked: ', data);
    })
    .promise();
};
