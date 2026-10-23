import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'
import { AuthService } from './auth.service'
import { LoginDto } from './dto'
import { Public } from './public.decorator'
import { JwtRefreshGuard } from './strategy/jwt-refresh.guard'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.authenticateUser(body.email, body.password)
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  refresh(@Req() req: Request) {
    return this.authService.refreshToken(req.user!.id)
  }
}
