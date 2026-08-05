import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async createExpense(dto: CreateExpenseDto, createdById: string) {
    return this.prisma.expense.create({
      data: {
        expenseDate: new Date(dto.expenseDate),
        category: dto.category.trim(),
        amount: dto.amount,
        remarks: dto.remarks?.trim() || null,
        createdById,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, username: true },
        },
      },
    });
  }

  async findAllExpenses(query: QueryExpenseDto) {
    const where: Prisma.ExpenseWhereInput = {};

    if (query.category) {
      where.category = { contains: query.category.trim() };
    }

    if (query.fromDate || query.toDate) {
      where.expenseDate = {};
      if (query.fromDate) {
        where.expenseDate.gte = new Date(query.fromDate);
      }
      if (query.toDate) {
        where.expenseDate.lte = new Date(query.toDate);
      }
    }

    return this.prisma.expense.findMany({
      where,
      orderBy: { expenseDate: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findOneExpense(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, username: true },
        },
      },
    });

    if (!expense) {
      throw new NotFoundException(`Expense record with ID '${id}' not found.`);
    }

    return expense;
  }

  async deleteExpense(id: string) {
    try {
      return await this.prisma.expense.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Expense record with ID '${id}' not found.`);
      }
      throw error;
    }
  }
}
