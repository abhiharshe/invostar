import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VoidPurchaseDto {
  @ApiProperty({ example: 'Incorrect bill amount entered' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
