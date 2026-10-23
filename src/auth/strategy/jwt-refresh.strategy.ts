import { UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { InjectRepository } from '@nestjs/typeorm'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Repository } from 'typeorm'
import { User } from '../../entities/user.entity'
import { JwtPayload, JwtType } from '../types'

export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      issuer: configService.getOrThrow<string>('JWT_ISSUER'),
    })
  }

  async validate(payload: JwtPayload) {
    if (payload.type !== JwtType.REFRESH) {
      throw new UnauthorizedException('Unauthorized token type')
    }

    const user = await this.userRepo.findOneBy({ id: payload.sub })

    if (!user || !user.active) {
      throw new UnauthorizedException('Não autorizado')
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    }
  }
}
