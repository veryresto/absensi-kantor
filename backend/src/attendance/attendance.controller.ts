import { Controller, Get, Post, Query, UseGuards, Req } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../../prisma/generated/primary-client';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('clock-in')
  async clockIn(@Req() req: any) {
    return this.attendanceService.clockIn(req.user.id);
  }

  @Post('clock-out')
  async clockOut(@Req() req: any) {
    return this.attendanceService.clockOut(req.user.id);
  }

  @Get('today')
  async getTodayStatus(@Req() req: any) {
    return this.attendanceService.getTodayStatus(req.user.id);
  }

  @Get('summary')
  async getSummary(
    @Req() req: any,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.attendanceService.getSummary(req.user.id, fromDate, toDate);
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(Role.HR_ADMIN)
  async getAllAttendance(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.attendanceService.getAllAttendance(fromDate, toDate, employeeId);
  }
}
