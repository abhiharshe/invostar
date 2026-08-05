import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaymentMode, PaymentType } from '@prisma/client';
import { CreatePaymentAllocationDto } from './create-payment-allocation.dto';

export class CreatePaymentDto {
  @ApiProperty({ enum: PaymentType, example: PaymentType.CUSTOMER_RECEIPT })
  @IsEnum(PaymentType)
  type: PaymentType;

  @ApiPropertyOptional({ example: 'customer_cuid_here' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ example: 'supplier_cuid_here' })
  @IsOptional()
  @IsString()
  supplierId?: string;

  @ApiProperty({ example: 1000.00 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: '2026-08-03' })
  @IsDateString()
  paymentDate: string;

  @ApiPropertyOptional({ enum: PaymentMode, default: PaymentMode.CASH })
  @IsOptional()
  @IsEnum(PaymentMode)
  paymentMode?: PaymentMode;

  @ApiPropertyOptional({ example: 'UPI-12345678' })
  @IsOptional()
  @IsString()
  referenceNo?: string;

  @ApiPropertyOptional({ example: 'Part payment received via UPI' })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({ type: [CreatePaymentAllocationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePaymentAllocationDto)
  allocations?: CreatePaymentAllocationDto[];
}
