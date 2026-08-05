import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePurchaseItemDto {
  @ApiProperty({ example: 'product_cuid_here' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0.001)
  quantity: number;

  @ApiPropertyOptional({ example: 350.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rate?: number;

  @ApiPropertyOptional({ example: 18.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercentage?: number;
}
