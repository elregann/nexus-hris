import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PayrollService } from './payroll.service';
import { GeneratePayrollDto } from './dto/payroll.dto';
import { PayrollStatus } from '@prisma/client';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('payroll')
export class PayrollController {
  constructor(private payrollService: PayrollService) {}

  @Roles('HR_ADMIN', 'MANAGER', 'FINANCE')
  @Post('generate')
  generatePayroll(@Body() dto: GeneratePayrollDto) {
    return this.payrollService.generatePayroll(dto);
  }

  @Get('my-slips')
  getMyPayrolls(@Request() req: any) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.payrollService.getEmployeePayrolls(userId);
  }

  @Roles('HR_ADMIN', 'MANAGER', 'FINANCE')
  @Get('all')
  findAll() {
    return this.payrollService.findAll();
  }

  @Roles('HR_ADMIN', 'FINANCE')
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: PayrollStatus,
  ) {
    return this.payrollService.updateStatus(id, status);
  }
}