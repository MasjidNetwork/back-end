import { Module } from '@nestjs/common';
import { MasjidsController } from './masjids.controller';
import { MasjidsService } from './masjids.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [MasjidsController],
  providers: [MasjidsService],
  exports: [MasjidsService],
})
export class MasjidsModule {}
