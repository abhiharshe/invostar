import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateSettingsBatchDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllSettings() {
    const settings = await this.prisma.setting.findMany();
    const settingsMap: Record<string, string> = {
      company_name: 'InvoStar Store',
      company_address: '',
      company_mobile: '',
      company_gstin: '',
      currency: 'INR',
      invoice_prefix: 'INV',
      language: 'en',
    };

    for (const item of settings) {
      settingsMap[item.key] = item.value;
    }

    return settingsMap;
  }

  async updateSettings(dto: UpdateSettingsBatchDto) {
    return this.prisma.$transaction(async (tx) => {
      const results: any[] = [];
      for (const item of dto.settings) {
        const key = item.key.trim();
        const value = item.value.trim();

        const updated = await tx.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
        results.push(updated);
      }
      return results;
    });
  }
}
