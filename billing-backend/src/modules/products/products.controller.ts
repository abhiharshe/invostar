import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ProductsService } from './products.service';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { CreateBundleItemDto } from './dto/bundle-item.dto';

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // --- Product Types ---

  @Post('types')
  @ApiOperation({ summary: 'Create a new product type' })
  createProductType(@Body() dto: CreateProductTypeDto) {
    return this.productsService.createProductType(dto);
  }

  @Get('types')
  @ApiOperation({ summary: 'Get all product types' })
  findAllProductTypes() {
    return this.productsService.findAllProductTypes();
  }

  @Patch('types/:id')
  @ApiOperation({ summary: 'Update a product type' })
  updateProductType(
    @Param('id') id: string,
    @Body() dto: UpdateProductTypeDto,
  ) {
    return this.productsService.updateProductType(id, dto);
  }

  @Delete('types/:id')
  @ApiOperation({ summary: 'Delete a product type' })
  deleteProductType(@Param('id') id: string) {
    return this.productsService.deleteProductType(id);
  }

  // --- Products ---

  @Post()
  @ApiOperation({ summary: 'Create a new product or bundle product' })
  createProduct(@Body() dto: CreateProductDto) {
    return this.productsService.createProduct(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with category, bundle, and status filters' })
  findAllProducts(@Query() query: QueryProductDto) {
    return this.productsService.findAllProducts(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID with bundle items if applicable' })
  findOneProduct(@Param('id') id: string) {
    return this.productsService.findOneProduct(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.updateProduct(id, dto);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle product active status' })
  toggleProductActive(@Param('id') id: string) {
    return this.productsService.toggleProductActive(id);
  }

  // --- Bundle Items Management ---

  @Post(':id/bundle-items')
  @ApiOperation({ summary: 'Add or update items inside a Bundle & Package product' })
  addOrUpdateBundleItems(
    @Param('id') id: string,
    @Body() items: CreateBundleItemDto[],
  ) {
    return this.productsService.addOrUpdateBundleItems(id, items);
  }

  @Delete(':id/bundle-items/:productId')
  @ApiOperation({ summary: 'Remove a product from a Bundle & Package' })
  removeBundleItem(
    @Param('id') id: string,
    @Param('productId') productId: string,
  ) {
    return this.productsService.removeBundleItem(id, productId);
  }

  @Get(':id/calculate-bundle-rate')
  @ApiOperation({ summary: 'Calculate auto-suggested rate for a Bundle & Package from child products' })
  calculateBundleRate(@Param('id') id: string) {
    return this.productsService.calculateBundleRate(id);
  }
}
