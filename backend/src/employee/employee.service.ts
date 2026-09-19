import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEmployeeDto) {
    const existing = await this.prisma.employee.findUnique({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email sudah terdaftar');

    // Beri default password 'password123' jika frontend tidak mengirim dto.password
    const rawPassword = dto.password || 'password123';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    let deptId = dto.departmentId;
    if (!deptId) {
      const defaultDept = await this.prisma.department.upsert({
        where: { code: 'GEN' },
        update: {},
        create: { code: 'GEN', name: 'General' },
      });
      deptId = defaultDept.id;
    }

    return this.prisma.employee.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        fullName: dto.fullName,
        nik: dto.nik || `NIK-${Date.now()}`,
        role: dto.role || 'EMPLOYEE',
        salary: dto.salary ?? 0,
        departmentId: deptId,
        managerId: dto.managerId || null,
      },
      select: {
        id: true,
        nik: true,
        email: true,
        fullName: true,
        role: true,
        salary: true,
        department: true,
        manager: { select: { id: true, fullName: true, email: true } },
        createdAt: true,
      },
    });
  }

  findAll() {
    return this.prisma.employee.findMany({
      select: {
        id: true,
        nik: true,
        email: true,
        fullName: true,
        role: true,
        salary: true,
        department: true,
        manager: { select: { id: true, fullName: true } },
      },
    });
  }

  async findOne(id: string) {
    const emp = await this.prisma.employee.findUnique({
      where: { id },
      select: {
        id: true,
        nik: true,
        email: true,
        fullName: true,
        role: true,
        salary: true,
        department: true,
        manager: { select: { id: true, fullName: true } },
        subordinates: { select: { id: true, fullName: true, role: true } },
      },
    });
    if (!emp) throw new NotFoundException('Pegawai tidak ditemukan');
    return emp;
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    return this.prisma.employee.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.employee.delete({ where: { id } });
  }
}