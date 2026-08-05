import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentAllocationDto {
  @ApiPropertyOptional({ example: 'sale_cuid_here' })
  @IsOptional()
  @IsString()
  saleId?: string;

  @ApiPropertyOptional({ example: 'purchase_cuid_here' })
  @IsOptional()
  @IsString()
  purchaseId?: string;

  @ApiProperty({ example: 500.00 })
  @IsNumber()
  @Min(0.01)
  amount: number;
}
