import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GeneratePayrollDto {
  @IsNotEmpty()
  @IsString()
  employeeId!: string;

  @IsNotEmpty()
  @IsNumber()
  month!: number;

  @IsNotEmpty()
  @IsNumber()
  year!: number;
}
