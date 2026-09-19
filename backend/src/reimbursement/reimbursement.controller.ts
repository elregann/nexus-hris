import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ReimbursementService } from './reimbursement.service';
import { CreateReimbursementDto, UpdateReimbursementStatusDto } from './dto/reimbursement.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('reimbursement')
export class ReimbursementController {
  constructor(private reimbursementService: ReimbursementService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateReimbursementDto) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.reimbursementService.create(userId, dto);
  }

  @Get('my-claims')
  getMyClaims(@Request() req: any) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.reimbursementService.getMyClaims(userId);
  }

  @Roles('HR_ADMIN', 'MANAGER')
  @Get('all')
  findAll() {
    return this.reimbursementService.findAll();
  }

  @Roles('HR_ADMIN', 'MANAGER')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateReimbursementStatusDto) {
    return this.reimbursementService.updateStatus(id, dto);
  }
}