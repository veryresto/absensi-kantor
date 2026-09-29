import { Injectable, NotFoundException, Inject, BadRequestException, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrimaryPrismaService } from '../prisma/primary-prisma.service';
import { NotificationsGateway } from '../events/notifications.gateway';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import * as bcrypt from 'bcrypt';
import * as path from 'path';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(
    private prisma: PrimaryPrismaService,
    private notificationsGateway: NotificationsGateway,
    @Inject('RABBITMQ_SERVICE') private rabbitClient: ClientProxy,
  ) {}

  async getProfile(userId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: userId },
    });
    if (!employee) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }
    const { password, ...result } = employee;
    return result;
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
    file?: Express.Multer.File,
  ) {
    const existingUser = await this.prisma.employee.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    const changedFields: string[] = [];
    const previousValues: Record<string, any> = {};
    const newValues: Record<string, any> = {};

    const updateData: any = {};

    // 1. Phone number update
    if (dto.phone && dto.phone !== existingUser.phone) {
      changedFields.push('phone');
      previousValues.phone = existingUser.phone;
      newValues.phone = dto.phone;
      updateData.phone = dto.phone;
    }

    // 2. Password update
    if (dto.password) {
      changedFields.push('password');
      previousValues.password = '[PROTECTED]';
      newValues.password = '[PROTECTED]';
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    // 3. Photo update
    // TODO: Setup Object Storage (AWS S3 / GCP Cloud Storage / Azure Blob) for storing employee profile photos in production environments.
    if (file) {
      const relativePhotoUrl = `/uploads/photos/${path.basename(file.path)}`;
      changedFields.push('photoUrl');
      previousValues.photoUrl = existingUser.photoUrl;
      newValues.photoUrl = relativePhotoUrl;
      updateData.photoUrl = relativePhotoUrl;
    }

    if (changedFields.length === 0) {
      const { password, ...rest } = existingUser;
      return rest;
    }

    const updatedUser = await this.prisma.employee.update({
      where: { id: userId },
      data: updateData,
    });

    const timestamp = new Date().toISOString();

    // Trigger Requirement 3.A.1: WebSocket Realtime Popup Notification for HR Admin
    this.notificationsGateway.sendProfileUpdatedNotification({
      employeeId: updatedUser.id,
      employeeName: updatedUser.name,
      employeeEmail: updatedUser.email,
      changedFields,
      updatedAt: timestamp,
    });

    // Trigger Requirement 3.A.2: Data stream / Message Queue for logging into separate database
    this.rabbitClient.emit('profile.updated', {
      employeeId: updatedUser.id,
      employeeEmail: updatedUser.email,
      changedFields: JSON.stringify(changedFields),
      previousValues: JSON.stringify(previousValues),
      newValues: JSON.stringify(newValues),
      timestamp,
    });

    const { password, ...result } = updatedUser;
    return result;
  }

  // Admin CRUD Methods
  async getAllEmployees() {
    const employees = await this.prisma.employee.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return employees.map(({ password, ...emp }) => emp);
  }

  async createEmployee(dto: CreateEmployeeDto, file?: Express.Multer.File) {
    const existing = await this.prisma.employee.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new BadRequestException('Email sudah terdaftar');
    }

    // TODO: Setup Object Storage (AWS S3 / GCP Cloud Storage) for photo upload in production
    const photoUrl = file ? `/uploads/photos/${path.basename(file.path)}` : null;
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const created = await this.prisma.employee.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        position: dto.position,
        phone: dto.phone,
        role: dto.role || 'EMPLOYEE',
        photoUrl,
      },
    });

    const { password, ...result } = created;
    return result;
  }

  async updateEmployee(id: string, dto: UpdateEmployeeDto, file?: Express.Multer.File) {
    const existing = await this.prisma.employee.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    const updateData: any = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.email) updateData.email = dto.email.toLowerCase();
    if (dto.position) updateData.position = dto.position;
    if (dto.phone) updateData.phone = dto.phone;
    if (dto.role) updateData.role = dto.role;
    if (dto.password) updateData.password = await bcrypt.hash(dto.password, 10);

    // TODO: Setup Object Storage (AWS S3 / GCP Cloud Storage) for photo upload in production
    if (file) {
      updateData.photoUrl = `/uploads/photos/${path.basename(file.path)}`;
    }

    const updated = await this.prisma.employee.update({
      where: { id },
      data: updateData,
    });

    const { password, ...result } = updated;
    return result;
  }
}
