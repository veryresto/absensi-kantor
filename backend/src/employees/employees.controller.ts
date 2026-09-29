import {
  Controller,
  Get,
  Patch,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../../prisma/generated/primary-client';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

const storage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads/photos';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const imageFileFilter = (req: any, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
  if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WEBP, and GIF images are allowed'), false);
  }
};

@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  // Employee Profile Routes
  @Get('me')
  async getProfile(@Req() req: any) {
    return this.employeesService.getProfile(req.user.id);
  }

  @Patch('me')
  @UseInterceptors(FileInterceptor('photo', { storage, fileFilter: imageFileFilter, limits: { fileSize: 5 * 1024 * 1024 } }))
  async updateProfile(
    @Req() req: any,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.employeesService.updateProfile(req.user.id, dto, file);
  }

  // Admin Karyawan Management Routes
  @Get('admin/list')
  @UseGuards(RolesGuard)
  @Roles(Role.HR_ADMIN)
  async getAllEmployees() {
    return this.employeesService.getAllEmployees();
  }

  @Post('admin/create')
  @UseGuards(RolesGuard)
  @Roles(Role.HR_ADMIN)
  @UseInterceptors(FileInterceptor('photo', { storage, fileFilter: imageFileFilter, limits: { fileSize: 5 * 1024 * 1024 } }))
  async createEmployee(
    @Body() dto: CreateEmployeeDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.employeesService.createEmployee(dto, file);
  }

  @Put('admin/update/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.HR_ADMIN)
  @UseInterceptors(FileInterceptor('photo', { storage, fileFilter: imageFileFilter, limits: { fileSize: 5 * 1024 * 1024 } }))
  async updateEmployee(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.employeesService.updateEmployee(id, dto, file);
  }
}
