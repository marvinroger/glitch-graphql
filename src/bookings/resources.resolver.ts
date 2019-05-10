import {
  Args,
  Mutation,
  Query,
  Resolver,
  Subscription,
  Parent,
  ResolveProperty,
} from '@nestjs/graphql';
import { pubSub } from './pubsub';
import { NewResourceInput } from './dto/new-resource.input';
import { ResourcesArgs } from './dto/resources.args';
import { Resource } from './models/resource';
import { ResourcesService } from './resources.service';
import { BookingsService } from './bookings.service';

@Resolver(of => Resource)
export class ResourcesResolver {
  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly bookingsService: BookingsService,
  ) {}

  @Query(returns => Resource, { description: 'Get a single resource' })
  async resource(@Args('id') id: string): Promise<Resource> {
    const resource = await this.resourcesService.findOneById(id);
    if (!resource) {
      throw new Error(`The resource ${id} does not exist`);
    }

    return resource;
  }

  @Query(returns => [Resource], {
    description: 'Get multiple resources, based on optional filters',
  })
  allResources(@Args() resourcesArgs: ResourcesArgs): Promise<Resource[]> {
    return this.resourcesService.findAll(resourcesArgs);
  }

  @ResolveProperty('bookings')
  async bookings(@Parent() resource: Resource) {
    return this.bookingsService.getBookingsForResource(resource.id);
  }

  @Mutation(returns => Resource, { description: 'Create a new resource' })
  async createResource(
    @Args('data') data: NewResourceInput,
  ): Promise<Resource> {
    const resource = await this.resourcesService.create(data);
    pubSub.publish('resourceCreated', { resourceCreated: resource });
    return resource;
  }

  @Subscription(returns => Resource, { description: 'A resource was created' })
  resourceCreated() {
    return pubSub.asyncIterator('resourceCreated');
  }
}
