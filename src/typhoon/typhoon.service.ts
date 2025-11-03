import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TyphoonService {
  private readonly logger = new Logger(TyphoonService.name);
  private readonly jtwcRssUrl = 'https://www.metoc.navy.mil/jtwc/rss/jtwc.rss';
  private readonly gdacsApiUrl = 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/TC';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getActiveTyphoons() {
    const cacheKey = 'typhoon:active';

    try {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        this.logger.log('Returning cached typhoon data');
        return cached;
      }

      this.logger.log('Fetching fresh typhoon data from multiple sources...');

      // Fetch from both sources in parallel
      const [jtwcData, gdacsData] = await Promise.allSettled([
        this.fetchJTWCData(),
        this.fetchGDACSData(),
      ]);

      const typhoons = [];
      const sources = [];

      // Process JTWC data
      if (jtwcData.status === 'fulfilled' && jtwcData.value.length > 0) {
        typhoons.push(...jtwcData.value);
        sources.push('JTWC');
        this.logger.log(`Retrieved ${jtwcData.value.length} typhoons from JTWC`);
      } else {
        this.logger.warn('Failed to fetch JTWC data or no active typhoons');
      }

      // Process GDACS data
      if (gdacsData.status === 'fulfilled' && gdacsData.value.length > 0) {
        // Merge GDACS data, avoiding duplicates
        gdacsData.value.forEach(gdacsTyphoon => {
          const exists = typhoons.some(t => 
            t.internationalName?.toLowerCase() === gdacsTyphoon.internationalName?.toLowerCase()
          );
          if (!exists) {
            typhoons.push(gdacsTyphoon);
          }
        });
        sources.push('GDACS');
        this.logger.log(`Retrieved ${gdacsData.value.length} typhoons from GDACS`);
      } else {
        this.logger.warn('Failed to fetch GDACS data or no active typhoons');
      }

      const response = {
        success: true,
        count: typhoons.length,
        data: typhoons,
        timestamp: new Date().toISOString(),
        sources,
      };

      // Cache for 15 minutes
      await this.cacheManager.set(cacheKey, response, 900000);

      return response;
    } catch (error) {
      this.logger.error('Error fetching typhoon data:', error.message);
      return {
        success: false,
        count: 0,
        data: [],
        error: 'Unable to fetch typhoon data. Please try again later.',
        timestamp: new Date().toISOString(),
        sources: [],
      };
    }
  }

  async getJTWCData() {
    const cacheKey = 'typhoon:jtwc';

    try {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        return cached;
      }

      const data = await this.fetchJTWCData();
      const response = {
        success: true,
        count: data.length,
        data,
        source: 'JTWC (US Navy)',
        timestamp: new Date().toISOString(),
      };

      await this.cacheManager.set(cacheKey, response, 900000);
      return response;
    } catch (error) {
      this.logger.error('Error fetching JTWC data:', error.message);
      return {
        success: false,
        count: 0,
        data: [],
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getGDACSData() {
    const cacheKey = 'typhoon:gdacs';

    try {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        return cached;
      }

      const data = await this.fetchGDACSData();
      const response = {
        success: true,
        count: data.length,
        data,
        source: 'GDACS (UN/EC)',
        timestamp: new Date().toISOString(),
      };

      await this.cacheManager.set(cacheKey, response, 900000);
      return response;
    } catch (error) {
      this.logger.error('Error fetching GDACS data:', error.message);
      return {
        success: false,
        count: 0,
        data: [],
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  private async fetchJTWCData(): Promise<any[]> {
    try {
      // Use RSS2JSON proxy to bypass CORS
      const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(this.jtwcRssUrl)}`;
      
      const response = await firstValueFrom(
        this.httpService.get(proxyUrl, { timeout: 10000 })
      );

      const typhoons = [];
      const items = response.data?.items || [];

      for (const item of items) {
        const description = item.description || '';
        
        // Extract typhoon warnings using regex
        const typhoonPattern = /(Super Typhoon|Typhoon|Tropical Storm|Tropical Depression)\s+(\d+\w+)\s*\(([^)]+)\)\s*Warning\s*#(\d+)/gi;
        const matches = description.matchAll(typhoonPattern);

        for (const match of matches) {
          const category = match[1];
          const designation = match[2];
          const name = match[3];
          const warningNum = match[4];

          // Extract URLs from HTML
          const trackImageUrl = this.extractUrl(description, /href="([^"]+\.gif)"/);
          const satelliteImageUrl = this.extractUrl(description, /href="([^"]+sair\.jpg)"/);
          const advisoryUrl = this.extractUrl(description, /href="([^"]+web\.txt)"/);

          // Extract date if available
          const dateMatch = description.match(/(\d{2}\/\d{4}Z)/);
          const date = dateMatch ? dateMatch[1] : null;

          typhoons.push({
            name: `${category} ${designation} (${name})`,
            internationalName: name,
            designation,
            category,
            maxWinds: `Warning #${warningNum}`,
            date,
            affectedAreas: [item.title || 'Western Pacific'],
            status: 'Active',
            description: `Active tropical cyclone ${designation} (${name}). Latest warning #${warningNum} issued.`,
            source: 'JTWC (US Navy)',
            coordinates: null,
            trackImageUrl,
            satelliteImageUrl,
            advisoryUrl,
          });
        }
      }

      return typhoons;
    } catch (error) {
      this.logger.error('Error fetching JTWC RSS feed:', error.message);
      throw error;
    }
  }

  private async fetchGDACSData(): Promise<any[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(this.gdacsApiUrl, { timeout: 10000 })
      );

      const features = response.data?.features || [];
      const typhoons = [];

      for (const feature of features) {
        const props = feature.properties || {};
        const coords = feature.geometry?.coordinates || [];

        // Filter for Western Pacific region (0-30°N, 100-180°E)
        const lat = coords[1];
        const lon = coords[0];

        if (lat >= 0 && lat <= 30 && lon >= 100 && lon <= 180) {
          typhoons.push({
            name: props.eventname || 'Unknown',
            internationalName: props.eventname || 'Unknown',
            designation: props.eventid || 'N/A',
            category: 'Tropical Cyclone',
            maxWinds: null,
            date: props.fromdate || null,
            affectedAreas: props.country ? props.country.split(',').map(c => c.trim()) : [],
            status: props.alertlevel || 'Unknown',
            description: props.description || `Tropical cyclone ${props.eventname}`,
            source: 'GDACS',
            coordinates: coords.length >= 2 ? { lat: coords[1], lon: coords[0] } : null,
            trackImageUrl: null,
            satelliteImageUrl: null,
            advisoryUrl: `https://www.gdacs.org/report.aspx?eventid=${props.eventid}&eventtype=TC`,
          });
        }
      }

      return typhoons;
    } catch (error) {
      this.logger.error('Error fetching GDACS API:', error.message);
      throw error;
    }
  }

  private extractUrl(html: string, regex: RegExp): string | null {
    const match = html.match(regex);
    return match ? match[1] : null;
  }
}
