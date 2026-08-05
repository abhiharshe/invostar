import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({ example: '2026-08-03' })
  @IsDateString()
  expenseDate: string;

  @ApiProperty({ example: 'Utilities' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 1250.00 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ example: 'Monthly electricity bill' })
  @IsOptional()
  @IsString()
  remarks?: string;
}
