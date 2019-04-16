import { Injectable, NotFoundException } from '@nestjs/common';
import * as nanoid from 'nanoid';
import { NewBookingInput } from './dto/new-booking.input';
import { BookingsArgs } from './dto/bookings.args';
import { Booking } from './models/booking';
import { Booking as BookingEntity } from './bookings.entity';
import { Resource as ResourceEntity } from './resources.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from './models/resource';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookingRepository: Repository<BookingEntity>,

    @InjectRepository(ResourceEntity)
    private readonly resourceRepository: Repository<ResourceEntity>,
  ) {}

  async create(data: NewBookingInput): Promise<Booking> {
    const resourceEntity = await this.resourceRepository.findOne(
      data.resourceId,
    );

    if (!resourceEntity) {
      throw new NotFoundException('This resource does not exist');
    }

    const bookingEntity = new BookingEntity();
    bookingEntity.id = nanoid();
    bookingEntity.creationDate = new Date();
    bookingEntity.name = data.name;
    bookingEntity.startDate = data.startDate;
    bookingEntity.endDate = data.endDate;
    bookingEntity.resource = resourceEntity;

    await this.bookingRepository.save(bookingEntity);

    return {
      id: bookingEntity.id,
      name: bookingEntity.name,
      creationDate: bookingEntity.creationDate,
      startDate: data.startDate,
      endDate: data.endDate,
    };
  }

  async findOneById(id: string): Promise<Booking> {
    const bookingEntity = await this.bookingRepository.findOne(id);

    if (!bookingEntity) {
      return null;
    }

    return {
      id: bookingEntity.id,
      name: bookingEntity.name,
      creationDate: bookingEntity.creationDate,
      startDate: bookingEntity.startDate,
      endDate: bookingEntity.endDate,
    };
  }

  async findAll(bookingsArgs: BookingsArgs): Promise<Booking[]> {
    const bookingEntities = await this.bookingRepository.find(bookingsArgs);

    return bookingEntities.map(entity => ({
      id: entity.id,
      name: entity.name,
      creationDate: entity.creationDate,
      startDate: entity.startDate,
      endDate: entity.endDate,
    }));
  }

  async getResourceForBooking(id: string): Promise<Resource> {
    const bookingEntity = await this.bookingRepository.findOne(id, {
      relations: ['resource'],
    });

    if (!bookingEntity) {
      return null;
    }

    return {
      id: bookingEntity.resource.id,
      name: bookingEntity.resource.name,
      creationDate: bookingEntity.resource.creationDate,
    };
  }

  async getBookingsForResource(id: string): Promise<Booking[]> {
    const bookingEntities = await this.bookingRepository.find({
      resource: { id },
    });

    return bookingEntities.map(entity => ({
      id: entity.id,
      name: entity.name,
      creationDate: entity.creationDate,
      startDate: entity.startDate,
      endDate: entity.endDate,
    }));
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.bookingRepository.delete(id);

    return result.affected === 1;
  }
}
