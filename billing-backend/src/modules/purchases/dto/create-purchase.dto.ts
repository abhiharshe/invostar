import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreatePurchaseItemDto } from './create-purchase-item.dto';

export class CreatePurchaseDto {
  @ApiProperty({ example: 'supplier_cuid_here' })
  @IsString()
  @IsNotEmpty()
  supplierId: string;

  @ApiPropertyOptional({ example: 'BILL-98765', description: 'Auto-generated if not provided' })
  @IsOptional()
  @IsString()
  billNumber?: string;

  @ApiProperty({ example: '2026-08-03' })
  @IsDateString()
  purchaseDate: string;

  @ApiPropertyOptional({ example: 'Stock inward for August' })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({ type: [CreatePurchaseItemDto], description: 'Line items (can be empty on initial creation)' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseItemDto)
  items?: CreatePurchaseItemDto[];
}
