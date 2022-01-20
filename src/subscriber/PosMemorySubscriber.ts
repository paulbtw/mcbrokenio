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
    const {
      nationalStoreNumber,
      name,
      restaurantStatus,
      latitude,
      longitude,
      hasMilchshake,
      hasMcFlurry,
      hasMcSundae,
      lastCheck,
      timeSinceBrokenMilchshake,
      timeSinceBrokenMcFlurry,
      timeSinceBrokenMcSundae,
      country,
      hasMobileOrdering,
    } = event.entity;

    const pos = Pos.create({
      nationalStoreNumber,
      name,
      restaurantStatus,
      latitude,
      longitude,
      hasMilchshake,
      hasMcFlurry,
      hasMcSundae,
      lastCheck,
      timeSinceBrokenMilchshake,
      timeSinceBrokenMcFlurry,
      timeSinceBrokenMcSundae,
      country,
      hasMobileOrdering,
    });

    await Pos.save(pos);
  }
}
