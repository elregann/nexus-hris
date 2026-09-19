import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeneratePayrollDto } from './dto/payroll.dto';
import { PayrollStatus, ReimbursementStatus } from '@prisma/client';

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  async generatePayroll(dto: GeneratePayrollDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employeeId },
    });

    if (!employee) throw new NotFoundException('Karyawan tidak ditemukan');

    const baseSalary = employee.salary ? Number(employee.salary) : 0;

    // 1. Hitung Tunjangan dari Reimbursement APPROVED bulan & tahun ini
    const startDate = new Date(dto.year, dto.month - 1, 1);
    const endDate = new Date(dto.year, dto.month, 0, 23, 59, 59);

    const reimbursements = await this.prisma.reimbursement.aggregate({
      where: {
        employeeId: dto.employeeId,
        status: ReimbursementStatus.APPROVED,
        createdAt: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    });

    const allowances = reimbursements._sum.amount ? Number(reimbursements._sum.amount) : 0;

    // 2. Hitung Potongan Mangkir dari Presensi (Gunakan 'clockIn' bukan 'date')
    const totalAttendance = await this.prisma.attendance.count({
      where: {
        employeeId: dto.employeeId,
        clockIn: { gte: startDate, lte: endDate },
      },
    });

    const standardWorkDays = 22;
    const absentDays = Math.max(0, standardWorkDays - totalAttendance);
    const dailyRate = baseSalary / standardWorkDays;
    const deductions = Math.round(absentDays * dailyRate);

    // 3. Hitung Gaji Bersih (THP)
    const netSalary = Math.max(0, baseSalary + allowances - deductions);

    // Cek jika payroll periode ini sudah ada (Update / Upsert)
    const existingPayroll = await this.prisma.payroll.findFirst({
      where: {
        employeeId: dto.employeeId,
        month: dto.month,
        year: dto.year,
      },
    });

    if (existingPayroll) {
      return this.prisma.payroll.update({
        where: { id: existingPayroll.id },
        data: {
          basicSalary: baseSalary,
          allowances: allowances,
          deductions: deductions,
          netSalary: netSalary,
          status: PayrollStatus.DRAFT,
        },
      });
    }

    return this.prisma.payroll.create({
      data: {
        employeeId: dto.employeeId,
        month: dto.month,
        year: dto.year,
        basicSalary: baseSalary,
        allowances: allowances,
        deductions: deductions,
        netSalary: netSalary,
        status: PayrollStatus.DRAFT,
      },
    });
  }

  async updateStatus(id: string, status: PayrollStatus) {
    return this.prisma.payroll.update({
      where: { id },
      data: { status },
    });
  }

  getEmployeePayrolls(employeeId: string) {
    return this.prisma.payroll.findMany({
      where: { employeeId },
      include: {
        employee: {
          select: { id: true, fullName: true, email: true, department: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAll() {
    return this.prisma.payroll.findMany({
      include: {
        employee: {
          select: { id: true, fullName: true, email: true, department: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}