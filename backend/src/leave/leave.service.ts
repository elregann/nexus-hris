import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveDto, UpdateLeaveStatusDto } from './dto/leave.dto';

@Injectable()
export class LeaveService {
  constructor(private prisma: PrismaService) {}

  create(employeeId: string, dto: CreateLeaveDto) {
    return this.prisma.leaveRequest.create({
      data: {
        employeeId,
        reason: dto.reason,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: 'PENDING',
      },
    });
  }

  getMyLeaves(employeeId: string) {
    return this.prisma.leaveRequest.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAll() {
    return this.prisma.leaveRequest.findMany({
      include: {
        employee: {
          select: { id: true, fullName: true, email: true, department: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, dto: UpdateLeaveStatusDto) {
    const leave = await this.prisma.leaveRequest.findUnique({ where: { id } });
    if (!leave) throw new NotFoundException('Pengajuan cuti tidak ditemukan');

    return this.prisma.leaveRequest.update({
      where: { id },
      data: { status: dto.status },
    });
  }
} 