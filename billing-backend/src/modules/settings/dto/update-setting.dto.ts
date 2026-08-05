import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class SettingItemDto {
  @ApiProperty({ example: 'company_name' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: 'InvoStar General Store' })
  @IsString()
  value: string;
}

export class UpdateSettingsBatchDto {
  @ApiProperty({ type: [SettingItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SettingItemDto)
  settings: SettingItemDto[];
}
