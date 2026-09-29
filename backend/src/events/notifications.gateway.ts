import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  sendProfileUpdatedNotification(payload: {
    employeeId: string;
    employeeName: string;
    employeeEmail: string;
    changedFields: string[];
    updatedAt: string;
  }) {
    this.logger.log(`Broadcasting profile_updated notification for ${payload.employeeEmail}`);
    this.server.emit('employee_profile_updated', payload);
  }
}
