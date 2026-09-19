import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AttendanceService } from './attendance.service';
import { ClockInDto, ClockOutDto } from './dto/attendance.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post('clock-in')
  clockIn(@Request() req: any, @Body() dto: ClockInDto) {
    return this.attendanceService.clockIn(req.user.userId, dto);
  }

  @Post('clock-out')
  clockOut(@Request() req: any, @Body() dto: ClockOutDto) {
    return this.attendanceService.clockOut(req.user.userId, dto);
  }

  @Get('my-history')
  getMyHistory(@Request() req: any) {
    return this.attendanceService.getMyAttendance(req.user.userId);
  }

  @Roles('HR_ADMIN', 'MANAGER')
  @Get('all')
  getAll() {
    return this.attendanceService.findAll();
  }
}