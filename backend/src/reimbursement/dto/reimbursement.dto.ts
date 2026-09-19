import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ReimbursementStatus } from '@prisma/client';

export class CreateReimbursementDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  proofUrl?: string;
}

export class UpdateReimbursementStatusDto {
  @IsNotEmpty()
  @IsEnum(ReimbursementStatus)
  status!: ReimbursementStatus;
}