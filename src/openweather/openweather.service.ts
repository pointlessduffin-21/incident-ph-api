import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';

export interface OpenWeatherAlert {
  sender_name?: string;
  event?: string;
  start?: number;
  end?: number;
  description?: string;
  tags?: string[];
}

export interface OpenWeatherOneCall {
  lat: number;
  lon: number;
  timezone?: string;
  timezone_offset?: number;
  current?: any;
  hourly?: any[];
  daily?: any[];
  alerts?: OpenWeatherAlert[];
}

@Injectable()
export class OpenWeatherService {
  private readonly logger = new Logger(OpenWeatherService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.openweathermap.org/data';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.apiKey = this.configService.get<string>('OPENWEATHER_API_KEY') || '';
    if (!this.apiKey) {
      this.logger.warn('OPENWEATHER_API_KEY not set. OpenWeather endpoints will not work.');
    }
  }

  async getOneCall(lat: number, lon: number): Promise<OpenWeatherOneCall> {
    const cacheKey = `openweather:onecall:${lat.toFixed(2)}:${lon.toFixed(2)}`;

    try {
      const cached = await this.cacheManager.get<OpenWeatherOneCall>(cacheKey);
      if (cached) {
        this.logger.log(`Returning cached OpenWeather data for ${lat}, ${lon}`);
        return cached;
      }

      if (!this.apiKey) {
        throw new Error('OpenWeather API key not configured');
      }

      this.logger.log(`Fetching OpenWeather OneCall data for ${lat}, ${lon}`);

      // Try One Call 3.0 first
      let url = `${this.baseUrl}/3.0/onecall`;
      let response;

      try {
        response = await firstValueFrom(
          this.httpService.get<OpenWeatherOneCall>(url, {
            params: {
              lat,
              lon,
              appid: this.apiKey,
              units: 'metric',
            },
            timeout: 15000,
          }),
        );
      } catch (error: any) {
        // Fallback to 2.5 if 3.0 is not available
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          this.logger.warn('One Call 3.0 not available, falling back to 2.5');
          url = `${this.baseUrl}/2.5/onecall`;
          response = await firstValueFrom(
            this.httpService.get<OpenWeatherOneCall>(url, {
              params: {
                lat,
                lon,
                appid: this.apiKey,
                units: 'metric',
              },
              timeout: 15000,
            }),
          );
        } else {
          throw error;
        }
      }

      const data = response.data;

      // Cache for 10 minutes
      await this.cacheManager.set(cacheKey, data, 600000);

      return data;
    } catch (error: any) {
      this.logger.error(`Error fetching OpenWeather data: ${error.message}`);
      throw new Error(`Failed to fetch OpenWeather data: ${error.message}`);
    }
  }

  async getAlerts(lat: number, lon: number): Promise<OpenWeatherAlert[]> {
    try {
      const data = await this.getOneCall(lat, lon);
      return data.alerts || [];
    } catch (error: any) {
      this.logger.error(`Error fetching OpenWeather alerts: ${error.message}`);
      return [];
    }
  }

  async getTyphoonAlerts(lat: number, lon: number): Promise<OpenWeatherAlert[]> {
    const alerts = await this.getAlerts(lat, lon);
    return alerts.filter((alert) => {
      const hay = `${alert.event ?? ''} ${alert.description ?? ''}`.toLowerCase();
      return (
        hay.includes('typhoon') ||
        hay.includes('tropical cyclone') ||
        hay.includes('hurricane') ||
        (Array.isArray(alert.tags) &&
          alert.tags.some((t) => /typhoon|cyclone|hurricane/i.test(t)))
      );
    });
  }
}


