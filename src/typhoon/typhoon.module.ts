import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TyphoonController } from './typhoon.controller';
import { TyphoonService } from './typhoon.service';

@Module({
  imports: [HttpModule],
  controllers: [TyphoonController],
  providers: [TyphoonService],
  exports: [TyphoonService],
})
export class TyphoonModule {}
