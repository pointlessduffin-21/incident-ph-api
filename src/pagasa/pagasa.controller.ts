import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { PagasaService } from './pagasa.service';

@Controller('pagasa')
export class PagasaController {
  constructor(private readonly pagasaService: PagasaService) {}

  @Get('forecast')
  @HttpCode(HttpStatus.OK)
  async getForecast() {
    return {
      success: true,
      data: await this.pagasaService.getWeatherForecast(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('severe-weather')
  @HttpCode(HttpStatus.OK)
  async getSevereWeather() {
    return {
      success: true,
      data: await this.pagasaService.getSevereWeather(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('tropical-cyclones')
  @HttpCode(HttpStatus.OK)
  async getTropicalCyclones() {
    return {
      success: true,
      data: await this.pagasaService.getTropicalCyclones(),
      timestamp: new Date().toISOString(),
    };
  }
}



