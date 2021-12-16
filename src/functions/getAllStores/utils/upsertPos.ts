import { Logger } from '@sailplane/logger';
import { Connection } from 'typeorm';
import { Pos } from '../../../entities';

const logger = new Logger('upsertPos');

const generateValueString = (posArray: Pos[]) => {
  const valuesString = posArray.map((pos) => {
    return `('${pos.nationalStoreNumber}', '${pos.name
      .replace(/["']/g, '')
      .trim()}', '${pos.restaurantStatus.replace(/["']/g, '').trim()}', '${
      pos.latitude
    }', '${pos.longitude}', '${pos.country}', ${
      pos.hasMobileOrdering
    }, current_timestamp)`;
  });

  return valuesString.join(',');
};

export const upsertPos = async (arr: Pos[], connection: Connection) => {
  const uniquePosArray = arr.filter(
    (obj, index, self) =>
      index ===
      self.findIndex((t) => t.nationalStoreNumber === obj.nationalStoreNumber),
  );

  const valuesString = generateValueString(uniquePosArray);

  // TODO need to escape values
  logger.debug(`Pos to save: ${uniquePosArray.length}`);
  await connection.query(
    `INSERT INTO pos ("nationalStoreNumber", name, "restaurantStatus", latitude, longitude, country, "hasMobileOrdering", "updatedAt") VALUES ${valuesString} ON CONFLICT ("nationalStoreNumber") DO UPDATE SET "updatedAt" = current_timestamp, "hasMobileOrdering" = EXCLUDED."hasMobileOrdering"`,
  );
  logger.debug('finished saving');
};
