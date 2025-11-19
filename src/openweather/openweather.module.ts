import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OpenWeatherController } from './openweather.controller';
import { OpenWeatherService } from './openweather.service';

@Module({
  imports: [HttpModule],
  controllers: [OpenWeatherController],
  providers: [OpenWeatherService],
  exports: [OpenWeatherService],
})
export class OpenWeatherModule {}


