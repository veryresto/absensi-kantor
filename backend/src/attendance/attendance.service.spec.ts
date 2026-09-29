import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { PrimaryPrismaService } from '../prisma/primary-prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let prisma: PrimaryPrismaService;

  const mockPrisma = {
    attendance: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: PrimaryPrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
    prisma = module.get<PrimaryPrismaService>(PrimaryPrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('clockIn', () => {
    it('should create a new clockIn record if employee has not clocked in today', async () => {
      mockPrisma.attendance.findFirst.mockResolvedValue(null);
      mockPrisma.attendance.create.mockResolvedValue({
        id: 'att-1',
        employeeId: 'emp-1',
        date: '2026-09-28',
        clockIn: new Date(),
        status: 'MASUK',
      });

      const res = await service.clockIn('emp-1');
      expect(res.status).toBe('MASUK');
      expect(mockPrisma.attendance.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if already clocked in today', async () => {
      mockPrisma.attendance.findFirst.mockResolvedValue({
        id: 'att-1',
        employeeId: 'emp-1',
        date: '2026-09-28',
        clockIn: new Date(),
      });

      await expect(service.clockIn('emp-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('clockOut', () => {
    it('should throw BadRequestException if employee has not clocked in today', async () => {
      mockPrisma.attendance.findFirst.mockResolvedValue(null);
      await expect(service.clockOut('emp-1')).rejects.toThrow(BadRequestException);
    });

    it('should update clockOut time if employee clocked in today', async () => {
      mockPrisma.attendance.findFirst.mockResolvedValue({
        id: 'att-1',
        employeeId: 'emp-1',
        date: '2026-09-28',
        clockIn: new Date(),
        clockOut: null,
      });

      mockPrisma.attendance.update.mockResolvedValue({
        id: 'att-1',
        employeeId: 'emp-1',
        date: '2026-09-28',
        clockIn: new Date(),
        clockOut: new Date(),
        status: 'PULANG',
      });

      const res = await service.clockOut('emp-1');
      expect(res.status).toBe('PULANG');
      expect(mockPrisma.attendance.update).toHaveBeenCalled();
    });
  });

  describe('getSummary', () => {
    it('should return records filtered by date range', async () => {
      mockPrisma.attendance.findMany.mockResolvedValue([
        { id: '1', date: '2026-09-28', status: 'PULANG' },
      ]);

      const res = await service.getSummary('emp-1', '2026-09-01', '2026-09-28');
      expect(res.records.length).toBe(1);
      expect(res.fromDate).toBe('2026-09-01');
      expect(res.toDate).toBe('2026-09-28');
    });
  });
});
