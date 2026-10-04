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

export class CreateCustomerDto {
  @ApiProperty({ example: 'Acme Traders' })
  @IsString()
  @IsNotEmpty({ message: 'Customer name is required.' })
  @MinLength(2, { message: 'Customer name must be at least 2 characters.' })
  @MaxLength(100, { message: 'Customer name cannot exceed 100 characters.' })
  name: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10}$/, {
    message: 'Mobile number must be a valid 10-digit number.',
  })
  mobile?: string;

  @ApiPropertyOptional({ example: '27AAAAA0000A1Z5' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
    message: 'GSTIN must be a valid 15-character GST number (e.g. 27AAAAA0000A1Z5).',
  })
  gstin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  billingAddress?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  shippingAddress?: Record<string, any>;

  @ApiPropertyOptional({ example: '123 Main Street, Suite 4' })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Address cannot exceed 500 characters.' })
  address?: string;

  @ApiPropertyOptional({ example: 0.00, default: 0 })
  @IsOptional()
  @IsNumber({}, { message: 'Opening balance must be a valid number.' })
  @Min(0, { message: 'Opening balance cannot be negative.' })
  openingBalance?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
