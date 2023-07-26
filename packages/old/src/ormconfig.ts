import { Pos, PosMemory, Stats, StatsMemory } from './entities';
import { PosMemorySubscriber, StatsTodaySubscriber } from './subscriber';

const startDir = process.env.NODE_ENV === 'production' ? 'dist' : 'src';

export default {
  name: 'default',
  entities: [Pos, PosMemory, Stats, StatsMemory],
  subscribers: [PosMemorySubscriber, StatsTodaySubscriber],
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  cli: {
    migrationsDir: `${startDir}/migrations/`,
    entitiesDir: `${startDir}/entities/`,
  },
};
