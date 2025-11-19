import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';

export interface QWeatherWarning {
  id: string;
  sender?: string;
  pubTime?: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  level?: string;
  type?: string;
  text?: string;
}

export interface QWeatherWarningResponse {
  code: string;
  updateTime?: string;
  warning?: QWeatherWarning[];
}

@Injectable()
export class QWeatherService {
  private readonly logger = new Logger(QWeatherService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://devapi.qweather.com/v7';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.apiKey = this.configService.get<string>('QWEATHER_API_KEY') || '';
    if (!this.apiKey) {
      this.logger.warn('QWEATHER_API_KEY not set. QWeather endpoints will not work.');
    }
  }

  async getWarnings(lat: number, lon: number): Promise<QWeatherWarningResponse> {
    const cacheKey = `qweather:warnings:${lat.toFixed(2)}:${lon.toFixed(2)}`;

    try {
      const cached = await this.cacheManager.get<QWeatherWarningResponse>(cacheKey);
      if (cached) {
        this.logger.log(`Returning cached QWeather warnings for ${lat}, ${lon}`);
        return cached;
      }

      if (!this.apiKey) {
        throw new Error('QWeather API key not configured');
      }

      this.logger.log(`Fetching QWeather warnings for ${lat}, ${lon}`);

      const response = await firstValueFrom(
        this.httpService.get<QWeatherWarningResponse>(`${this.baseUrl}/warning/now`, {
          params: {
            location: `${lon},${lat}`,
            key: this.apiKey,
          },
          timeout: 15000,
        }),
      );

      const data = response.data;

      // Cache for 10 minutes
      await this.cacheManager.set(cacheKey, data, 600000);

      return data;
    } catch (error: any) {
      this.logger.error(`Error fetching QWeather warnings: ${error.message}`);
      throw new Error(`Failed to fetch QWeather warnings: ${error.message}`);
    }
  }

  async getTyphoonWarnings(lat: number, lon: number): Promise<QWeatherWarning[]> {
    try {
      const response = await this.getWarnings(lat, lon);
      const warnings = response.warning || [];
      return warnings.filter((w) => {
        const hay = `${w.title ?? ''} ${w.text ?? ''} ${w.type ?? ''}`.toLowerCase();
        return (
          hay.includes('typhoon') ||
          hay.includes('tropical cyclone') ||
          hay.includes('hurricane')
        );
      });
    } catch (error: any) {
      this.logger.error(`Error fetching QWeather typhoon warnings: ${error.message}`);
      return [];
    }
  }
}


