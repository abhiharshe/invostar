import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateSaleItemDto } from './create-sale-item.dto';

export class CreateSaleDto {
  @ApiProperty({ example: 'customer_cuid_here' })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ example: '2026-08-03' })
  @IsDateString()
  invoiceDate: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isQuotation?: boolean;

  @ApiPropertyOptional({ example: 'Payment expected in 15 days' })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({ type: [CreateSaleItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];
}
