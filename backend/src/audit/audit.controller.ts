import { Controller, Get, UseGuards } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../../prisma/generated/primary-client';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  // Microservice RabbitMQ Listener
  @EventPattern('profile.updated')
  async handleProfileUpdated(@Payload() data: any) {
    await this.auditService.logProfileUpdate(data);
  }

  // REST Endpoint for HR Admin to view audit logs from secondary DB
  @Get('logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR_ADMIN)
  async getAuditLogs() {
    return this.auditService.getAuditLogs();
  }
}
