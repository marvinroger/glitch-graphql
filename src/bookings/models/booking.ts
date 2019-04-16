import { Field, ID, ObjectType } from 'type-graphql';
import { Resource } from './resource';

@ObjectType({
  description: 'Represent a booking instance',
})
export class Booking {
  @Field(type => ID, { description: 'The ID of the booking' })
  id: string;

  @Field({ description: 'The name of the booking' })
  name: string;

  @Field({ description: 'The date the booking was created on' })
  creationDate: Date;

  @Field({ description: 'Start date of the booking' })
  startDate: Date;

  @Field({ description: 'End date of the booking' })
  endDate: Date;

  @Field(type => Resource, {
    description: 'The resource the booking belongs to',
  })
  resource?: Resource;
}
