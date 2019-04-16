import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import { Resource } from './resources.entity';

@Entity()
export class Booking {
  @PrimaryColumn()
  id: string;

  @Column({ length: 50 })
  name: string;

  @Column()
  creationDate: Date;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @ManyToOne(type => Resource, resource => resource.bookings)
  resource: Resource;
}
