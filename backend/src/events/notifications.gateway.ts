import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrimaryPrismaService } from '../prisma/primary-prisma.service';
import { Role } from '../../prisma/generated/primary-client';

const corsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

@WebSocketGateway({
  cors: {
    origin: corsOrigins,
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrimaryPrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = this.getToken(client);
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.prisma.employee.findUnique({ where: { id: payload.sub } });
      if (!user || user.role !== Role.HR_ADMIN) {
        throw new UnauthorizedException();
      }
      client.data.user = { id: user.id, role: user.role, email: user.email };
    } catch {
      this.logger.warn(`Rejected unauthorized WebSocket client ${client.id}`);
      client.disconnect(true);
      return;
    }
    this.logger.log(`Client connected: ${client.id}`);
  }

  private getToken(client: Socket): string {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.length > 0) return authToken;

    const authorization = client.handshake.headers.authorization;
    if (authorization?.startsWith('Bearer ')) return authorization.slice(7);
    throw new UnauthorizedException();
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
