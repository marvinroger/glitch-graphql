import { IsOptional, Length, MaxLength } from 'class-validator';
import { Field, InputType } from 'type-graphql';

@InputType({ description: 'Data for a new resource' })
export class NewResourceInput {
  @Field({ description: 'The name of the resource to create' })
  @MaxLength(50)
  name: string;
}
