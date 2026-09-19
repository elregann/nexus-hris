import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReimbursementDto, UpdateReimbursementStatusDto } from './dto/reimbursement.dto';
import { ReimbursementStatus } from '@prisma/client';

@Injectable()
export class ReimbursementService {
  constructor(private prisma: PrismaService) {}

  create(employeeId: string, dto: CreateReimbursementDto) {
    return this.prisma.reimbursement.create({
      data: {
        employeeId,
        title: dto.title,
        amount: dto.amount,
        proofUrl: dto.proofUrl ?? '',
        status: ReimbursementStatus.PENDING_MANAGER,
      },
    });
  }

  getMyClaims(employeeId: string) {
    return this.prisma.reimbursement.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAll() {
    return this.prisma.reimbursement.findMany({
      include: {
        employee: {
          select: { id: true, fullName: true, email: true, department: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, dto: UpdateReimbursementStatusDto) {
    const claim = await this.prisma.reimbursement.findUnique({ where: { id } });
    if (!claim) throw new NotFoundException('Klaim reimbursement tidak ditemukan');

    return this.prisma.reimbursement.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}