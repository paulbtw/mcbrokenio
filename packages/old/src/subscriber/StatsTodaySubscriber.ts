import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { isToday } from 'date-fns';
import { Stats, StatsMemory } from '../entities';

@EventSubscriber()
export class StatsTodaySubscriber implements EntitySubscriberInterface {
  listenTo(): typeof StatsMemory {
    return StatsMemory;
  }

  async afterInsert(event: InsertEvent<StatsMemory>): Promise<void> {
    const { targetDate } = event.entity;

    if (isToday(targetDate)) {
      const newStats = Stats.create({
        ...event.entity,
      });

      await Stats.save(newStats);
    }
  }
}
