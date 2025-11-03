import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { MmdaService } from './mmda.service';

@ApiTags('MMDA Traffic')
@Controller('mmda')
export class MmdaController {
  constructor(private readonly mmdaService: MmdaService) {}

  @Get('traffic')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get all MMDA traffic alerts',
    description: 'Retrieves real-time traffic alerts from MMDA Twitter feed. Data is cached for 10 minutes.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved traffic alerts' 
  })
  async getTraffic() {
    return {
      success: true,
      data: await this.mmdaService.getTrafficData(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('highways')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get list of monitored highways',
    description: 'Returns list of 12 major Metro Manila highways with coordinates.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved highways list' 
  })
  async getHighways() {
    return {
      success: true,
      data: await this.mmdaService.getHighways(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('segments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get road segments information',
    description: 'Returns information about MMDA road segments derived from traffic alerts.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved road segments information' 
  })
  async getSegments() {
    return {
      success: true,
      data: await this.mmdaService.getSegments(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('traffic/:highwayId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get traffic alerts for specific highway',
    description: 'Retrieves traffic alerts filtered by highway ID (e.g., EDSA, C5, Commonwealth).'
  })
  @ApiParam({ 
    name: 'highwayId', 
    description: 'Highway identifier (e.g., EDSA, C5, Commonwealth)', 
    example: 'edsa' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved highway-specific traffic alerts' 
  })
  async getTrafficByHighway(@Param('highwayId') highwayId: string) {
    return {
      success: true,
      data: await this.mmdaService.getTrafficByHighway(highwayId),
      timestamp: new Date().toISOString(),
    };
  }
}



