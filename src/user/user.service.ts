import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { hash } from 'bcryptjs'
import { Repository } from 'typeorm'
import { Pagination, PaginationParams } from '../common/pagination'
import { User } from '../entities/user.entity'
import { UserRole } from '../enums/user-role.enum'
import { CreateUserDto, UpdateUserDto } from './dto'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async save(dto: CreateUserDto) {
    const { name, email, password, role } = dto

    const userExists = await this.userRepo.findOne({
      where: { email },
    })
    if (userExists) throw new ConflictException('Esse e-mail já existe')

    const passwordHash = await hash(password, 8)

    const user = this.userRepo.create({
      name,
      email,
      role: role ? role : UserRole.STAFF,
      passwordHash,
    })

    await this.userRepo.save(user)

    return this.resolveUserResponse(user)
  }

  async findAll({
    search,
    page,
    limit,
  }: PaginationParams): Promise<Pagination<Omit<User, 'passwordHash'>>> {
    const query = this.userRepo
      .createQueryBuilder('user')
      .select(['user.id', 'user.name', 'user.email', 'user.role', 'user.active'])
      .orderBy('user.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)

    const term = search?.trim()
    if (term) {
      query.where('(user.name ILIKE :term OR user.email ILIKE :term)', {
        term: `%${term.replace(/[\\%_]/g, '\\$&')}%`,
      })
    }

    const [data, totalItems] = await query.getManyAndCount()

    return {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      page,
      data,
    }
  }

  async update(id: string, dto: UpdateUserDto): Promise<Omit<User, 'passwordHash'>> {
    const { password, ...fields } = dto

    const user = await this.userRepo.findOne({ where: { id } })
    if (!user) throw new NotFoundException('Usuário não encontrado')

    if (fields.email && fields.email !== user.email) {
      const emailInUse = await this.userRepo.existsBy({ email: fields.email })
      if (emailInUse) throw new ConflictException('Esse e-mail já existe')
    }

    Object.assign(user, fields)
    if (password) user.passwordHash = await hash(password, 8)

    await this.userRepo.save(user)

    return this.resolveUserResponse(user)
  }

  async deactivate(id: string): Promise<void> {
    const { affected } = await this.userRepo.update({ id }, { active: false })
    if (!affected) throw new NotFoundException('Usuário não encontrado')
  }

  async remove(id: string): Promise<void> {
    const { affected } = await this.userRepo.delete({ id })
    if (!affected) throw new NotFoundException('Usuário não encontrado')
  }

  private resolveUserResponse(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash: _password, ...userResponse } = user
    void _password

    return userResponse
  }
}
