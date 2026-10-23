import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator'
import { UserRole } from '../enums/user-role.enum'

export class CreateUserDto {
  @IsString()
  @Length(3, 255)
  name!: string

  @IsEmail()
  email!: string

  @IsString()
  @Length(6, 255)
  password!: string

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(3, 255)
  name?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  @Length(6, 255)
  password?: string

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole
}
