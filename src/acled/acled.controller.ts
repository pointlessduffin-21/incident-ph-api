import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AcledService } from './acled.service';

@ApiTags('ACLED Incidents')
@Controller('acled')
export class AcledController {
  constructor(private readonly acledService: AcledService) {}

  @Get('incidents')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get ACLED conflict/incident data',
    description: 'Retrieves conflict and incident data for the Philippines from ACLED API. Requires API credentials (ACLED_API_EMAIL and ACLED_API_KEY). Cached for 15 minutes.'
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    description: 'Number of incidents to retrieve (1-200)', 
    example: 50 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved incident data' 
  })
  async getIncidents(@Query('limit') limit?: string) {
    const data = await this.acledService.getIncidents(limit ? Number(limit) : undefined);

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
