import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getInfo() {
    return {
      name: 'Philippine Government Services API',
      version: '1.1.0',
      services: {
        mmda: {
          description: 'MMDA Traffic Alerts from Official Twitter Feed',
          endpoints: [
            'GET /api/mmda/traffic',
            'GET /api/mmda/highways',
            'GET /api/mmda/segments',
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
          ],
        },
        acled: {
          description: 'ACLED Conflict & Incident Reports (Philippines)',
          endpoints: [
            'GET /api/acled/incidents',
          ],
        },
      },
    };
  }
}



