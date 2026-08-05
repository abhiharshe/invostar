import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesService } from './expenses.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    expense: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createExpense', () => {
    it('should create expense successfully', async () => {
      const createdExpense = {
        id: 'exp_1',
        category: 'Office Rent',
        amount: 15000,
        expenseDate: new Date('2026-08-01'),
        remarks: 'August Rent',
      };
      mockPrismaService.expense.create.mockResolvedValue(createdExpense);

      const result = await service.createExpense(
        {
          category: 'Office Rent',
          amount: 15000,
          expenseDate: '2026-08-01',
          remarks: 'August Rent',
        },
        'user_1',
      );

      expect(result).toEqual(createdExpense);
    });
  });

  describe('findOneExpense', () => {
    it('should throw NotFoundException if expense not found', async () => {
      mockPrismaService.expense.findUnique.mockResolvedValue(null);

      await expect(service.findOneExpense('exp_invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
