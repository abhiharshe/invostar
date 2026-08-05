import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from './sales.service';
import { PrismaService } from '../../database/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DocumentStatus } from '@prisma/client';

describe('SalesService', () => {
  let service: SalesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    customer: {
      findUnique: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
    },
    sale: {
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
        SalesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSale', () => {
    it('should throw NotFoundException if customer does not exist', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);

      await expect(
        service.createSale(
          {
            customerId: 'cust_invalid',
            invoiceDate: '2026-08-03',
            items: [{ productId: 'prod_1', quantity: 1 }],
          },
          'user_1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should calculate item taxes and totals correctly and create invoice', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue({ id: 'cust_1' });
      mockPrismaService.product.findMany.mockResolvedValue([
        { id: 'prod_1', name: 'Widget', unit: 'pcs', rate: 100, taxPercentage: 18 },
      ]);
      mockPrismaService.sale.findFirst.mockResolvedValue(null);

      const createdSale = {
        id: 'sale_1',
        invoiceNumber: 'INV-20260803-0001',
        subtotal: 200,
        taxAmount: 36,
        totalAmount: 236,
        status: DocumentStatus.UNPAID,
      };
      mockPrismaService.sale.create.mockResolvedValue(createdSale);

      const result = await service.createSale(
        {
          customerId: 'cust_1',
          invoiceDate: '2026-08-03',
          items: [{ productId: 'prod_1', quantity: 2 }],
        },
        'user_1',
      );

      expect(result).toEqual(createdSale);
    });
  });

  describe('convertQuotationToInvoice', () => {
    it('should throw BadRequestException if sale is not a quotation', async () => {
      mockPrismaService.sale.findUnique.mockResolvedValue({
        id: 'sale_1',
        isQuotation: false,
      });

      await expect(
        service.convertQuotationToInvoice('sale_1', 'user_1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should convert valid quotation to invoice', async () => {
      const quotation = {
        id: 'qt_1',
        isQuotation: true,
        invoiceNumber: 'QT-20260803-0001',
        status: DocumentStatus.QUOTATION,
        customerId: 'cust_1',
        subtotal: 100,
        taxAmount: 18,
        totalAmount: 118,
        remarks: 'Sample quotation',
        items: [
          {
            productId: 'prod_1',
            productName: 'Widget',
            unit: 'pcs',
            quantity: 1,
            rate: 100,
            taxPercentage: 18,
            taxAmount: 18,
            amount: 118,
          },
        ],
      };
      mockPrismaService.sale.findUnique.mockResolvedValue(quotation);
      mockPrismaService.sale.findFirst.mockResolvedValue(null);

      const newInvoice = {
        id: 'inv_1',
        invoiceNumber: 'INV-20260803-0001',
        status: DocumentStatus.UNPAID,
        isQuotation: false,
        quotationId: 'qt_1',
      };
      mockPrismaService.sale.create.mockResolvedValue(newInvoice);
      mockPrismaService.sale.update.mockResolvedValue({
        ...quotation,
        status: DocumentStatus.CONVERTED,
      });

      const result = await service.convertQuotationToInvoice('qt_1', 'user_1');

      expect(result).toEqual(newInvoice);
      expect(mockPrismaService.sale.update).toHaveBeenCalledWith({
        where: { id: 'qt_1' },
        data: { status: DocumentStatus.CONVERTED },
      });
    });
  });
});
