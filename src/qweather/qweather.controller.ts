import { Controller, Get, Query, Logger, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { QWeatherService } from './qweather.service';

@ApiTags('QWeather')
@Controller('qweather')
export class QWeatherController {
  private readonly logger = new Logger(QWeatherController.name);

  constructor(private readonly qWeatherService: QWeatherService) {}

  @Get('warnings')
  @ApiOperation({
    summary: 'Get QWeather warnings',
    description: 'Retrieves all weather warnings from QWeather API for a specific location.',
  })
  @ApiQuery({ name: 'lat', type: Number, description: 'Latitude', example: 13.964 })
  @ApiQuery({ name: 'lon', type: Number, description: 'Longitude', example: 121.747 })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved QWeather warnings',
  })
  @ApiResponse({ status: 400, description: 'Invalid coordinates' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getWarnings(@Query('lat') lat: string, @Query('lon') lon: string) {
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

    this.logger.log(`GET /qweather/warnings - lat: ${latitude}, lon: ${longitude}`);
    const response = await this.qWeatherService.getWarnings(latitude, longitude);
    return {
      success: true,
      code: response.code,
      count: response.warning?.length || 0,
      warnings: response.warning || [],
      updateTime: response.updateTime,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('typhoon-warnings')
  @ApiOperation({
    summary: 'Get typhoon-related warnings',
    description:
      'Retrieves only typhoon, tropical cyclone, or hurricane-related warnings from QWeather for a specific location.',
  })
  @ApiQuery({ name: 'lat', type: Number, description: 'Latitude', example: 13.964 })
  @ApiQuery({ name: 'lon', type: Number, description: 'Longitude', example: 121.747 })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved typhoon warnings',
  })
  async getTyphoonWarnings(@Query('lat') lat: string, @Query('lon') lon: string) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new BadRequestException('Invalid latitude or longitude');
    }

    this.logger.log(`GET /qweather/typhoon-warnings - lat: ${latitude}, lon: ${longitude}`);
    const warnings = await this.qWeatherService.getTyphoonWarnings(latitude, longitude);
    return {
      success: true,
      count: warnings.length,
      warnings,
      timestamp: new Date().toISOString(),
    };
  }
}


