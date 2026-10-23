import { IsOptional, IsString, Length } from 'class-validator'

export class CreateCategoryDto {
  @Length(3, 50)
  @IsString()
  name!: string
}

export class UpdateCategoryDto {
  @IsOptional()
  @Length(3, 50)
  @IsString()
  name?: string
}
