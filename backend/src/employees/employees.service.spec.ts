import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesService } from './employees.service';
import { PrimaryPrismaService } from '../prisma/primary-prisma.service';
import { NotificationsGateway } from '../events/notifications.gateway';

describe('EmployeesService', () => {
  let service: EmployeesService;

  const mockPrisma = {
    employee: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockGateway = {
    sendProfileUpdatedNotification: jest.fn(),
  };

  const mockRabbitClient = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: PrimaryPrismaService, useValue: mockPrisma },
        { provide: NotificationsGateway, useValue: mockGateway },
        { provide: 'RABBITMQ_SERVICE', useValue: mockRabbitClient },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateProfile', () => {
    it('should update phone and trigger websocket alert + rabbitmq event', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({
        id: 'emp-1',
        name: 'Budi',
        email: 'budi@veryresto.com',
        phone: '0811111111',
        password: 'hashedpassword',
        photoUrl: null,
      });

      mockPrisma.employee.update.mockResolvedValue({
        id: 'emp-1',
        name: 'Budi',
        email: 'budi@veryresto.com',
        phone: '0899999999',
        password: 'hashedpassword',
        photoUrl: null,
      });

      const res = await service.updateProfile('emp-1', { phone: '0899999999' });
      expect(res.phone).toBe('0899999999');

      // Verify WebSocket event triggered for HR Admin alert
      expect(mockGateway.sendProfileUpdatedNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          employeeId: 'emp-1',
          employeeEmail: 'budi@veryresto.com',
          changedFields: ['phone'],
        }),
      );

      // Verify RabbitMQ event emitted for Audit Microservice logging
      expect(mockRabbitClient.emit).toHaveBeenCalledWith(
        'profile.updated',
        expect.objectContaining({
          employeeId: 'emp-1',
          employeeEmail: 'budi@veryresto.com',
        }),
      );
    });
  });
});
