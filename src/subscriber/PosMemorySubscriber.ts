import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';

import { PosMemory } from '../entities';

@EventSubscriber()
export class PosMemorySubscriber implements EntitySubscriberInterface {
  listenTo(): typeof PosMemory {
    return PosMemory;
  }

  async afterInsert(event: InsertEvent<PosMemory>): Promise<void> {
    const pos = event.entity;
    console.log(`Pos updated: ${pos}`);
  }
}
