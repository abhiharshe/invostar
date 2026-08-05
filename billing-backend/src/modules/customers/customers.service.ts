import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async createCustomer(dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        name: dto.name.trim(),
        mobile: dto.mobile?.trim() || null,
        address: dto.address?.trim() || null,
        openingBalance: dto.openingBalance ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAllCustomers(query: QueryCustomerDto) {
    const where: Prisma.CustomerWhereInput = {};

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

    return this.prisma.customer.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            sales: true,
            payments: true,
          },
        },
      },
    });
  }

  async findOneCustomer(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        sales: {
          orderBy: { invoiceDate: 'desc' },
          take: 10,
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
          take: 10,
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID '${id}' not found.`);
    }

    return customer;
  }

  async updateCustomer(id: string, dto: UpdateCustomerDto) {
    try {
      return await this.prisma.customer.update({
        where: { id },
        data: {
          ...(dto.name && { name: dto.name.trim() }),
          ...(dto.mobile !== undefined && { mobile: dto.mobile?.trim() || null }),
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
        throw new NotFoundException(`Customer with ID '${id}' not found.`);
      }
      throw error;
    }
  }

  async toggleCustomerActive(id: string) {
    const customer = await this.findOneCustomer(id);
    return this.prisma.customer.update({
      where: { id },
      data: { isActive: !customer.isActive },
    });
  }
}
