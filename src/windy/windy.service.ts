import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';

export type WindyLevelSeries = Record<string, number[] | undefined>;

export interface WindyPointForecastResponse {
  ts: Array<number | string>;
  units?: Record<string, string>;
  wind?: WindyLevelSeries;
  windGust?: WindyLevelSeries;
  precip?: WindyLevelSeries;
  pressure?: WindyLevelSeries;
  [key: string]: any;
}

export interface WindyPointForecastRequest {
  lat: number;
  lon: number;
  model?: string;
  parameters?: string[];
  levels?: string[];
  timeformat?: 'iso' | 'unix';
}

@Injectable()
export class WindyService {
  private readonly logger = new Logger(WindyService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.windy.com/api';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.apiKey = this.configService.get<string>('WINDY_API_KEY') || '';
    if (!this.apiKey) {
      this.logger.warn('WINDY_API_KEY not set. Windy endpoints will not work.');
    }
  }

  async getPointForecast(
    request: WindyPointForecastRequest,
  ): Promise<WindyPointForecastResponse> {
    const cacheKey = `windy:forecast:${request.lat.toFixed(2)}:${request.lon.toFixed(2)}:${request.model || 'gfs'}`;

    try {
      const cached = await this.cacheManager.get<WindyPointForecastResponse>(cacheKey);
      if (cached) {
        this.logger.log(
          `Returning cached Windy forecast for ${request.lat}, ${request.lon}`,
        );
        return cached;
      }

      if (!this.apiKey) {
        throw new Error('Windy API key not configured');
      }

      this.logger.log(
        `Fetching Windy point forecast for ${request.lat}, ${request.lon}, model: ${request.model || 'gfs'}`,
      );

      const payload = {
        lat: request.lat,
        lon: request.lon,
        model: request.model ?? 'gfs',
        parameters: request.parameters ?? ['wind', 'windGust', 'pressure', 'precip'],
        levels: request.levels ?? ['surface'],
        timeformat: request.timeformat ?? 'iso',
        key: this.apiKey,
      };

      const response = await firstValueFrom(
        this.httpService.post<WindyPointForecastResponse>(
          `${this.baseUrl}/point-forecast/v2`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 15000,
          },
        ),
      );

      const data = response.data;

      // Cache for 15 minutes
      await this.cacheManager.set(cacheKey, data, 900000);

      return data;
    } catch (error: any) {
      this.logger.error(`Error fetching Windy forecast: ${error.message}`);
      throw new Error(`Failed to fetch Windy forecast: ${error.message}`);
    }
  }
}


