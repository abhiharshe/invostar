import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VoidPaymentDto {
  @ApiProperty({ example: 'Payment cheque bounced' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
