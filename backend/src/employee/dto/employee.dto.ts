import { IsEmail, IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class CreateEmployeeDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  email!: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  fullName!: string;

  @IsString()
  @IsOptional()
  nik?: string;

  @IsEnum(['EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'FINANCE'])
  @IsOptional()
  role?: 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN' | 'FINANCE';

  @IsNumber()
  @IsOptional()
  salary?: number;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  managerId?: string;
}

export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsEnum(['EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'FINANCE'])
  @IsOptional()
  role?: 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN' | 'FINANCE';

  @IsNumber()
  @IsOptional()
  salary?: number;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  managerId?: string;
}