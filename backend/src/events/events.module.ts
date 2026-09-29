import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
          queue: 'profile_updates_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  providers: [NotificationsGateway],
  exports: [NotificationsGateway, ClientsModule],
})
export class EventsModule {}
