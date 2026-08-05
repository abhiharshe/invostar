import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../../database/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentMode, PaymentType } from '@prisma/client';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    customer: {
      findUnique: jest.fn(),
    },
    supplier: {
      findUnique: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    paymentAllocation: {
      create: jest.fn(),
      aggregate: jest.fn(),
    },
    sale: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    purchase: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPayment', () => {
    it('should throw BadRequestException if customerId missing for CUSTOMER_RECEIPT', async () => {
      await expect(
        service.createPayment(
          {
            type: PaymentType.CUSTOMER_RECEIPT,
            amount: 500,
            paymentDate: '2026-08-03',
          },
          'user_1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if allocation sum exceeds payment amount', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue({ id: 'cust_1' });

      await expect(
        service.createPayment(
          {
            type: PaymentType.CUSTOMER_RECEIPT,
            customerId: 'cust_1',
            amount: 500,
            paymentDate: '2026-08-03',
            allocations: [{ saleId: 'sale_1', amount: 600 }],
          },
          'user_1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create payment and update sale status to PAID when fully paid', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue({ id: 'cust_1' });
      mockPrismaService.payment.create.mockResolvedValue({ id: 'pay_1' });
      mockPrismaService.paymentAllocation.create.mockResolvedValue({ id: 'alloc_1' });
      mockPrismaService.sale.findUnique.mockResolvedValue({
        id: 'sale_1',
        totalAmount: 500,
        status: 'UNPAID',
      });
      mockPrismaService.paymentAllocation.aggregate.mockResolvedValue({
        _sum: { amount: 500 },
      });
      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: 'pay_1',
        amount: 500,
        type: PaymentType.CUSTOMER_RECEIPT,
      });

      const result = await service.createPayment(
        {
          type: PaymentType.CUSTOMER_RECEIPT,
          customerId: 'cust_1',
          amount: 500,
          paymentDate: '2026-08-03',
          allocations: [{ saleId: 'sale_1', amount: 500 }],
        },
        'user_1',
      );

      expect(result).toBeDefined();
      expect(mockPrismaService.sale.update).toHaveBeenCalledWith({
        where: { id: 'sale_1' },
        data: { status: 'PAID' },
      });
    });
  });
});
