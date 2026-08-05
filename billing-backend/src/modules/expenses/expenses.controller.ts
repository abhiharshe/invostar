import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';

@ApiTags('expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Record a new business expense' })
  createExpense(
    @Body() dto: CreateExpenseDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.expensesService.createExpense(dto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all expenses with category/date filters' })
  findAllExpenses(@Query() query: QueryExpenseDto) {
    return this.expensesService.findAllExpenses(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an expense record by ID' })
  findOneExpense(@Param('id') id: string) {
    return this.expensesService.findOneExpense(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an expense record' })
  deleteExpense(@Param('id') id: string) {
    return this.expensesService.deleteExpense(id);
  }
}
