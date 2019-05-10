import {
  Args,
  Mutation,
  Query,
  Resolver,
  Subscription,
  ResolveProperty,
  Parent,
} from '@nestjs/graphql';
import { pubSub } from './pubsub';
import { NewBookingInput } from './dto/new-booking.input';
import { BookingsArgs } from './dto/bookings.args';
import { Booking } from './models/booking';
import { BookingsService } from './bookings.service';

@Resolver(of => Booking)
export class BookingsResolver {
  constructor(private readonly bookingsService: BookingsService) {}

  @Query(returns => Booking, { description: 'Get a single booking' })
  async booking(@Args('id') id: string): Promise<Booking> {
    const booking = await this.bookingsService.findOneById(id);
    if (!booking) {
      throw new Error(`The booking ${id} does not exist`);
    }

    return booking;
  }

  @Query(returns => [Booking], {
    description: 'Get multiple bookings, based on optional filters',
  })
  allBookings(@Args() bookingsArgs: BookingsArgs): Promise<Booking[]> {
    return this.bookingsService.findAll(bookingsArgs);
  }

  @ResolveProperty()
  async resource(@Parent() booking: Booking) {
    return this.bookingsService.getResourceForBooking(booking.id);
  }

  @Mutation(returns => Booking, { description: 'Create a new booking' })
  async createBooking(@Args('data') data: NewBookingInput): Promise<Booking> {
    const booking = await this.bookingsService.create(data);
    pubSub.publish('bookingCreated', { bookingCreated: booking });
    return booking;
  }

  @Subscription(returns => Booking, { description: 'A booking was created' })
  bookingCreated() {
    return pubSub.asyncIterator('bookingCreated');
  }
}
