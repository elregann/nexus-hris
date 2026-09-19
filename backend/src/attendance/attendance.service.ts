import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClockInDto, ClockOutDto } from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async clockIn(employeeId: string, dto: ClockInDto) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await this.prisma.attendance.findFirst({
      where: {
        employeeId,
        createdAt: { gte: today },
      },
    });

    if (existingAttendance) {
      throw new BadRequestException('Kamu sudah melakukan clock-in hari ini!');
    }

    return this.prisma.attendance.create({
      data: {
        employeeId,
        clockIn: new Date(),
        latitude: dto.latitude ?? 0,
        longitude: dto.longitude ?? 0,
      },
    });
  }

  async clockOut(employeeId: string, dto: ClockOutDto) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await this.prisma.attendance.findFirst({
      where: {
        employeeId,
        createdAt: { gte: today },
      },
    });

    if (!attendance) {
      throw new NotFoundException('Belum ada catatan clock-in hari ini!');
    }

    if (attendance.clockOut) {
      throw new BadRequestException('Kamu sudah melakukan clock-out hari ini!');
    }

    return this.prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        clockOut: new Date(),
      },
    });
  }

  getMyAttendance(employeeId: string) {
    return this.prisma.attendance.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAll() {
    return this.prisma.attendance.findMany({
      include: {
        employee: {
          select: { id: true, fullName: true, email: true, department: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}