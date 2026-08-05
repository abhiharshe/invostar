import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ProductCategory } from '@prisma/client';
import { CreateBundleItemDto } from './bundle-item.dto';

export class CreateProductDto {
  @ApiProperty({ example: 'type_cuid_here' })
  @IsString()
  @IsNotEmpty()
  productTypeId: string;

  @ApiProperty({ example: 'Wireless Mouse' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'pcs' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ example: 499.00 })
  @IsNumber()
  @Min(0)
  rate: number;

  @ApiPropertyOptional({ example: 18.00, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercentage?: number;

  @ApiPropertyOptional({ enum: ProductCategory, default: ProductCategory.PHYSICAL_GOODS })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isBundle?: boolean;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: [CreateBundleItemDto], description: 'Items included if product is a Bundle & Package' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBundleItemDto)
  bundleItems?: CreateBundleItemDto[];
}
