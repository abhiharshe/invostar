import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SettingsService } from './settings.service';
import { UpdateSettingsBatchDto } from './dto/update-setting.dto';

@ApiTags('settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all company and application settings' })
  getAllSettings() {
    return this.settingsService.getAllSettings();
  }

  @Patch()
  @ApiOperation({ summary: 'Update batch settings' })
  updateSettings(@Body() dto: UpdateSettingsBatchDto) {
    return this.settingsService.updateSettings(dto);
  }
}
