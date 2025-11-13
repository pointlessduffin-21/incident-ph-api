import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TideService } from './tide.service';

@ApiTags('Tide Forecasts')
@Controller('api/tide')
export class TideController {
  constructor(private readonly tideService: TideService) {}

  @Get('forecast/:location')
  @ApiOperation({
    summary: 'Get tide forecast for a location',
    description: 'Fetches tide forecast data (high/low tides with times and heights) for a specific Philippine coastal location from tide-forecast.com. Tides are provided for the next 7-14 days.',
  })
  @ApiParam({
    name: 'location',
    description: 'Location slug (e.g., cordova-1 for Cordova, manila-bay for Manila Bay)',
    example: 'cordova-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Tide forecast data retrieved successfully',
    schema: {
      example: {
        location: 'Cordova',
        timezone: 'PST (UTC +8.0hrs)',
        tides: [
          {
            date: 'Thursday 13 November 2025',
            events: [
              { type: 'High Tide', time: '2:38 AM', heightMeters: 1.66, heightFeet: 5.45 },
              { type: 'Low Tide', time: '11:51 AM', heightMeters: 0.53, heightFeet: 1.74 },
            ],
          },
        ],
        cachedAt: '2025-11-12T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Failed to fetch tide data' })
  async getTideForecast(@Param('location') location: string) {
    return this.tideService.fetchTideForecast(location);
  }

  @Get('locations')
  @ApiOperation({
    summary: 'Get available tide forecast locations',
    description: 'Returns a list of Philippine coastal locations with available tide forecasts. Each location includes its slug identifier and display name.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available locations',
    schema: {
      example: {
        locations: [
          { slug: 'cordova-1', name: 'Cordova' },
          { slug: 'manila-bay', name: 'Manila Bay' },
          { slug: 'cebu-city', name: 'Cebu City' },
          { slug: 'davao-gulf', name: 'Davao Gulf' },
        ],
      },
    },
  })
  getLocations() {
    return this.tideService.getAvailableLocations();
  }
}
