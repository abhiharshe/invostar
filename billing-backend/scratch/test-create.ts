import 'dotenv/config';
import { PrismaService } from '../src/database/prisma.service';
import { ProductCategory } from '@prisma/client';

async function test() {
  const prisma = new PrismaService();
  await prisma.onModuleInit();

  try {
    const res = await prisma.product.create({
      data: {
        productTypeId: "cmsftmy2c00003whtm484i1fj",
        name: "Wireless Mouse Test",
        unit: "pcs",
        rate: 499,
        taxPercentage: 18,
        category: ProductCategory.PHYSICAL_GOODS,
        isBundle: false,
        isActive: true,
      },
    });
    console.log("SUCCESS:", res);
  } catch (err) {
    console.error("EXACT ERROR:", err);
  } finally {
    await prisma.onModuleDestroy();
  }
}

test();
