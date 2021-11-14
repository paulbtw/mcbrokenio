import { BaseEntity, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class Base extends BaseEntity {
  @CreateDateColumn()
    createdAt: Date;

  @UpdateDateColumn()
    updatedAt: Date;
}
