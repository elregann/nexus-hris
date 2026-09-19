import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { LeaveService } from './leave.service';
import { CreateLeaveDto, UpdateLeaveStatusDto } from './dto/leave.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('leave')
export class LeaveController {
  constructor(private leaveService: LeaveService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateLeaveDto) {
    return this.leaveService.create(req.user.userId, dto);
  }

  @Get('my-history')
  getMyLeaves(@Request() req: any) {
    return this.leaveService.getMyLeaves(req.user.userId);
  }

  @Roles('HR_ADMIN', 'MANAGER')
  @Get('all')
  findAll() {
    return this.leaveService.findAll();
  }

  @Roles('HR_ADMIN', 'MANAGER')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateLeaveStatusDto) {
    return this.leaveService.updateStatus(id, dto);
  }
}