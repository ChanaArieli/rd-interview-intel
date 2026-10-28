import { IsEmail, IsOptional, IsString } from 'class-validator';

export class DevLoginRequestDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  name?: string;
}
