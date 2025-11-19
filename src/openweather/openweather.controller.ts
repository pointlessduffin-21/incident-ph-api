import { Controller, Get, Query, Logger, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { OpenWeatherService } from './openweather.service';

@ApiTags('OpenWeather')
@Controller('openweather')
export class OpenWeatherController {
  private readonly logger = new Logger(OpenWeatherController.name);

  constructor(private readonly openWeatherService: OpenWeatherService) {}

  @Get('onecall')
  @ApiOperation({
    summary: 'Get OpenWeather OneCall data',
    description:
      'Retrieves comprehensive weather data including current conditions, hourly and daily forecasts, and alerts for a specific location.',
  })
  @ApiQuery({ name: 'lat', type: Number, description: 'Latitude', example: 13.964 })
  @ApiQuery({ name: 'lon', type: Number, description: 'Longitude', example: 121.747 })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved OpenWeather data',
  })
  @ApiResponse({ status: 400, description: 'Invalid coordinates' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getOneCall(@Query('lat') lat: string, @Query('lon') lon: string) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new BadRequestException('Invalid latitude or longitude');
    }

    if (latitude < -90 || latitude > 90) {
      throw new BadRequestException('Latitude must be between -90 and 90');
    }

    if (longitude < -180 || longitude > 180) {
      throw new BadRequestException('Longitude must be between -180 and 180');
    }

    this.logger.log(`GET /openweather/onecall - lat: ${latitude}, lon: ${longitude}`);
    return await this.openWeatherService.getOneCall(latitude, longitude);
  }

  @Get('alerts')
  @ApiOperation({
    summary: 'Get weather alerts',
    description: 'Retrieves all weather alerts for a specific location.',
  })
  @ApiQuery({ name: 'lat', type: Number, description: 'Latitude', example: 13.964 })
  @ApiQuery({ name: 'lon', type: Number, description: 'Longitude', example: 121.747 })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved weather alerts',
  })
  async getAlerts(@Query('lat') lat: string, @Query('lon') lon: string) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new BadRequestException('Invalid latitude or longitude');
    }

    this.logger.log(`GET /openweather/alerts - lat: ${latitude}, lon: ${longitude}`);
    const alerts = await this.openWeatherService.getAlerts(latitude, longitude);
    return {
      success: true,
      count: alerts.length,
      alerts,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('typhoon-alerts')
  @ApiOperation({
    summary: 'Get typhoon-related alerts',
    description:
      'Retrieves only typhoon, tropical cyclone, or hurricane-related alerts for a specific location.',
  })
  @ApiQuery({ name: 'lat', type: Number, description: 'Latitude', example: 13.964 })
  @ApiQuery({ name: 'lon', type: Number, description: 'Longitude', example: 121.747 })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved typhoon alerts',
  })
  async getTyphoonAlerts(@Query('lat') lat: string, @Query('lon') lon: string) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new BadRequestException('Invalid latitude or longitude');
    }

    this.logger.log(`GET /openweather/typhoon-alerts - lat: ${latitude}, lon: ${longitude}`);
    const alerts = await this.openWeatherService.getTyphoonAlerts(latitude, longitude);
    return {
      success: true,
      count: alerts.length,
      alerts,
      timestamp: new Date().toISOString(),
    };
  }
}


