import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { PhivolcsService } from './phivolcs.service';

@Controller('phivolcs')
export class PhivolcsController {
  constructor(private readonly phivolcsService: PhivolcsService) {}

  @Get('earthquakes')
  @HttpCode(HttpStatus.OK)
  async getEarthquakes() {
    return {
      success: true,
      data: await this.phivolcsService.getEarthquakes(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('latest-earthquake')
  @HttpCode(HttpStatus.OK)
  async getLatestEarthquake() {
    return {
      success: true,
      data: await this.phivolcsService.getLatestEarthquake(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('volcanoes')
  @HttpCode(HttpStatus.OK)
  async getVolcanoes() {
    return {
      success: true,
      data: await this.phivolcsService.getVolcanoes(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('volcanoes/:name')
  @HttpCode(HttpStatus.OK)
  async getVolcanoByName(@Param('name') name: string) {
    return {
      success: true,
      data: await this.phivolcsService.getVolcanoByName(name),
      timestamp: new Date().toISOString(),
    };
  }
}



