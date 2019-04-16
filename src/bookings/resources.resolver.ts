import { NotFoundException } from '@nestjs/common';
import {
  Args,
  Mutation,
  Query,
  Resolver,
  Subscription,
  Parent,
  ResolveProperty,
} from '@nestjs/graphql';
import { PubSub } from 'apollo-server-express';
import { NewResourceInput } from './dto/new-resource.input';
import { ResourcesArgs } from './dto/resources.args';
import { Resource } from './models/resource';
import { ResourcesService } from './resources.service';
import { BookingsService } from './bookings.service';

const pubSub = new PubSub();

@Resolver(of => Resource)
export class ResourcesResolver {
  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly bookingsService: BookingsService,
  ) {}

  @Query(returns => Resource, { description: 'Get a single resource' })
  async getResource(@Args('id') id: string): Promise<Resource> {
    const resource = await this.resourcesService.findOneById(id);
    if (!resource) {
      throw new NotFoundException('This resource does not exist');
    }

    return resource;
  }

  @Query(returns => [Resource], {
    description: 'Get multiple resources, based on optional filters',
  })
  getAllResources(@Args() resourcesArgs: ResourcesArgs): Promise<Resource[]> {
    return this.resourcesService.findAll(resourcesArgs);
  }

  @ResolveProperty('bookings')
  async bookings(@Parent() resource: Resource) {
    return this.bookingsService.getBookingsForResource(resource.id);
  }

  @Mutation(returns => Resource, { description: 'Create a new resource' })
  async createResource(
    @Args('newResourceData') newResourceData: NewResourceInput,
  ): Promise<Resource> {
    const resource = await this.resourcesService.create(newResourceData);
    pubSub.publish('resourceCreated', { resourceAdded: resource });
    return resource;
  }

  @Mutation(returns => Boolean, { description: 'Delete an existing resource' })
  async deleteResource(@Args('id') id: string) {
    return this.resourcesService.remove(id);
  }

  @Subscription(returns => Resource, { description: 'A resource was created' })
  resourceCreated() {
    return pubSub.asyncIterator('resourceCreated');
  }
}
