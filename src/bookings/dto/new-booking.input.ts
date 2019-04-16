import { IsOptional, Length, MaxLength } from 'class-validator';
import { Field, InputType } from 'type-graphql';

@InputType({ description: 'Data for a new booking' })
export class NewBookingInput {
  @Field({ description: 'Name of the booking' })
  @MaxLength(50)
  name: string;

  @Field({ description: 'Resource ID the booking belongs to' })
  resourceId: string;

  @Field({ description: 'Start date of the booking' })
  startDate: Date;

  @Field({ description: 'End date of the booking' })
  endDate: Date;
}
