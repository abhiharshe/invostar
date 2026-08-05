import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { CreateBundleItemDto } from './dto/bundle-item.dto';
import { ProductCategory, Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Product Types ---

  async createProductType(dto: CreateProductTypeDto) {
    try {
      return await this.prisma.productType.create({
        data: { name: dto.name.trim() },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(`Product type '${dto.name}' already exists.`);
      }
      throw error;
    }
  }

  async findAllProductTypes() {
    return this.prisma.productType.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async updateProductType(id: string, dto: UpdateProductTypeDto) {
    try {
      return await this.prisma.productType.update({
        where: { id },
        data: { name: dto.name?.trim() },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Product type with ID '${id}' not found.`);
        }
        if (error.code === 'P2002') {
          throw new ConflictException(`Product type '${dto.name}' already exists.`);
        }
      }
      throw error;
    }
  }

  async deleteProductType(id: string) {
    try {
      return await this.prisma.productType.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Product type with ID '${id}' not found.`);
        }
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'Cannot delete product type linked to existing products.',
          );
        }
      }
      throw error;
    }
  }

  // --- Products & Bundles ---

  private async validateBundleItems(
    bundleProductId: string | null,
    bundleItems: CreateBundleItemDto[],
  ) {
    const childProductIds = bundleItems.map((item) => item.productId);

    if (bundleProductId && childProductIds.includes(bundleProductId)) {
      throw new BadRequestException(
        'A Bundle & Package product cannot contain itself.',
      );
    }

    const childProducts = await this.prisma.product.findMany({
      where: { id: { in: childProductIds } },
    });

    if (childProducts.length !== childProductIds.length) {
      throw new NotFoundException(
        'One or more products specified in the bundle were not found.',
      );
    }

    const nestedBundle = childProducts.find((p) => p.isBundle);
    if (nestedBundle) {
      throw new BadRequestException(
        `Product '${nestedBundle.name}' is already a Bundle & Package. Bundles cannot contain other bundles.`,
      );
    }
  }

  async createProduct(dto: CreateProductDto) {
    const productType = await this.prisma.productType.findUnique({
      where: { id: dto.productTypeId },
    });
    if (!productType) {
      throw new NotFoundException(
        `Product type with ID '${dto.productTypeId}' not found.`,
      );
    }

    const isBundle = dto.isBundle ?? false;
    if (isBundle && dto.bundleItems && dto.bundleItems.length > 0) {
      await this.validateBundleItems(null, dto.bundleItems);
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            productTypeId: dto.productTypeId,
            name: dto.name.trim(),
            unit: dto.unit.trim(),
            rate: dto.rate,
            taxPercentage: dto.taxPercentage ?? 0,
            category: dto.category ?? ProductCategory.PHYSICAL_GOODS,
            isBundle,
            isActive: dto.isActive ?? true,
          },
        });

        if (isBundle && dto.bundleItems && dto.bundleItems.length > 0) {
          for (const item of dto.bundleItems) {
            await tx.bundleItem.create({
              data: {
                bundleProductId: product.id,
                productId: item.productId,
                quantity: item.quantity ?? 1,
                rate: item.rate !== undefined ? item.rate : null,
              },
            });
          }
        }

        return tx.product.findUnique({
          where: { id: product.id },
          include: {
            productType: true,
            bundleItems: {
              include: {
                product: true,
              },
            },
          },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Product '${dto.name}' already exists for this product type.`,
        );
      }
      throw error;
    }
  }

  async findAllProducts(query: QueryProductDto) {
    const where: Prisma.ProductWhereInput = {};

    if (query.search) {
      where.name = { contains: query.search.trim() };
    }

    if (query.productTypeId) {
      where.productTypeId = query.productTypeId;
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.isBundle !== undefined) {
      where.isBundle = query.isBundle;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    return this.prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        productType: true,
        bundleItems: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findOneProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        productType: true,
        bundleItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID '${id}' not found.`);
    }

    return product;
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const product = await this.findOneProduct(id);

    if (dto.productTypeId) {
      const productType = await this.prisma.productType.findUnique({
        where: { id: dto.productTypeId },
      });
      if (!productType) {
        throw new NotFoundException(
          `Product type with ID '${dto.productTypeId}' not found.`,
        );
      }
    }

    try {
      return await this.prisma.product.update({
        where: { id },
        data: {
          ...(dto.productTypeId && { productTypeId: dto.productTypeId }),
          ...(dto.name && { name: dto.name.trim() }),
          ...(dto.unit && { unit: dto.unit.trim() }),
          ...(dto.rate !== undefined && { rate: dto.rate }),
          ...(dto.taxPercentage !== undefined && { taxPercentage: dto.taxPercentage }),
          ...(dto.category && { category: dto.category }),
          ...(dto.isBundle !== undefined && { isBundle: dto.isBundle }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        },
        include: {
          productType: true,
          bundleItems: {
            include: {
              product: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Product with ID '${id}' not found.`);
        }
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Product name already exists for this product type.`,
          );
        }
      }
      throw error;
    }
  }

  async toggleProductActive(id: string) {
    const product = await this.findOneProduct(id);
    return this.prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
      include: {
        productType: true,
        bundleItems: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  // --- Bundle Items Management ---

  async addOrUpdateBundleItems(
    bundleProductId: string,
    items: CreateBundleItemDto[],
  ) {
    const bundleProduct = await this.findOneProduct(bundleProductId);

    if (!bundleProduct.isBundle) {
      throw new BadRequestException(
        `Product '${bundleProduct.name}' is not flagged as a Bundle & Package product.`,
      );
    }

    await this.validateBundleItems(bundleProductId, items);

    return this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.bundleItem.upsert({
          where: {
            bundleProductId_productId: {
              bundleProductId,
              productId: item.productId,
            },
          },
          update: {
            quantity: item.quantity ?? 1,
            rate: item.rate !== undefined ? item.rate : null,
          },
          create: {
            bundleProductId,
            productId: item.productId,
            quantity: item.quantity ?? 1,
            rate: item.rate !== undefined ? item.rate : null,
          },
        });
      }

      return tx.product.findUnique({
        where: { id: bundleProductId },
        include: {
          productType: true,
          bundleItems: {
            include: {
              product: true,
            },
          },
        },
      });
    });
  }

  async removeBundleItem(bundleProductId: string, productId: string) {
    const bundleProduct = await this.findOneProduct(bundleProductId);
    if (!bundleProduct.isBundle) {
      throw new BadRequestException(`Product is not a Bundle & Package.`);
    }

    try {
      await this.prisma.bundleItem.delete({
        where: {
          bundleProductId_productId: {
            bundleProductId,
            productId,
          },
        },
      });

      return this.findOneProduct(bundleProductId);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Item not found in bundle.`);
      }
      throw error;
    }
  }

  async calculateBundleRate(bundleProductId: string) {
    const bundleProduct = await this.findOneProduct(bundleProductId);

    if (!bundleProduct.isBundle) {
      throw new BadRequestException(
        `Product '${bundleProduct.name}' is not a Bundle & Package product.`,
      );
    }

    let calculatedRate = 0;
    const itemDetails = bundleProduct.bundleItems.map((item) => {
      const effectiveRate =
        item.rate !== null ? Number(item.rate) : Number(item.product.rate);
      const lineSubtotal = Number(item.quantity) * effectiveRate;
      calculatedRate += lineSubtotal;

      return {
        productId: item.productId,
        productName: item.product.name,
        quantity: Number(item.quantity),
        rate: effectiveRate,
        subtotal: lineSubtotal,
      };
    });

    return {
      bundleProductId,
      bundleProductName: bundleProduct.name,
      currentRate: Number(bundleProduct.rate),
      calculatedRate,
      items: itemDetails,
    };
  }
}
