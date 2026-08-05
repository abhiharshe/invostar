import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VoidSaleDto {
  @ApiProperty({ example: 'Customer cancelled the order' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
