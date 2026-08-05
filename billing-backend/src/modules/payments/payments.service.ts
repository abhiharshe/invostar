import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { VoidPaymentDto } from './dto/void-payment.dto';
import { DocumentStatus, PaymentMode, PaymentType, Prisma } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  private async recalculateSaleStatus(tx: Prisma.TransactionClient, saleId: string) {
    const sale = await tx.sale.findUnique({ where: { id: saleId } });
    if (!sale || sale.status === DocumentStatus.VOIDED || sale.isQuotation) {
      return;
    }

    const allocations = await tx.paymentAllocation.aggregate({
      where: {
        saleId,
        payment: {
          voidedAt: null,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const totalPaid = Number(allocations._sum.amount ?? 0);
    const saleTotal = Number(sale.totalAmount);

    let newStatus: DocumentStatus = DocumentStatus.UNPAID;
    if (totalPaid >= saleTotal) {
      newStatus = DocumentStatus.PAID;
    } else if (totalPaid > 0) {
      newStatus = DocumentStatus.PARTIALLY_PAID;
    }

    if (sale.status !== newStatus) {
      await tx.sale.update({
        where: { id: saleId },
        data: { status: newStatus },
      });
    }
  }

  private async recalculatePurchaseStatus(
    tx: Prisma.TransactionClient,
    purchaseId: string,
  ) {
    const purchase = await tx.purchase.findUnique({ where: { id: purchaseId } });
    if (!purchase || purchase.status === DocumentStatus.VOIDED) {
      return;
    }

    const allocations = await tx.paymentAllocation.aggregate({
      where: {
        purchaseId,
        payment: {
          voidedAt: null,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const totalPaid = Number(allocations._sum.amount ?? 0);
    const purchaseTotal = Number(purchase.totalAmount);

    let newStatus: DocumentStatus = DocumentStatus.UNPAID;
    if (totalPaid >= purchaseTotal) {
      newStatus = DocumentStatus.PAID;
    } else if (totalPaid > 0) {
      newStatus = DocumentStatus.PARTIALLY_PAID;
    }

    if (purchase.status !== newStatus) {
      await tx.purchase.update({
        where: { id: purchaseId },
        data: { status: newStatus },
      });
    }
  }

  async createPayment(dto: CreatePaymentDto, createdById: string) {
    // 1. Validation
    if (dto.type === PaymentType.CUSTOMER_RECEIPT && !dto.customerId) {
      throw new BadRequestException(
        'CustomerId is required for CUSTOMER_RECEIPT payments.',
      );
    }
    if (dto.type === PaymentType.SUPPLIER_PAYMENT && !dto.supplierId) {
      throw new BadRequestException(
        'SupplierId is required for SUPPLIER_PAYMENT payments.',
      );
    }

    if (dto.customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: dto.customerId },
      });
      if (!customer) {
        throw new NotFoundException(`Customer with ID '${dto.customerId}' not found.`);
      }
    }

    if (dto.supplierId) {
      const supplier = await this.prisma.supplier.findUnique({
        where: { id: dto.supplierId },
      });
      if (!supplier) {
        throw new NotFoundException(`Supplier with ID '${dto.supplierId}' not found.`);
      }
    }

    if (dto.allocations && dto.allocations.length > 0) {
      const allocatedSum = dto.allocations.reduce(
        (acc, curr) => acc + curr.amount,
        0,
      );
      if (allocatedSum > dto.amount) {
        throw new BadRequestException(
          `Allocated amount (${allocatedSum}) cannot exceed total payment amount (${dto.amount}).`,
        );
      }
    }

    // 2. Transaction execution
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          type: dto.type,
          customerId: dto.customerId || null,
          supplierId: dto.supplierId || null,
          amount: dto.amount,
          paymentDate: new Date(dto.paymentDate),
          paymentMode: dto.paymentMode ?? PaymentMode.CASH,
          referenceNo: dto.referenceNo?.trim() || null,
          remarks: dto.remarks?.trim() || null,
          createdById,
        },
      });

      const affectedSaleIds = new Set<string>();
      const affectedPurchaseIds = new Set<string>();

      if (dto.allocations && dto.allocations.length > 0) {
        for (const alloc of dto.allocations) {
          if (alloc.saleId) {
            affectedSaleIds.add(alloc.saleId);
          }
          if (alloc.purchaseId) {
            affectedPurchaseIds.add(alloc.purchaseId);
          }

          await tx.paymentAllocation.create({
            data: {
              paymentId: payment.id,
              saleId: alloc.saleId || null,
              purchaseId: alloc.purchaseId || null,
              amount: alloc.amount,
            },
          });
        }
      }

      // 3. Recalculate document statuses
      for (const saleId of affectedSaleIds) {
        await this.recalculateSaleStatus(tx, saleId);
      }
      for (const purchaseId of affectedPurchaseIds) {
        await this.recalculatePurchaseStatus(tx, purchaseId);
      }

      return tx.payment.findUnique({
        where: { id: payment.id },
        include: {
          customer: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true, username: true } },
          allocations: {
            include: {
              sale: { select: { id: true, invoiceNumber: true, totalAmount: true } },
              purchase: { select: { id: true, billNumber: true, totalAmount: true } },
            },
          },
        },
      });
    });
  }

  async findAllPayments(query: QueryPaymentDto) {
    const where: Prisma.PaymentWhereInput = {};

    if (query.type) {
      where.type = query.type;
    }
    if (query.customerId) {
      where.customerId = query.customerId;
    }
    if (query.supplierId) {
      where.supplierId = query.supplierId;
    }
    if (query.paymentMode) {
      where.paymentMode = query.paymentMode;
    }

    if (query.fromDate || query.toDate) {
      where.paymentDate = {};
      if (query.fromDate) {
        where.paymentDate.gte = new Date(query.fromDate);
      }
      if (query.toDate) {
        where.paymentDate.lte = new Date(query.toDate);
      }
    }

    return this.prisma.payment.findMany({
      where,
      orderBy: { paymentDate: 'desc' },
      include: {
        customer: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        allocations: {
          include: {
            sale: { select: { id: true, invoiceNumber: true } },
            purchase: { select: { id: true, billNumber: true } },
          },
        },
      },
    });
  }

  async findOnePayment(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        customer: true,
        supplier: true,
        createdBy: { select: { id: true, name: true, username: true } },
        allocations: {
          include: {
            sale: true,
            purchase: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment record with ID '${id}' not found.`);
    }

    return payment;
  }

  async voidPayment(id: string, dto: VoidPaymentDto) {
    const payment = await this.findOnePayment(id);

    if (payment.voidedAt) {
      throw new BadRequestException('Payment is already voided.');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Mark payment voided
      const voidedPayment = await tx.payment.update({
        where: { id },
        data: {
          voidedAt: new Date(),
          voidedReason: dto.reason.trim(),
        },
      });

      // 2. Extract affected documents and recalculate their status
      for (const alloc of payment.allocations) {
        if (alloc.saleId) {
          await this.recalculateSaleStatus(tx, alloc.saleId);
        }
        if (alloc.purchaseId) {
          await this.recalculatePurchaseStatus(tx, alloc.purchaseId);
        }
      }

      return voidedPayment;
    });
  }
}
