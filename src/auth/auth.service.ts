import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { compareSync } from 'bcryptjs'
import { Repository } from 'typeorm'
import { User } from '../entities/user.entity'
import { JwtPayload, JwtType } from './types'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async authenticateUser(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } })
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas')
    }
    const isPasswordValid = compareSync(password, user.passwordHash)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas')
    }
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
      },
      accessToken: await this.generateToken(user.id, JwtType.ACCESS),
      refreshToken: await this.generateToken(user.id, JwtType.REFRESH),
    }
  }

  async refreshToken(userId: string) {
    return {
      accessToken: await this.generateToken(userId, JwtType.ACCESS),
      refreshToken: await this.generateToken(userId, JwtType.REFRESH),
    }
  }

  private async generateToken(sub: string, jwtType: JwtType) {
    if (jwtType === JwtType.ACCESS) {
      const payoload: JwtPayload = {
        sub,
        type: JwtType.ACCESS,
      }
      return await this.jwtService.signAsync(payoload)
    }

    if (jwtType === JwtType.REFRESH) {
      const payoload: JwtPayload = {
        sub,
        type: JwtType.REFRESH,
      }
      return await this.jwtService.signAsync(payoload, {
        expiresIn: Number(process.env.JWT_REFRESH_EXPIRATION_TIME),
      })
    }
  }
}
