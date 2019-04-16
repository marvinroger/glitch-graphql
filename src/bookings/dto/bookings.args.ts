import { ArgsType, Field } from 'type-graphql';

@ArgsType()
export class BookingsArgs {
  @Field({ description: 'Name to filter the bookings by', nullable: true })
  name?: string;
}
