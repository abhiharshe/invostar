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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { QuerySupplierDto } from './dto/query-supplier.dto';

@ApiTags('suppliers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new supplier' })
  createSupplier(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.createSupplier(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all suppliers with search/filter' })
  findAllSuppliers(@Query() query: QuerySupplierDto) {
    return this.suppliersService.findAllSuppliers(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a supplier by ID with recent transactions' })
  findOneSupplier(@Param('id') id: string) {
    return this.suppliersService.findOneSupplier(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update supplier details' })
  updateSupplier(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.updateSupplier(id, dto);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle supplier active status' })
  toggleSupplierActive(@Param('id') id: string) {
    return this.suppliersService.toggleSupplierActive(id);
  }
}
