import { Test, TestingModule } from '@nestjs/testing';
import { SuppliersService } from './suppliers.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('SuppliersService', () => {
  let service: SuppliersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    supplier: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuppliersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SuppliersService>(SuppliersService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSupplier', () => {
    it('should create supplier successfully', async () => {
      const createdSupplier = {
        id: 'supp_1',
        name: 'ABC Wholesalers',
        mobile: '9123456789',
        address: 'Market Yard',
        openingBalance: 500,
        isActive: true,
      };
      mockPrismaService.supplier.create.mockResolvedValue(createdSupplier);

      const result = await service.createSupplier({
        name: 'ABC Wholesalers',
        mobile: '9123456789',
        address: 'Market Yard',
        openingBalance: 500,
      });

      expect(result).toEqual(createdSupplier);
    });
  });

  describe('findOneSupplier', () => {
    it('should throw NotFoundException if supplier not found', async () => {
      mockPrismaService.supplier.findUnique.mockResolvedValue(null);

      await expect(service.findOneSupplier('supp_invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
