import { Module } from '@nestjs/common';
import { UiConfigService } from './ui-config.service';
import { UiConfigController } from './ui-config.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UiConfigController],
  providers: [UiConfigService],
})
export class UiConfigModule {}
