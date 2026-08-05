import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { QueryPurchaseDto } from './dto/query-purchase.dto';
import { VoidPurchaseDto } from './dto/void-purchase.dto';
import { DocumentStatus, Prisma } from '@prisma/client';

@Injectable()
export class PurchasesService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateNextBillNumber(): Promise<string> {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const patternPrefix = `PUR-${dateStr}-`;

    const latest = await this.prisma.purchase.findFirst({
      where: {
        billNumber: {
          startsWith: patternPrefix,
        },
      },
      orderBy: { billNumber: 'desc' },
    });

    let sequence = 1;
    if (latest) {
      const parts = latest.billNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }

    const seqStr = sequence.toString().padStart(4, '0');
    return `PUR-${dateStr}-${seqStr}`;
  }

  async createPurchase(dto: CreatePurchaseDto, createdById: string) {
    // 1. Verify Supplier existence
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: dto.supplierId },
    });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID '${dto.supplierId}' not found.`);
    }

    // 2. Fetch products
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // 3. Compute item totals & subtotal/tax
    let subtotal = 0;
    let totalTaxAmount = 0;

    const preparedItems = dto.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new NotFoundException(
          `Product with ID '${item.productId}' not found.`,
        );
      }

      const rate = item.rate !== undefined ? item.rate : Number(product.rate);
      const taxPercentage =
        item.taxPercentage !== undefined
          ? item.taxPercentage
          : Number(product.taxPercentage);

      const lineSubtotal = item.quantity * rate;
      const lineTaxAmount = lineSubtotal * (taxPercentage / 100);
      const lineTotalAmount = lineSubtotal + lineTaxAmount;

      subtotal += lineSubtotal;
      totalTaxAmount += lineTaxAmount;

      return {
        productId: product.id,
        productName: product.name,
        unit: product.unit,
        quantity: item.quantity,
        rate,
        taxPercentage,
        taxAmount: lineTaxAmount,
        amount: lineTotalAmount,
      };
    });

    const totalAmount = subtotal + totalTaxAmount;
    const billNumber =
      dto.billNumber?.trim() || (await this.generateNextBillNumber());

    try {
      return await this.prisma.$transaction(async (tx) => {
        return tx.purchase.create({
          data: {
            supplierId: dto.supplierId,
            billNumber,
            purchaseDate: new Date(dto.purchaseDate),
            subtotal,
            taxAmount: totalTaxAmount,
            totalAmount,
            status: DocumentStatus.UNPAID,
            remarks: dto.remarks?.trim() || null,
            createdById,
            items: {
              create: preparedItems,
            },
          },
          include: {
            supplier: true,
            createdBy: {
              select: { id: true, name: true, username: true },
            },
            items: true,
          },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Bill number '${billNumber}' already exists for this supplier.`,
        );
      }
      throw error;
    }
  }

  async findAllPurchases(query: QueryPurchaseDto) {
    const where: Prisma.PurchaseWhereInput = {};

    if (query.supplierId) {
      where.supplierId = query.supplierId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { billNumber: { contains: search } },
        { supplier: { name: { contains: search } } },
      ];
    }

    if (query.fromDate || query.toDate) {
      where.purchaseDate = {};
      if (query.fromDate) {
        where.purchaseDate.gte = new Date(query.fromDate);
      }
      if (query.toDate) {
        where.purchaseDate.lte = new Date(query.toDate);
      }
    }

    return this.prisma.purchase.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        supplier: { select: { id: true, name: true, mobile: true } },
        createdBy: { select: { id: true, name: true } },
        items: true,
        paymentAllocations: true,
      },
    });
  }

  async findOnePurchase(id: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: true,
        createdBy: { select: { id: true, name: true, username: true } },
        items: true,
        paymentAllocations: {
          include: {
            payment: true,
          },
        },
      },
    });

    if (!purchase) {
      throw new NotFoundException(`Purchase bill with ID '${id}' not found.`);
    }

    return purchase;
  }

  async voidPurchase(id: string, dto: VoidPurchaseDto) {
    const purchase = await this.findOnePurchase(id);

    if (purchase.status === DocumentStatus.VOIDED) {
      throw new BadRequestException('Purchase bill is already voided.');
    }

    if (purchase.paymentAllocations.length > 0) {
      throw new BadRequestException(
        'Cannot void a purchase bill with existing payments. Void payments first.',
      );
    }

    return this.prisma.purchase.update({
      where: { id },
      data: {
        status: DocumentStatus.VOIDED,
        voidedAt: new Date(),
        voidedReason: dto.reason.trim(),
      },
    });
  }
}
