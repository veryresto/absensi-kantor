import { Injectable, Logger } from '@nestjs/common';
import { SecondaryPrismaService } from '../prisma/secondary-prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private secondaryPrisma: SecondaryPrismaService) {}

  async logProfileUpdate(data: {
    employeeId: string;
    employeeEmail: string;
    changedFields: string;
    previousValues: string;
    newValues: string;
    timestamp?: string;
  }) {
    this.logger.log(`Persisting audit log for employee ${data.employeeEmail} to secondary database`);
    return this.secondaryPrisma.profileAuditLog.create({
      data: {
        employeeId: data.employeeId,
        employeeEmail: data.employeeEmail,
        changedFields: data.changedFields,
        previousValues: data.previousValues,
        newValues: data.newValues,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      },
    });
  }

  async getAuditLogs() {
    return this.secondaryPrisma.profileAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
