import { Injectable } from '@nestjs/common';
import * as nanoid from 'nanoid';
import { NewResourceInput } from './dto/new-resource.input';
import { ResourcesArgs } from './dto/resources.args';
import { Resource } from './models/resource';
import { Resource as ResourceEntity } from './resources.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(ResourceEntity)
    private readonly resourceRepository: Repository<ResourceEntity>,
  ) {}

  async create(data: NewResourceInput): Promise<Resource> {
    const resourceEntity = new ResourceEntity();
    resourceEntity.id = nanoid();
    resourceEntity.creationDate = new Date();
    resourceEntity.name = data.name;

    await this.resourceRepository.save(resourceEntity);

    return {
      id: resourceEntity.id,
      name: resourceEntity.name,
      creationDate: resourceEntity.creationDate,
    };
  }

  async findOneById(id: string): Promise<Resource> {
    const resourceEntity = await this.resourceRepository.findOne(id);

    if (!resourceEntity) {
      return null;
    }

    return {
      id: resourceEntity.id,
      name: resourceEntity.name,
      creationDate: resourceEntity.creationDate,
    };
  }

  async findAll(resourcesArgs: ResourcesArgs): Promise<Resource[]> {
    const resourceEntities = await this.resourceRepository.find();

    return resourceEntities.map(entity => ({
      id: entity.id,
      name: entity.name,
      creationDate: entity.creationDate,
    }));
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.resourceRepository.delete(id);

    return result.affected === 1;
  }
}
