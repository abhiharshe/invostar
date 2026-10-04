import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class AddressDto {
  @IsOptional()
  @IsString()
  line1?: string;

  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;
}

export class CreateSupplierDto {
  @ApiProperty({ example: 'Global Distributors Pvt. Ltd.' })
  @IsString()
  @IsNotEmpty({ message: 'Supplier name is required.' })
  @MinLength(2, { message: 'Supplier name must be at least 2 characters.' })
  @MaxLength(100, { message: 'Supplier name cannot exceed 100 characters.' })
  name: string;

  @ApiPropertyOptional({ example: '9123456789' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10}$/, {
    message: 'Mobile number must be a valid 10-digit number.',
  })
  mobile?: string;

  @ApiPropertyOptional({ description: 'Structured billing address' })
  @IsOptional()
  billingAddress?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Structured delivery address' })
  @IsOptional()
  deliveryAddress?: Record<string, any>;

  @ApiPropertyOptional({ example: 'Industrial Estate, Block B' })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Address cannot exceed 500 characters.' })
  address?: string;

  @ApiPropertyOptional({ example: 0.0, default: 0 })
  @IsOptional()
  @IsNumber({}, { message: 'Opening balance must be a valid number.' })
  @Min(0, { message: 'Opening balance cannot be negative.' })
  openingBalance?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
