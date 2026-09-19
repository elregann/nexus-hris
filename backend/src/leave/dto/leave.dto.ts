import { IsNotEmpty, IsString, IsDateString, IsEnum } from 'class-validator';

export class CreateLeaveDto {
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @IsDateString()
  @IsNotEmpty()
  endDate!: string;
}

export class UpdateLeaveStatusDto {
  @IsString()
  @IsNotEmpty()
  status!: 'APPROVED' | 'REJECTED' | 'PENDING';
}