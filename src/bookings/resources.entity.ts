import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Booking } from './bookings.entity';

@Entity()
export class Resource {
  @PrimaryColumn()
  id: string;

  @Column({ length: 50 })
  name: string;

  @Column()
  creationDate: Date;

  @OneToMany(type => Booking, booking => booking.resource)
  bookings: Booking[];
}
