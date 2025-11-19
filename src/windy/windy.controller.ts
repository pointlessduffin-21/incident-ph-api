import { Controller, Get, Post, Body, Query, Logger, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { WindyService, WindyPointForecastRequest } from './windy.service';

@ApiTags('Windy')
@Controller('windy')
export class WindyController {
  private readonly logger = new Logger(WindyController.name);

  constructor(private readonly windyService: WindyService) {}

  @Post('forecast')
  @ApiOperation({
    summary: 'Get Windy point forecast',
    description:
      'Retrieves detailed wind, gust, pressure, and precipitation forecasts from Windy.com API for a specific location and model.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        lat: { type: 'number', example: 13.964 },
        lon: { type: 'number', example: 121.747 },
        model: { type: 'string', enum: ['gfs', 'ecmwf', 'iconEU'], example: 'gfs' },
        parameters: {
          type: 'array',
          items: { type: 'string' },
          example: ['wind', 'windGust', 'pressure', 'precip'],
        },
        levels: { type: 'array', items: { type: 'string' }, example: ['surface'] },
        timeformat: { type: 'string', enum: ['iso', 'unix'], example: 'iso' },
      },
      required: ['lat', 'lon'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved Windy forecast',
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getPointForecast(@Body() request: WindyPointForecastRequest) {
    if (typeof request.lat !== 'number' || typeof request.lon !== 'number') {
      throw new BadRequestException('Latitude and longitude must be numbers');
    }

    if (request.lat < -90 || request.lat > 90) {
      throw new BadRequestException('Latitude must be between -90 and 90');
    }

    if (request.lon < -180 || request.lon > 180) {
      throw new BadRequestException('Longitude must be between -180 and 180');
    }

    this.logger.log(
      `POST /windy/forecast - lat: ${request.lat}, lon: ${request.lon}, model: ${request.model || 'gfs'}`,
    );
    return await this.windyService.getPointForecast(request);
  }

  @Get('forecast')
  @ApiOperation({
    summary: 'Get Windy point forecast (GET)',
    description: 'Alternative GET endpoint for Windy forecast using query parameters.',
  })
  @ApiQuery({ name: 'lat', type: Number, description: 'Latitude', example: 13.964 })
  @ApiQuery({ name: 'lon', type: Number, description: 'Longitude', example: 121.747 })
  @ApiQuery({
    name: 'model',
    enum: ['gfs', 'ecmwf', 'iconEU'],
    required: false,
    description: 'Forecast model',
    example: 'gfs',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved Windy forecast',
  })
  async getPointForecastGet(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @Query('model') model?: string,
  ) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new BadRequestException('Invalid latitude or longitude');
    }

    const request: WindyPointForecastRequest = {
      lat: latitude,
      lon: longitude,
      model: model as any,
    };

    this.logger.log(
      `GET /windy/forecast - lat: ${latitude}, lon: ${longitude}, model: ${model || 'gfs'}`,
    );
    return await this.windyService.getPointForecast(request);
  }
}


