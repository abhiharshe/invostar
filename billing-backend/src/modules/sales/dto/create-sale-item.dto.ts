import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateSaleItemDto {
  @ApiProperty({ example: 'product_cuid_here' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(0.001)
  quantity: number;

  @ApiPropertyOptional({ example: 499.00, description: 'Overrides product default rate if provided' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rate?: number;

  @ApiPropertyOptional({ example: 18.00, description: 'Overrides product default tax percentage if provided' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercentage?: number;
}
