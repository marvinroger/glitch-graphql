import { ArgsType, Field } from 'type-graphql';

@ArgsType()
export class ResourcesArgs {
  @Field({ description: 'Name to filter the resources by', nullable: true })
  name?: string;
}
