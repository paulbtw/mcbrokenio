import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { Locations } from '../types';
import { Base } from './Base';

@Entity()
@Index(['country', 'targetDate'])
export class StatsMemory extends Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: Locations,
    default: Locations.UNKNOWN,
  })
  @Index()
  country: Locations;

  @Column()
  totalMcd: number;

  @Column()
  trackableMcd: number;

  @Column()
  availableMilchshake: number;

  @Column()
  trackableMilchshake: number;

  @Column()
  availableMcFlurry: number;

  @Column()
  trackableMcFlurry: number;

  @Column()
  availableMcSundae: number;

  @Column()
  trackableMcSundae: number;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  @Index()
  targetDate: Date;
}
