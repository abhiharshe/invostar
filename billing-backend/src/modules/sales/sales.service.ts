import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { QuerySaleDto } from './dto/query-sale.dto';
import { VoidSaleDto } from './dto/void-sale.dto';
import { DocumentStatus, Prisma } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateNextDocNumber(isQuotation: boolean): Promise<string> {
    const prefix = isQuotation ? 'QT' : 'INV';
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const patternPrefix = `${prefix}-${dateStr}-`;

    const latest = await this.prisma.sale.findFirst({
      where: {
        invoiceNumber: {
          startsWith: patternPrefix,
        },
      },
      orderBy: { invoiceNumber: 'desc' },
    });

    let sequence = 1;
    if (latest) {
      const parts = latest.invoiceNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }

    const seqStr = sequence.toString().padStart(4, '0');
    return `${prefix}-${dateStr}-${seqStr}`;
  }

  async createSale(dto: CreateSaleDto, createdById: string) {
    // 1. Verify Customer existence
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer) {
      throw new NotFoundException(`Customer with ID '${dto.customerId}' not found.`);
    }

    // 2. Fetch product details for all line items
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // 3. Validate items & compute line item totals
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
    const isQuotation = dto.isQuotation ?? false;
    const invoiceNumber = await this.generateNextDocNumber(isQuotation);
    const initialStatus = isQuotation ? DocumentStatus.QUOTATION : DocumentStatus.UNPAID;

    // 4. Save Sale & Items in a single transaction
    return this.prisma.$transaction(async (tx) => {
      return tx.sale.create({
        data: {
          customerId: dto.customerId,
          invoiceNumber,
          invoiceDate: new Date(dto.invoiceDate),
          subtotal,
          taxAmount: totalTaxAmount,
          totalAmount,
          status: initialStatus,
          isQuotation,
          remarks: dto.remarks?.trim() || null,
          createdById,
          items: {
            create: preparedItems,
          },
        },
        include: {
          customer: true,
          createdBy: {
            select: { id: true, name: true, username: true },
          },
          items: true,
        },
      });
    });
  }

  async findAllSales(query: QuerySaleDto) {
    const where: Prisma.SaleWhereInput = {};

    if (query.isQuotation !== undefined) {
      where.isQuotation = query.isQuotation;
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { invoiceNumber: { contains: search } },
        { customer: { name: { contains: search } } },
      ];
    }

    if (query.fromDate || query.toDate) {
      where.invoiceDate = {};
      if (query.fromDate) {
        where.invoiceDate.gte = new Date(query.fromDate);
      }
      if (query.toDate) {
        where.invoiceDate.lte = new Date(query.toDate);
      }
    }

    return this.prisma.sale.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, mobile: true } },
        createdBy: { select: { id: true, name: true } },
        items: true,
        paymentAllocations: true,
      },
    });
  }

  async findOneSale(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true, username: true } },
        items: true,
        quotation: { select: { id: true, invoiceNumber: true, createdAt: true } },
        convertedSales: { select: { id: true, invoiceNumber: true, createdAt: true } },
        paymentAllocations: {
          include: {
            payment: true,
          },
        },
      },
    });

    if (!sale) {
      throw new NotFoundException(`Invoice/Quotation with ID '${id}' not found.`);
    }

    return sale;
  }

  async convertQuotationToInvoice(quotationId: string, createdById: string) {
    const quotation = await this.findOneSale(quotationId);

    if (!quotation.isQuotation) {
      throw new BadRequestException('Document is already a sale invoice.');
    }

    if (quotation.status === DocumentStatus.CONVERTED) {
      throw new BadRequestException('Quotation has already been converted to an invoice.');
    }

    if (quotation.status === DocumentStatus.VOIDED) {
      throw new BadRequestException('Cannot convert a voided quotation.');
    }

    const invoiceNumber = await this.generateNextDocNumber(false);

    return this.prisma.$transaction(async (tx) => {
      // 1. Create sale invoice from quotation
      const newInvoice = await tx.sale.create({
        data: {
          customerId: quotation.customerId,
          invoiceNumber,
          invoiceDate: new Date(),
          subtotal: quotation.subtotal,
          taxAmount: quotation.taxAmount,
          totalAmount: quotation.totalAmount,
          status: DocumentStatus.UNPAID,
          isQuotation: false,
          quotationId: quotation.id,
          remarks: quotation.remarks
            ? `Converted from Quotation #${quotation.invoiceNumber}. ${quotation.remarks}`
            : `Converted from Quotation #${quotation.invoiceNumber}`,
          createdById,
          items: {
            create: quotation.items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              unit: item.unit,
              quantity: item.quantity,
              rate: item.rate,
              taxPercentage: item.taxPercentage,
              taxAmount: item.taxAmount,
              amount: item.amount,
            })),
          },
        },
        include: {
          customer: true,
          createdBy: { select: { id: true, name: true, username: true } },
          items: true,
        },
      });

      // 2. Mark original quotation as CONVERTED
      await tx.sale.update({
        where: { id: quotation.id },
        data: { status: DocumentStatus.CONVERTED },
      });

      return newInvoice;
    });
  }

  async voidSale(id: string, dto: VoidSaleDto) {
    const sale = await this.findOneSale(id);

    if (sale.status === DocumentStatus.VOIDED) {
      throw new BadRequestException('Document is already voided.');
    }

    if (sale.paymentAllocations.length > 0) {
      throw new BadRequestException(
        'Cannot void an invoice with existing payments. Void payments first.',
      );
    }

    return this.prisma.sale.update({
      where: { id },
      data: {
        status: DocumentStatus.VOIDED,
        voidedAt: new Date(),
        voidedReason: dto.reason.trim(),
      },
    });
  }
}
