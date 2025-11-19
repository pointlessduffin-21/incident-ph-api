import { Controller, Get, Query, Logger, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TyphoonService } from './typhoon.service';

@ApiTags('Typhoon')
@Controller('typhoon')
export class TyphoonController {
  private readonly logger = new Logger(TyphoonController.name);

  constructor(private readonly typhoonService: TyphoonService) {}

  @Get('active')
  @ApiOperation({ 
    summary: 'Get active typhoons',
    description: 'Retrieves real-time tropical cyclone data from JTWC RSS feed and GDACS API. Includes track forecasts, satellite imagery, and text advisories.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved active typhoon data',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        count: { type: 'number', example: 1 },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'Typhoon 31W (Kalmaegi)' },
              internationalName: { type: 'string', example: 'Kalmaegi' },
              designation: { type: 'string', example: '31W' },
              category: { type: 'string', example: 'Typhoon' },
              maxWinds: { type: 'string', example: 'Warning #09' },
              date: { type: 'string', example: '03/0900Z' },
              affectedAreas: { type: 'array', items: { type: 'string' } },
              status: { type: 'string', example: 'Active' },
              description: { type: 'string' },
              source: { type: 'string', example: 'JTWC (US Navy)' },
              coordinates: { 
                type: 'object',
                properties: {
                  lat: { type: 'number' },
                  lon: { type: 'number' }
                },
                nullable: true
              },
              trackImageUrl: { type: 'string', nullable: true },
              satelliteImageUrl: { type: 'string', nullable: true },
              advisoryUrl: { type: 'string', nullable: true }
            }
          }
        },
        timestamp: { type: 'string', format: 'date-time' },
        sources: { type: 'array', items: { type: 'string' } }
      }
    }
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  async getActiveTyphoons() {
    this.logger.log('GET /typhoon/active - Fetching active typhoons');
    return await this.typhoonService.getActiveTyphoons();
  }

  @Get('jtwc')
  @ApiOperation({ 
    summary: 'Get JTWC typhoon data',
    description: 'Retrieves typhoon data specifically from the Joint Typhoon Warning Center (JTWC) RSS feed.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved JTWC typhoon data' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  async getJTWCData() {
    this.logger.log('GET /typhoon/jtwc - Fetching JTWC data');
    return await this.typhoonService.getJTWCData();
  }

  @Get('gdacs')
  @ApiOperation({ 
    summary: 'Get GDACS typhoon data',
    description: 'Retrieves tropical cyclone data from the Global Disaster Alert and Coordination System (GDACS) API.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved GDACS typhoon data' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  async getGDACSData() {
    this.logger.log('GET /typhoon/gdacs - Fetching GDACS data');
    return await this.typhoonService.getGDACSData();
  }

  @Get('gdacs/nearby')
  @ApiOperation({ 
    summary: 'Get GDACS cyclones nearby',
    description: 'Retrieves tropical cyclones from GDACS within a specified radius of coordinates.'
  })
  @ApiQuery({ name: 'lat', type: Number, description: 'Latitude', example: 13.964 })
  @ApiQuery({ name: 'lon', type: Number, description: 'Longitude', example: 121.747 })
  @ApiQuery({ name: 'radius', type: Number, required: false, description: 'Radius in kilometers', example: 1500 })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved nearby GDACS cyclones' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid coordinates' 
  })
  async getGDACSNearby(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @Query('radius') radius?: string,
  ) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const radiusKm = radius ? parseFloat(radius) : 1500;

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new BadRequestException('Invalid latitude or longitude');
    }

    this.logger.log(`GET /typhoon/gdacs/nearby - lat: ${latitude}, lon: ${longitude}, radius: ${radiusKm}km`);
    return await this.typhoonService.getGDACSNearby(latitude, longitude, radiusKm);
  }
}
