import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DocumentStatus, PaymentType } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 1. Today's Sales
    const todaySalesAgg = await this.prisma.sale.aggregate({
      where: {
        isQuotation: false,
        status: { not: DocumentStatus.VOIDED },
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      _sum: { totalAmount: true },
    });
    const todaySales = Number(todaySalesAgg._sum.totalAmount ?? 0);

    // 2. Today's Purchases
    const todayPurchasesAgg = await this.prisma.purchase.aggregate({
      where: {
        status: { not: DocumentStatus.VOIDED },
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      _sum: { totalAmount: true },
    });
    const todayPurchases = Number(todayPurchasesAgg._sum.totalAmount ?? 0);

    // 3. Today's Expenses
    const todayExpensesAgg = await this.prisma.expense.aggregate({
      where: {
        expenseDate: { gte: startOfDay, lte: endOfDay },
      },
      _sum: { amount: true },
    });
    const todayExpenses = Number(todayExpensesAgg._sum.amount ?? 0);

    // 4. Customer Outstanding calculation
    const totalCustomerOpeningBalanceAgg = await this.prisma.customer.aggregate({
      where: { isActive: true },
      _sum: { openingBalance: true },
    });
    const customerOpeningBalance = Number(
      totalCustomerOpeningBalanceAgg._sum.openingBalance ?? 0,
    );

    const activeSalesTotalAgg = await this.prisma.sale.aggregate({
      where: {
        isQuotation: false,
        status: { not: DocumentStatus.VOIDED },
      },
      _sum: { totalAmount: true },
    });
    const totalSalesAmount = Number(activeSalesTotalAgg._sum.totalAmount ?? 0);

    const totalReceiptsAgg = await this.prisma.payment.aggregate({
      where: {
        type: PaymentType.CUSTOMER_RECEIPT,
        voidedAt: null,
      },
      _sum: { amount: true },
    });
    const totalReceiptsAmount = Number(totalReceiptsAgg._sum.amount ?? 0);

    const customerOutstanding = Math.max(
      0,
      customerOpeningBalance + totalSalesAmount - totalReceiptsAmount,
    );

    // 5. Supplier Outstanding calculation
    const totalSupplierOpeningBalanceAgg = await this.prisma.supplier.aggregate({
      where: { isActive: true },
      _sum: { openingBalance: true },
    });
    const supplierOpeningBalance = Number(
      totalSupplierOpeningBalanceAgg._sum.openingBalance ?? 0,
    );

    const activePurchasesTotalAgg = await this.prisma.purchase.aggregate({
      where: {
        status: { not: DocumentStatus.VOIDED },
      },
      _sum: { totalAmount: true },
    });
    const totalPurchasesAmount = Number(activePurchasesTotalAgg._sum.totalAmount ?? 0);

    const totalSupplierPaymentsAgg = await this.prisma.payment.aggregate({
      where: {
        type: PaymentType.SUPPLIER_PAYMENT,
        voidedAt: null,
      },
      _sum: { amount: true },
    });
    const totalSupplierPaymentsAmount = Number(
      totalSupplierPaymentsAgg._sum.amount ?? 0,
    );

    const supplierOutstanding = Math.max(
      0,
      supplierOpeningBalance + totalPurchasesAmount - totalSupplierPaymentsAmount,
    );

    // 6. Recent Invoices (top 5)
    const recentInvoices = await this.prisma.sale.findMany({
      where: {
        isQuotation: false,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        customer: { select: { id: true, name: true } },
      },
    });

    return {
      todaySales,
      todayPurchases,
      todayExpenses,
      customerOutstanding,
      supplierOutstanding,
      recentInvoices,
    };
  }
}
