import { Field, ID, ObjectType } from 'type-graphql';
import { Booking } from './booking';

@ObjectType({ description: 'Represent a booking instance' })
export class Resource {
  @Field(type => ID, { description: 'The ID of the resource' })
  id: string;

  @Field({ description: 'The name of the resource' })
  name: string;

  @Field({ description: 'The date the resource was created on' })
  creationDate: Date;

  @Field(type => [Booking], { description: 'The bookings for this resource' })
  bookings?: Booking[];
}
