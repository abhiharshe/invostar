import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateBundleItemDto {
  @ApiProperty({ example: 'product_cuid_here', description: 'Product ID of a non-bundle product to include' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0.001)
  quantity?: number;

  @ApiPropertyOptional({ example: 150.00, description: 'Optional custom rate for this item within the bundle' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rate?: number;
}
