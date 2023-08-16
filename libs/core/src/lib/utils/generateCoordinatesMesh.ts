import { Logger } from '@sailplane/logger';
import { LocationLimits } from '../types';

const logger = new Logger('generateCoordinatesMesh');

export function generateCoordinatesMesh(
  { maxLatitude, maxLongitude, minLatitude, minLongitude }: LocationLimits,
  intervalKilometer = 75,
) {
  const coordinatesMesh = [];

  for (
    let lat = minLatitude;
    lat <= maxLatitude;
    lat += intervalKilometer / 111.32
  ) {
    for (
      let lon = minLongitude;
      lon <= maxLongitude;
      lon += intervalKilometer / (111.32 * Math.cos(lat * (Math.PI / 180)))
    ) {
      coordinatesMesh.push({ latitude: lat, longitude: lon });
    }
  }

  logger.info(`generated ${coordinatesMesh.length} coordinates`);
  return coordinatesMesh;
}
