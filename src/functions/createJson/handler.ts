import { Logger } from '@sailplane/logger';
import { Handler } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import { PutObjectRequest } from 'aws-sdk/clients/s3';
import { createDatabaseConnection } from '../../utils';
import { createGeoJSON, getStatistics } from './utils';

const logger = new Logger('createJson');

export const main: Handler = async (_, context) => {
  logger.debug(`Starting the Lambda. ID: ${context.awsRequestId}`);

  logger.debug('Ensure Database Connection');
  const connection = await createDatabaseConnection();

  const geoJSON = await createGeoJSON();
  const stats = await getStatistics();

  const s3 = new S3({ region: 'us-east-2', apiVersion: '2012-10-17' });
  const paramsGeoJSON: PutObjectRequest = {
    Bucket: process.env.BUCKET as string,
    Key: 'marker.json',
    Body: JSON.stringify(geoJSON),
    ContentType: 'application/json',
  };
  await s3
    .putObject(paramsGeoJSON, (err, data) => {
      if (err) logger.errorObject('Error: ', err);
      else logger.debugObject('Put to s3 should have worked: ', data);
    })
    .promise();

  const paramsStats: PutObjectRequest = {
    Bucket: process.env.BUCKET as string,
    Key: 'stats.json',
    Body: JSON.stringify(stats),
    ContentType: 'application/json',
  };
  await s3
    .putObject(paramsStats, (err, data) => {
      if (err) logger.errorObject('Error: ', err);
      else logger.debugObject('Put to s3 should have worked: ', data);
    })
    .promise();

  if (connection.isConnected) {
    await connection.close();
  }
};
