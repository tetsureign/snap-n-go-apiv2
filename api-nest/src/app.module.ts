import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { HistoryModule } from './history/history.module';
import { DetectionModule } from './detection/detection.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule,
    HistoryModule,
    DetectionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
