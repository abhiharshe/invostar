import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../../database/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductCategory } from '@prisma/client';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    productType: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    bundleItem: {
      create: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProduct', () => {
    it('should create a service product with category', async () => {
      mockPrismaService.productType.findUnique.mockResolvedValue({ id: 'pt_1' });
      const expectedProduct = {
        id: 'prod_service',
        productTypeId: 'pt_1',
        name: 'AC Maintenance',
        unit: 'hrs',
        rate: 1500,
        taxPercentage: 18,
        category: ProductCategory.SERVICES,
        isBundle: false,
        isActive: true,
      };
      mockPrismaService.product.create.mockResolvedValue({ id: 'prod_service' });
      mockPrismaService.product.findUnique.mockResolvedValue(expectedProduct);

      const result = await service.createProduct({
        productTypeId: 'pt_1',
        name: 'AC Maintenance',
        unit: 'hrs',
        rate: 1500,
        category: ProductCategory.SERVICES,
      });

      expect(result).toEqual(expectedProduct);
    });

    it('should reject bundle product creation if child item is a bundle', async () => {
      mockPrismaService.productType.findUnique.mockResolvedValue({ id: 'pt_1' });
      mockPrismaService.product.findMany.mockResolvedValue([
        { id: 'prod_child_bundle', name: 'Combo Pack', isBundle: true },
      ]);

      await expect(
        service.createProduct({
          productTypeId: 'pt_1',
          name: 'Super Pack',
          unit: 'set',
          rate: 2000,
          isBundle: true,
          bundleItems: [{ productId: 'prod_child_bundle', quantity: 1 }],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('calculateBundleRate', () => {
    it('should sum up child product rates accurately', async () => {
      const bundleProduct = {
        id: 'prod_bundle',
        name: 'Office Starter Kit',
        isBundle: true,
        rate: 1200,
        bundleItems: [
          {
            productId: 'p1',
            quantity: 2,
            rate: null,
            product: { name: 'Mouse', rate: 400 },
          },
          {
            productId: 'p2',
            quantity: 1,
            rate: 300,
            product: { name: 'Keyboard', rate: 500 },
          },
        ],
      };
      mockPrismaService.product.findUnique.mockResolvedValue(bundleProduct);

      const calculation = await service.calculateBundleRate('prod_bundle');

      expect(calculation.calculatedRate).toEqual(1100); // (2 * 400) + (1 * 300) = 1100
      expect(calculation.currentRate).toEqual(1200);
    });
  });
});
