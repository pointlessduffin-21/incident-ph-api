import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AcledService {
  private readonly logger = new Logger(AcledService.name);
  private readonly baseUrl: string;
  private readonly email?: string;
  private readonly apiKey?: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.baseUrl = this.configService.get('ACLED_API_BASE_URL') || 'https://api.acleddata.com/acled/read';
    this.email = this.configService.get('ACLED_API_EMAIL');
    this.apiKey = this.configService.get('ACLED_API_KEY');
  }

  async getIncidents(limit = 50) {
    const sanitizedLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
    const cacheKey = `acled:incidents:${sanitizedLimit}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      this.logger.log(`Returning cached ACLED incidents (limit=${sanitizedLimit})`);
      return cached;
    }

    if (!this.email || !this.apiKey) {
      const fallback = {
        count: 0,
        incidents: [],
        source: 'ACLED API',
        note: 'Configure ACLED_API_EMAIL and ACLED_API_KEY to enable ACLED incident retrieval.',
        lastUpdated: new Date().toISOString(),
      };

      await this.cacheManager.set(cacheKey, fallback, 300000);
      return fallback;
    }

    try {
      const params = {
        email: this.email,
        key: this.apiKey,
        country: 'Philippines',
        limit: sanitizedLimit.toString(),
        order: 'desc',
        sort: 'event_date',
      };

      const response = await firstValueFrom(
        this.httpService.get(this.baseUrl, {
          params,
          timeout: 15000,
        }),
      );

      const results = Array.isArray(response.data?.data) ? response.data.data : [];

      const incidents = results.map((item: any) => ({
        eventDate: item.event_date || null,
        eventType: item.event_type || null,
        subEventType: item.sub_event_type || null,
        actors: [item.actor1, item.actor2].filter(Boolean),
        admin1: item.admin1 || null,
        location: item.location || null,
        coordinates:
          item.latitude && item.longitude
            ? {
                lat: Number(item.latitude),
                lon: Number(item.longitude),
              }
            : null,
        fatalities: item.fatalities !== undefined && item.fatalities !== null ? Number(item.fatalities) : null,
        notes: item.notes || '',
        source: item.source || item.data_source || 'ACLED',
      }));

      const payload = {
        count: incidents.length,
        incidents,
        source: 'ACLED API',
        lastUpdated: new Date().toISOString(),
        note: `Most recent ${incidents.length} incidents for the Philippines as reported by ACLED.`,
      };

      await this.cacheManager.set(cacheKey, payload, 900000); // 15 minutes

      return payload;
    } catch (error) {
      this.logger.error('Error fetching ACLED incidents:', error.message);

      return {
        count: 0,
        incidents: [],
        source: 'ACLED API',
        note: 'Unable to reach ACLED. Verify credentials, network access, and rate limits.',
        error: error.message,
        lastUpdated: new Date().toISOString(),
      };
    }
  }
}
