import { Injectable, Logger, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';

interface TideEvent {
  type: string;
  time: string;
  heightMeters: number;
  heightFeet: number;
}

interface TideDay {
  date: string;
  events: TideEvent[];
}

@Injectable()
export class TideService {
  private readonly logger = new Logger(TideService.name);
  private readonly BASE_URL = 'https://www.tide-forecast.com/locations';
  private readonly CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

  // Philippine coastal locations
  private readonly LOCATIONS = [
    { slug: 'cordova-1', name: 'Cordova' },
    { slug: 'manila-bay', name: 'Manila Bay' },
    { slug: 'cebu-city', name: 'Cebu City' },
    { slug: 'davao-gulf', name: 'Davao Gulf' },
    { slug: 'subic-bay', name: 'Subic Bay' },
    { slug: 'puerto-princesa', name: 'Puerto Princesa' },
  ];

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async fetchTideForecast(locationSlug: string) {
    const cacheKey = `tide_${locationSlug}`;

    try {
      // Check cache first
      const cachedData = await this.cacheManager.get(cacheKey);
      if (cachedData) {
        this.logger.log(`Returning cached tide data for ${locationSlug}`);
        return cachedData;
      }

      // Fetch fresh data
      const url = `${this.BASE_URL}/${locationSlug}/tides/latest`;
      this.logger.log(`Fetching tide data from: ${url}`);

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          },
        }),
      );

      const tideData = this.parseTideData(response.data, locationSlug);

      // Cache the result
      await this.cacheManager.set(cacheKey, tideData, this.CACHE_TTL);

      return tideData;
    } catch (error) {
      this.logger.error(
        `Error fetching tide data for ${locationSlug}:`,
        error.message,
      );
      throw new Error(`Failed to fetch tide forecast: ${error.message}`);
    }
  }

  private parseTideData(html: string, locationSlug: string) {
    const $ = cheerio.load(html);
    const tides: TideDay[] = [];

    // Extract location name and timezone
    const locationName =
      this.LOCATIONS.find((loc) => loc.slug === locationSlug)?.name ||
      locationSlug;
    const timezoneMatch = html.match(/Tide Times are ([^.]+)\./);
    const timezone = timezoneMatch ? timezoneMatch[1] : 'PST (UTC +8.0hrs)';

    // Parse each tide day section
    $('.tide-day').each((_, dayElement) => {
      const dateHeader = $(dayElement).find('.tide-day__date').text().trim();
      const dateMatch = dateHeader.match(/Tide Times for .+: (.+)/);
      const date = dateMatch ? dateMatch[1] : dateHeader;

      const events: TideEvent[] = [];

      // Parse tide events (High/Low Tide rows)
      $(dayElement)
        .find('table.tide-day-tides tr')
        .each((_, row) => {
          const cells = $(row).find('td');
          if (cells.length >= 3) {
            const type = $(cells[0]).text().trim();
            if (type === 'High Tide' || type === 'Low Tide') {
              const timeText = $(cells[1]).find('b').text().trim();
              const heightText = $(cells[2])
                .find('.js-two-units-length-value__primary')
                .text()
                .trim();
              const heightFeetText = $(cells[2])
                .find('.js-two-units-length-value__secondary')
                .text()
                .trim();

              // Extract numeric values
              const heightMeters = parseFloat(heightText.replace(/[^\d.-]/g, ''));
              const heightFeet = parseFloat(
                heightFeetText.replace(/[^\d.-]/g, ''),
              );

              events.push({
                type,
                time: timeText,
                heightMeters: isNaN(heightMeters) ? 0 : heightMeters,
                heightFeet: isNaN(heightFeet) ? 0 : heightFeet,
              });
            }
          }
        });

      if (events.length > 0) {
        tides.push({ date, events });
      }
    });

    return {
      location: locationName,
      timezone,
      tides,
      cachedAt: new Date().toISOString(),
    };
  }

  getAvailableLocations() {
    return {
      locations: this.LOCATIONS,
    };
  }
}
