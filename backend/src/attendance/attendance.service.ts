import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrimaryPrismaService } from '../prisma/primary-prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrimaryPrismaService) {}

  private getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getFirstDayOfMonthDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  }

  async clockIn(userId: string) {
    const dateStr = this.getTodayDateString();
    const existing = await this.prisma.attendance.findFirst({
      where: { employeeId: userId, date: dateStr },
    });

    if (existing && existing.clockIn) {
      throw new BadRequestException('Anda sudah melakukan absen masuk hari ini');
    }

    const now = new Date();
    if (existing) {
      return this.prisma.attendance.update({
        where: { id: existing.id },
        data: {
          clockIn: now,
          status: 'MASUK',
        },
      });
    }

    return this.prisma.attendance.create({
      data: {
        employeeId: userId,
        date: dateStr,
        clockIn: now,
        status: 'MASUK',
      },
    });
  }

  async clockOut(userId: string) {
    const dateStr = this.getTodayDateString();
    const existing = await this.prisma.attendance.findFirst({
      where: { employeeId: userId, date: dateStr },
    });

    if (!existing || !existing.clockIn) {
      throw new BadRequestException('Anda belum melakukan absen masuk hari ini');
    }

    if (existing.clockOut) {
      throw new BadRequestException('Anda sudah melakukan absen pulang hari ini');
    }

    const now = new Date();
    return this.prisma.attendance.update({
      where: { id: existing.id },
      data: {
        clockOut: now,
        status: 'PULANG',
      },
    });
  }

  async getTodayStatus(userId: string) {
    const dateStr = this.getTodayDateString();
    const record = await this.prisma.attendance.findFirst({
      where: { employeeId: userId, date: dateStr },
    });
    return record || { employeeId: userId, date: dateStr, clockIn: null, clockOut: null, status: null };
  }

  async getSummary(userId: string, fromDate?: string, toDate?: string) {
    const start = fromDate || this.getFirstDayOfMonthDateString();
    const end = toDate || this.getTodayDateString();

    const records = await this.prisma.attendance.findMany({
      where: {
        employeeId: userId,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: 'desc' },
    });

    return {
      fromDate: start,
      toDate: end,
      records,
    };
  }

  async getAllAttendance(fromDate?: string, toDate?: string, employeeId?: string) {
    const where: any = {};
    if (fromDate || toDate) {
      where.date = {};
      if (fromDate) where.date.gte = fromDate;
      if (toDate) where.date.lte = toDate;
    }
    if (employeeId) {
      where.employeeId = employeeId;
    }

    return this.prisma.attendance.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true,
          },
        },
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });
  }
}
