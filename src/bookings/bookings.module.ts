import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsResolver } from './bookings.resolver';
import { BookingsService } from './bookings.service';
import { Booking } from './bookings.entity';
import { Resource } from './resources.entity';
import { ResourcesResolver } from './resources.resolver';
import { ResourcesService } from './resources.service';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Resource])],
  providers: [
    BookingsResolver,
    BookingsService,
    ResourcesResolver,
    ResourcesService,
  ],
})
export class BookingsModule {}
