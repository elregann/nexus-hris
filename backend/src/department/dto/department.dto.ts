export class CreateDepartmentDto {
  code!: string;
  name!: string;
}

export class UpdateDepartmentDto {
  code?: string;
  name?: string;
}
