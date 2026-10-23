import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Category } from '../entities/category.entity'
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto'

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async save(data: CreateCategoryDto) {
    const category = this.categoryRepository.create({ ...data })
    return await this.categoryRepository.save(category)
  }

  async findAll() {
    return await this.categoryRepository.find()
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOneBy({ id })
    if (!category) throw new NotFoundException('Categoria não encontrada')
    return category
  }

  async update(id: string, data: UpdateCategoryDto) {
    const category = await this.findOne(id)
    Object.assign(category, data)
    return await this.categoryRepository.save(category)
  }

  async remove(id: string): Promise<void> {
    const { affected } = await this.categoryRepository.delete({ id })
    if (!affected) throw new NotFoundException('Categoria não encontrada')
  }
}
