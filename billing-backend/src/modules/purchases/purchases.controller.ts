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
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { QueryPurchaseDto } from './dto/query-purchase.dto';
import { VoidPurchaseDto } from './dto/void-purchase.dto';

@ApiTags('purchases')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  @ApiOperation({ summary: 'Record a new purchase bill' })
  createPurchase(
    @Body() dto: CreatePurchaseDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.purchasesService.createPurchase(dto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all purchase bills with search and filters' })
  findAllPurchases(@Query() query: QueryPurchaseDto) {
    return this.purchasesService.findAllPurchases(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a purchase bill by ID' })
  findOnePurchase(@Param('id') id: string) {
    return this.purchasesService.findOnePurchase(id);
  }

  @Patch(':id/void')
  @ApiOperation({ summary: 'Void a purchase bill' })
  voidPurchase(
    @Param('id') id: string,
    @Body() dto: VoidPurchaseDto,
  ) {
    return this.purchasesService.voidPurchase(id, dto);
  }
}
