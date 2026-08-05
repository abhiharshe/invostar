import 'dotenv/config';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';

async function seedAdmin(): Promise<void> {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? 'Administrator';

  if (!username || !password) {
    throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD must be configured');
  }

  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters long');
  }

  const prisma = new PrismaService();
  await prisma.onModuleInit();

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.upsert({
      where: { username },
      update: { name, passwordHash, role: Role.ADMIN, isActive: true },
      create: { name, username, passwordHash, role: Role.ADMIN },
    });
    console.log(`Admin user '${username}' is ready.`);
  } finally {
    await prisma.onModuleDestroy();
  }
}

seedAdmin().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
