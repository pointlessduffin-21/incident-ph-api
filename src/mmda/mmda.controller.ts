import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { MmdaService } from './mmda.service';

@Controller('mmda')
export class MmdaController {
  constructor(private readonly mmdaService: MmdaService) {}

  @Get('traffic')
  @HttpCode(HttpStatus.OK)
  async getTraffic() {
    return {
      success: true,
      data: await this.mmdaService.getTrafficData(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('highways')
  @HttpCode(HttpStatus.OK)
  async getHighways() {
    return {
      success: true,
      data: await this.mmdaService.getHighways(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('segments')
  @HttpCode(HttpStatus.OK)
  async getSegments() {
    return {
      success: true,
      data: await this.mmdaService.getSegments(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('traffic/:highwayId')
  @HttpCode(HttpStatus.OK)
  async getTrafficByHighway(@Param('highwayId') highwayId: string) {
    return {
      success: true,
      data: await this.mmdaService.getTrafficByHighway(highwayId),
      timestamp: new Date().toISOString(),
    };
  }
}



