import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { Pos, PosMemory } from '../entities';

@EventSubscriber()
export class PosMemorySubscriber implements EntitySubscriberInterface {
  listenTo(): typeof PosMemory {
    return PosMemory;
  }

  async afterInsert(event: InsertEvent<PosMemory>): Promise<void> {
    const pos = Pos.create({
      ...event.entity,
    });

    await Pos.save(pos);
  }
}
