import { Test, TestingModule } from '@nestjs/testing';
import { PurchasesService } from './purchases.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { DocumentStatus } from '@prisma/client';

describe('PurchasesService', () => {
  let service: PurchasesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    supplier: {
      findUnique: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
    },
    purchase: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchasesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PurchasesService>(PurchasesService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPurchase', () => {
    it('should throw NotFoundException if supplier does not exist', async () => {
      mockPrismaService.supplier.findUnique.mockResolvedValue(null);

      await expect(
        service.createPurchase(
          {
            supplierId: 'supp_invalid',
            purchaseDate: '2026-08-03',
            items: [{ productId: 'prod_1', quantity: 5 }],
          },
          'user_1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create purchase bill successfully', async () => {
      mockPrismaService.supplier.findUnique.mockResolvedValue({ id: 'supp_1' });
      mockPrismaService.product.findMany.mockResolvedValue([
        { id: 'prod_1', name: 'Raw Material', unit: 'kg', rate: 50, taxPercentage: 5 },
      ]);
      mockPrismaService.purchase.findFirst.mockResolvedValue(null);

      const createdPurchase = {
        id: 'pur_1',
        billNumber: 'PUR-20260803-0001',
        subtotal: 250,
        taxAmount: 12.5,
        totalAmount: 262.5,
        status: DocumentStatus.UNPAID,
      };
      mockPrismaService.purchase.create.mockResolvedValue(createdPurchase);

      const result = await service.createPurchase(
        {
          supplierId: 'supp_1',
          purchaseDate: '2026-08-03',
          items: [{ productId: 'prod_1', quantity: 5 }],
        },
        'user_1',
      );

      expect(result).toEqual(createdPurchase);
    });
  });
});
