import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BookingsModule } from './bookings/bookings.module';

@Module({
  imports: [
    BookingsModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './data.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
      tracing: true,
      debug: true,
      installSubscriptionHandlers: true,
    }),
  ],
})
export class AppModule {}
