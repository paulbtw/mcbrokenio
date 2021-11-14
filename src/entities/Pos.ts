import { Column, Entity, PrimaryColumn } from 'typeorm';
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

  @Column({ nullable: true, type: 'boolean' })
    hasMilchshake: boolean | null;

  @Column({ nullable: true, type: 'boolean' })
    hasMcFlurry: boolean | null;

  @Column({ nullable: true, type: 'boolean' })
    hasMcSundae: boolean | null;

  @Column({ nullable: true })
    lastCheck: Date;

  @Column({ nullable: true, type: 'timestamp' })
    timeSinceBrokenMilchshake: Date | null;

  @Column({ nullable: true, type: 'timestamp' })
    timeSinceBrokenMcFlurry: Date | null;

  @Column({ nullable: true, type: 'timestamp' })
    timeSinceBrokenMcSundae: Date | null;

  @Column({ default: 'DE' })
    country: string;
}
