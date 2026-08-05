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
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { QuerySaleDto } from './dto/query-sale.dto';
import { VoidSaleDto } from './dto/void-sale.dto';

@ApiTags('sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sale invoice or quotation' })
  createSale(
    @Body() dto: CreateSaleDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.salesService.createSale(dto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sales and quotations with search and filters' })
  findAllSales(@Query() query: QuerySaleDto) {
    return this.salesService.findAllSales(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a sale invoice or quotation by ID' })
  findOneSale(@Param('id') id: string) {
    return this.salesService.findOneSale(id);
  }

  @Post(':id/convert-quotation')
  @ApiOperation({ summary: 'Convert a quotation into an active sale invoice' })
  convertQuotation(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
  ) {
    return this.salesService.convertQuotationToInvoice(id, user.sub);
  }

  @Patch(':id/void')
  @ApiOperation({ summary: 'Void a sale invoice or quotation' })
  voidSale(
    @Param('id') id: string,
    @Body() dto: VoidSaleDto,
  ) {
    return this.salesService.voidSale(id, dto);
  }
}
