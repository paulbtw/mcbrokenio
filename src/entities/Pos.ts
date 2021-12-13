import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Availability, Locations } from '../types';
import { Base } from './Base';

@Entity()
export class Pos extends Base {
  @PrimaryColumn('integer')
  nationalStoreNumber: number;

  @Column()
  name: string;

  @Column()
  restaurantStatus: string;

  @Column()
  latitude: string;

  @Column()
  longitude: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: Availability,
    default: Availability.UNKNOWN,
  })
  hasMilchshake: Availability;

  @Column({
    nullable: false,
    type: 'enum',
    enum: Availability,
    default: Availability.UNKNOWN,
  })
  hasMcFlurry: Availability;

  @Column({
    nullable: false,
    type: 'enum',
    enum: Availability,
    default: Availability.UNKNOWN,
  })
  hasMcSundae: Availability;

  @Column({ nullable: true })
  lastCheck: Date;

  @Column({ nullable: true, type: 'timestamp' })
  timeSinceBrokenMilchshake: Date | null;

  @Column({ nullable: true, type: 'timestamp' })
  timeSinceBrokenMcFlurry: Date | null;

  @Column({ nullable: true, type: 'timestamp' })
  timeSinceBrokenMcSundae: Date | null;

  @Column({
    nullable: false,
    type: 'enum',
    enum: Locations,
    default: Locations.UNKNOWN,
  })
  country: Locations;

  @Column({ default: false })
  hasMobileOrdering: boolean;
}
