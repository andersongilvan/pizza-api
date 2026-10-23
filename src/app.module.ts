import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { ControllerService } from './controller/controller.service'
import { DatabaseModule } from './database/database.module'
import { UserModule } from './user/user.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    DatabaseModule,
    UserModule,
    AuthModule,
  ],
  providers: [ControllerService],
})
export class AppModule {}
