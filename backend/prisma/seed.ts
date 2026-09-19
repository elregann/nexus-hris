import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 1. Buat Department
  const deptHR = await prisma.department.upsert({
    where: { code: 'HRD' },
    update: {},
    create: { code: 'HRD', name: 'Human Resources' },
  });

  const deptIT = await prisma.department.upsert({
    where: { code: 'ENG' },
    update: {},
    create: { code: 'ENG', name: 'Engineering' },
  });

  // 2. Buat HR Admin Default
  await prisma.employee.upsert({
    where: { email: 'admin@nexus.com' },
    update: {},
    create: {
      email: 'admin@nexus.com',
      passwordHash: hashedPassword,
      fullName: 'Super HR Admin',
      nik: 'NIK-HR-001',
      role: 'HR_ADMIN',
      salary: 15000000,
      departmentId: deptHR.id,
    },
  });

  // 3. Buat Employee Regular
  await prisma.employee.upsert({
    where: { email: 'dev@nexus.com' },
    update: {},
    create: {
      email: 'dev@nexus.com',
      passwordHash: hashedPassword,
      fullName: 'Senior Developer',
      nik: 'NIK-ENG-001',
      role: 'EMPLOYEE',
      salary: 12000000,
      departmentId: deptIT.id,
    },
  });

  console.log('Seeding data dummy berhasil!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
