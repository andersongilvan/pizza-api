import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common'
import { RequiredRoles } from '../auth/required-rules.decorator'
import { UserRole } from '../enums/user-role.enum'
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto'
import { CategoryService } from './category.service'

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @RequiredRoles(UserRole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.save(dto)
  }

  @RequiredRoles(UserRole.ADMIN, UserRole.STAFF)
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.categoryService.findAll()
  }

  @RequiredRoles(UserRole.ADMIN, UserRole.STAFF)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.findOne(id)
  }

  @RequiredRoles(UserRole.ADMIN)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto)
  }

  @RequiredRoles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.remove(id)
  }
}
