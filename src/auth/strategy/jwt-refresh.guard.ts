import { Injectable, UnauthorizedException } from '@nestjs/common'
import { TokenExpiredError } from '@nestjs/jwt'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  handleRequest<TUser>(err: any, user: TUser, info: any): TUser {
    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException('Refresh token expirado')
    }

    if (err || !user) {
      throw err || new UnauthorizedException()
    }

    return user
  }
}
