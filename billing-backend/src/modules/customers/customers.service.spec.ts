import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CustomersService', () => {
  let service: CustomersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    customer: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCustomer', () => {
    it('should create customer successfully', async () => {
      const createdCustomer = {
        id: 'cust_1',
        name: 'John Doe',
        mobile: '9876543210',
        address: 'Main St',
        openingBalance: 100,
        isActive: true,
      };
      mockPrismaService.customer.create.mockResolvedValue(createdCustomer);

      const result = await service.createCustomer({
        name: 'John Doe',
        mobile: '9876543210',
        address: 'Main St',
        openingBalance: 100,
      });

      expect(result).toEqual(createdCustomer);
    });
  });

  describe('findOneCustomer', () => {
    it('should throw NotFoundException if customer not found', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);

      await expect(service.findOneCustomer('cust_invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
