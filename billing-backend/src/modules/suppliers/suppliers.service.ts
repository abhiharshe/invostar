import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { QuerySupplierDto } from './dto/query-supplier.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  async createSupplier(dto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: {
        name: dto.name.trim(),
        mobile: dto.mobile?.trim() || null,
        billingAddress: dto.billingAddress ?? undefined,
        deliveryAddress: dto.deliveryAddress ?? undefined,
        address: dto.address?.trim() || null,
        openingBalance: dto.openingBalance ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAllSuppliers(query: QuerySupplierDto) {
    const where: Prisma.SupplierWhereInput = {};

    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { name: { contains: search } },
        { mobile: { contains: search } },
      ];
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    return this.prisma.supplier.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            purchases: true,
            payments: true,
          },
        },
      },
    });
  }

  async findOneSupplier(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        purchases: {
          orderBy: { purchaseDate: 'desc' },
          take: 10,
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
          take: 10,
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID '${id}' not found.`);
    }

    return supplier;
  }

  async updateSupplier(id: string, dto: UpdateSupplierDto) {
    try {
      return await this.prisma.supplier.update({
        where: { id },
        data: {
          ...(dto.name && { name: dto.name.trim() }),
          ...(dto.mobile !== undefined && { mobile: dto.mobile?.trim() || null }),
          ...(dto.billingAddress !== undefined && { billingAddress: dto.billingAddress }),
          ...(dto.deliveryAddress !== undefined && { deliveryAddress: dto.deliveryAddress }),
          ...(dto.address !== undefined && { address: dto.address?.trim() || null }),
          ...(dto.openingBalance !== undefined && { openingBalance: dto.openingBalance }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Supplier with ID '${id}' not found.`);
      }
      throw error;
    }
  }

  async toggleSupplierActive(id: string) {
    const supplier = await this.findOneSupplier(id);
    return this.prisma.supplier.update({
      where: { id },
      data: { isActive: !supplier.isActive },
    });
  }
}
