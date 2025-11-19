import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { QWeatherController } from './qweather.controller';
import { QWeatherService } from './qweather.service';

@Module({
  imports: [HttpModule],
  controllers: [QWeatherController],
  providers: [QWeatherService],
  exports: [QWeatherService],
})
export class QWeatherModule {}


