import { Pos, PosMemory } from './entities';
import { PosMemorySubscriber } from './subscriber';

const startDir = process.env.NODE_ENV === 'production' ? 'dist' : 'src';

export default {
  name: 'default',
  entities: [Pos, PosMemory],
  subscribers: [PosMemorySubscriber],
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  cli: {
    migrationsDir: `${startDir}/migrations/`,
    entitiesDir: `${startDir}/entities/`,
  },
};
