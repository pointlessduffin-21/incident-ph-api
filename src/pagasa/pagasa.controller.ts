import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PagasaService } from './pagasa.service';

@ApiTags('PAGASA Weather')
@Controller('pagasa')
export class PagasaController {
  constructor(private readonly pagasaService: PagasaService) {}

  @Get('forecast')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get PAGASA weather forecast',
    description: 'Retrieves weather forecasts from PAGASA Twitter feed using Playwright browser automation. Cached for 30 minutes.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved weather forecast' 
  })
  async getForecast() {
    return {
      success: true,
      data: await this.pagasaService.getWeatherForecast(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('severe-weather')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get severe weather alerts',
    description: 'Retrieves severe weather warnings and advisories from PAGASA. Cached for 10 minutes.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved severe weather alerts' 
  })
  async getSevereWeather() {
    return {
      success: true,
      data: await this.pagasaService.getSevereWeather(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('tropical-cyclones')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get tropical cyclone updates',
    description: 'Retrieves tropical cyclone (typhoon) information from PAGASA Twitter feed. Cached for 10 minutes.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved tropical cyclone updates' 
  })
  async getTropicalCyclones() {
    return {
      success: true,
      data: await this.pagasaService.getTropicalCyclones(),
      timestamp: new Date().toISOString(),
    };
  }
}



