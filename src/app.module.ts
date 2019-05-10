import {
  Module,
  MiddlewareConsumer,
  RequestMethod,
  NestModule,
} from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import graphqlPlayground from 'graphql-playground-middleware-express';

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
      playground: false,
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        graphqlPlayground({
          endpoint: '/graphql',
          subscriptionEndpoint: '/graphql',
        }),
      )
      .forRoutes({ path: '/graphql', method: RequestMethod.GET });
  }
}
