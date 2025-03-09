import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MasjidsModule } from './masjids/masjids.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { PaymentsModule } from './payments/payments.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { LoggerModule } from './logger/logger.module';
import { HttpLoggerMiddleware } from './logger/http-logger.middleware';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    LoggerModule,
    AuthModule,
    UsersModule,
    MasjidsModule,
    CampaignsModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
