import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { AcledService } from './acled.service';

@Controller('acled')
export class AcledController {
  constructor(private readonly acledService: AcledService) {}

  @Get('incidents')
  @HttpCode(HttpStatus.OK)
  async getIncidents(@Query('limit') limit?: string) {
    const data = await this.acledService.getIncidents(limit ? Number(limit) : undefined);

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
