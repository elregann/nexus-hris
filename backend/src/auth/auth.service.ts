import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.employee.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) throw new BadRequestException('Email sudah terdaftar!');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Bikin/ambil departemen default "General" kalau departmentId kosong
    let deptId = dto.departmentId;
    if (!deptId) {
      const defaultDept = await this.prisma.department.upsert({
        where: { code: 'GEN' },
        update: {},
        create: {
          code: 'GEN',
          name: 'General',
        },
      });
      deptId = defaultDept.id;
    }

    const user = await this.prisma.employee.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        fullName: dto.fullName,
        nik: dto.nik || `NIK-${Date.now()}`,
        role: dto.role || 'EMPLOYEE',
        salary: dto.salary ?? 0,
        departmentId: deptId,
      },
    });

    return { message: 'Registrasi berhasil', userId: user.id };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.employee.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Email atau password salah');

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Email atau password salah');

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      access_token: token,
      user: { id: user.id, name: user.fullName, role: user.role },
    };
  }
}