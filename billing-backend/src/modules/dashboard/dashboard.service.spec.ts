import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../../database/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: PrismaService;

  const mockPrismaService = {
    sale: {
      aggregate: jest.fn(),
      findMany: jest.fn(),
    },
    purchase: {
      aggregate: jest.fn(),
    },
    expense: {
      aggregate: jest.fn(),
    },
    customer: {
      aggregate: jest.fn(),
    },
    supplier: {
      aggregate: jest.fn(),
    },
    payment: {
      aggregate: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSummary', () => {
    it('should aggregate metrics correctly', async () => {
      mockPrismaService.sale.aggregate
        .mockResolvedValueOnce({ _sum: { totalAmount: 5000 } }) // todaySales
        .mockResolvedValueOnce({ _sum: { totalAmount: 20000 } }); // totalSales

      mockPrismaService.purchase.aggregate
        .mockResolvedValueOnce({ _sum: { totalAmount: 3000 } }) // todayPurchases
        .mockResolvedValueOnce({ _sum: { totalAmount: 10000 } }); // totalPurchases

      mockPrismaService.expense.aggregate.mockResolvedValueOnce({
        _sum: { amount: 500 },
      }); // todayExpenses

      mockPrismaService.customer.aggregate.mockResolvedValueOnce({
        _sum: { openingBalance: 1000 },
      });
      mockPrismaService.payment.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 8000 } }) // customer receipts
        .mockResolvedValueOnce({ _sum: { amount: 4000 } }); // supplier payments

      mockPrismaService.supplier.aggregate.mockResolvedValueOnce({
        _sum: { openingBalance: 500 },
      });

      mockPrismaService.sale.findMany.mockResolvedValue([]);

      const result = await service.getSummary();

      expect(result.todaySales).toEqual(5000);
      expect(result.todayPurchases).toEqual(3000);
      expect(result.todayExpenses).toEqual(500);
      expect(result.customerOutstanding).toEqual(13000); // 1000 + 20000 - 8000
      expect(result.supplierOutstanding).toEqual(6500); // 500 + 10000 - 4000
    });
  });
});
