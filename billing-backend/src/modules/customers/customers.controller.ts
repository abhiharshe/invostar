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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  createCustomer(@Body() dto: CreateCustomerDto) {
    return this.customersService.createCustomer(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers with search/filter' })
  findAllCustomers(@Query() query: QueryCustomerDto) {
    return this.customersService.findAllCustomers(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a customer by ID with recent transactions' })
  findOneCustomer(@Param('id') id: string) {
    return this.customersService.findOneCustomer(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update customer details' })
  updateCustomer(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.updateCustomer(id, dto);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle customer active status' })
  toggleCustomerActive(@Param('id') id: string) {
    return this.customersService.toggleCustomerActive(id);
  }
}
