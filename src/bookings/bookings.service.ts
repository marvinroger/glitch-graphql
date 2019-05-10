import { Injectable } from '@nestjs/common';
import * as nanoid from 'nanoid';
import { NewBookingInput } from './dto/new-booking.input';
import { BookingsArgs } from './dto/bookings.args';
import { Booking } from './models/booking';
import { Booking as BookingEntity } from './bookings.entity';
import { Resource as ResourceEntity } from './resources.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, Raw } from 'typeorm';
import { Resource } from './models/resource';

const DATE_REGEX = /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$/;

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookingRepository: Repository<BookingEntity>,

    @InjectRepository(ResourceEntity)
    private readonly resourceRepository: Repository<ResourceEntity>,
  ) {}

  async create(data: NewBookingInput): Promise<Booking> {
    if (data.name === '') {
      throw new Error('The name cannot be empty');
    }

    // Workaround for scalar parsing issue
    if (!DATE_REGEX.test((data.startDate as unknown) as string)) {
      throw new Error('Start date is not ISO8601');
    }

    if (!DATE_REGEX.test((data.endDate as unknown) as string)) {
      throw new Error('End date is not ISO8601');
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    const resourceEntity = await this.resourceRepository.findOne(
      data.resourceId,
    );

    if (!resourceEntity) {
      throw new Error(`The resource ${data.resourceId} does not exist`);
    }

    if (startDate >= endDate) {
      throw new Error('The end date must be lower than the start date');
    }

    const now = new Date();

    if (startDate <= now) {
      throw new Error('The start date must be in the future');
    }

    // workaround for sqlite date comparisons in typeorm
    const formatDateForSqlite = date =>
      date
        .toISOString()
        .replace('T', ' ')
        .replace('Z', '');

    const conflictingBooking = await this.bookingRepository.findOne({
      resource: resourceEntity,
      startDate: Raw(alias => `${alias} < "${formatDateForSqlite(endDate)}"`),
      endDate: Raw(alias => `${alias} > "${formatDateForSqlite(startDate)}"`),
    });

    if (conflictingBooking) {
      throw new Error(
        `The ${conflictingBooking.name} booking (ID ${
          conflictingBooking.id
        }) is conflicting`,
      );
    }

    const bookingEntity = new BookingEntity();
    bookingEntity.id = nanoid();
    bookingEntity.creationDate = new Date();
    bookingEntity.name = data.name;
    bookingEntity.startDate = startDate;
    bookingEntity.endDate = endDate;
    bookingEntity.resource = resourceEntity;

    await this.bookingRepository.save(bookingEntity);

    return {
      id: bookingEntity.id,
      name: bookingEntity.name,
      creationDate: bookingEntity.creationDate,
      startDate: startDate,
      endDate: endDate,
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
}
