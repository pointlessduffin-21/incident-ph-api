import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PhivolcsService } from './phivolcs.service';

@ApiTags('PHIVOLCS Seismic')
@Controller('phivolcs')
export class PhivolcsController {
  constructor(private readonly phivolcsService: PhivolcsService) {}

  @Get('earthquakes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get earthquake data',
    description: 'Retrieves recent earthquake information from PHIVOLCS website. Cached for 5 minutes.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved earthquake data' 
  })
  async getEarthquakes() {
    return {
      success: true,
      data: await this.phivolcsService.getEarthquakes(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('latest-earthquake')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get latest earthquake',
    description: 'Retrieves the most recent earthquake event from PHIVOLCS. Cached for 5 minutes.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved latest earthquake' 
  })
  async getLatestEarthquake() {
    return {
      success: true,
      data: await this.phivolcsService.getLatestEarthquake(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('volcanoes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get volcano monitoring data',
    description: 'Retrieves status of active Philippine volcanoes from PHIVOLCS. Cached for 10 minutes.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved volcano data' 
  })
  async getVolcanoes() {
    return {
      success: true,
      data: await this.phivolcsService.getVolcanoes(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('volcanoes/:name')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get specific volcano data',
    description: 'Retrieves monitoring data for a specific volcano by name (e.g., mayon, taal).'
  })
  @ApiParam({ 
    name: 'name', 
    description: 'Volcano name (e.g., mayon, taal, pinatubo)', 
    example: 'mayon' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved volcano data' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Volcano not found' 
  })
  async getVolcanoByName(@Param('name') name: string) {
    return {
      success: true,
      data: await this.phivolcsService.getVolcanoByName(name),
      timestamp: new Date().toISOString(),
    };
  }
}



