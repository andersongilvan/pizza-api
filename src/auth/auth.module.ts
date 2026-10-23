import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../entities/user.entity'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { RulesGuard } from './rules.guard'
import { JwtAuthGuard } from './strategy/jwt-auth.guard'
import { JwtRefreshStrategy } from './strategy/jwt-refresh.strategy'
import { JwtStrategy } from './strategy/jwt.strategy'

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: Number(configService.getOrThrow<string>('JWT_EXPIRATION_TIME')),
          algorithm: 'HS256',
          issuer: configService.getOrThrow<string>('JWT_ISSUER'),
        },
      }),
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    RulesGuard,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RulesGuard,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
