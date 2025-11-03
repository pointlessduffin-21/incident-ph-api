import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('API Info')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ 
    summary: 'Get API information',
    description: 'Returns API metadata and available endpoints for Philippine Government Services.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'API information retrieved successfully' 
  })
  getInfo() {
    return {
      name: 'Philippine Government Services API',
      version: '1.1.0',
      documentation: '/api/docs',
      services: {
        mmda: {
          description: 'MMDA Traffic Alerts from Official Twitter Feed',
          endpoints: [
            'GET /api/mmda/traffic',
            'GET /api/mmda/highways',
            'GET /api/mmda/segments',
            'GET /api/mmda/traffic/:highwayId',
          ],
        },
        pagasa: {
          description: 'PAGASA Weather Forecast',
          endpoints: [
            'GET /api/pagasa/forecast',
            'GET /api/pagasa/severe-weather',
            'GET /api/pagasa/tropical-cyclones',
          ],
        },
        phivolcs: {
          description: 'PHIVOLCS Volcanic and Earthquake Activity',
          endpoints: [
            'GET /api/phivolcs/earthquakes',
            'GET /api/phivolcs/volcanoes',
            'GET /api/phivolcs/latest-earthquake',
            'GET /api/phivolcs/volcanoes/:name',
          ],
        },
        acled: {
          description: 'ACLED Conflict & Incident Reports (Philippines)',
          endpoints: [
            'GET /api/acled/incidents',
          ],
        },
        typhoon: {
          description: 'Real-time Typhoon/Tropical Cyclone Data (JTWC + GDACS)',
          endpoints: [
            'GET /api/typhoon/active',
            'GET /api/typhoon/jtwc',
            'GET /api/typhoon/gdacs',
          ],
        },
      },
    };
  }
}



