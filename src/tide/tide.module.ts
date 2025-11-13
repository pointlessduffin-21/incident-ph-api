import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TideController } from './tide.controller';
import { TideService } from './tide.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [TideController],
  providers: [TideService],
})
export class TideModule {}
