import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { VoidPaymentDto } from './dto/void-payment.dto';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Record a new customer receipt or supplier payment' })
  createPayment(
    @Body() dto: CreatePaymentDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.paymentsService.createPayment(dto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payment records with filters' })
  findAllPayments(@Query() query: QueryPaymentDto) {
    return this.paymentsService.findAllPayments(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payment record by ID' })
  findOnePayment(@Param('id') id: string) {
    return this.paymentsService.findOnePayment(id);
  }

  @Patch(':id/void')
  @ApiOperation({ summary: 'Void a payment entry' })
  voidPayment(
    @Param('id') id: string,
    @Body() dto: VoidPaymentDto,
  ) {
    return this.paymentsService.voidPayment(id, dto);
  }
}
