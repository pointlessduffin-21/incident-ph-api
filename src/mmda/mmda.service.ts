import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class MmdaService {
  private readonly logger = new Logger(MmdaService.name);
  private readonly mmdaTwitterUrl: string;
  private readonly twitterProxyBase: string;
  private readonly mmdaHandle: string;

  // Major highways with their coordinates
  private readonly highways = [
    { id: 'EDSA', name: 'EDSA', lat: 14.5547, lon: 121.0244 },
    { id: 'C5', name: 'C5 Road', lat: 14.5657, lon: 121.0658 },
    { id: 'Commonwealth', name: 'Commonwealth Avenue', lat: 14.6760, lon: 121.0560 },
    { id: 'Quezon', name: 'Quezon Avenue', lat: 14.6312, lon: 121.0195 },
    { id: 'Espana', name: 'España Boulevard', lat: 14.6078, lon: 120.9934 },
    { id: 'Marcos', name: 'Marcos Highway', lat: 14.6520, lon: 121.0760 },
    { id: 'Ortigas', name: 'Ortigas Avenue', lat: 14.5826, lon: 121.0573 },
    { id: 'Shaw', name: 'Shaw Boulevard', lat: 14.5813, lon: 121.0531 },
    { id: 'Roxas', name: 'Roxas Boulevard', lat: 14.5764, lon: 120.9822 },
    { id: 'SLEX', name: 'South Luzon Expressway', lat: 14.5195, lon: 121.0198 },
    { id: 'NLEX', name: 'North Luzon Expressway', lat: 14.6954, lon: 120.9848 },
    { id: 'Skyway', name: 'Skyway', lat: 14.5392, lon: 121.0074 },
  ];

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.mmdaTwitterUrl = this.configService.get('MMDA_TWITTER_URL') || 'https://x.com/mmda';
    this.twitterProxyBase = this.configService.get('TWITTER_PROXY_BASE') || 'https://r.jina.ai/https://x.com';
    this.mmdaHandle = this.extractHandle(this.mmdaTwitterUrl) || 'mmda';
  }

  async getTrafficData() {
    const cacheKey = 'mmda:traffic:alerts';
    
    try {
      // Check cache first
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        this.logger.log('Returning cached MMDA ALERT feed');
        return cached;
      }

      this.logger.log('Fetching MMDA alerts via Twitter proxy feed...');

      const feed = await this.fetchTwitterFeed(this.mmdaHandle);
      const parsedAlerts = this.extractMmdaAlerts(feed);

      if (parsedAlerts.length === 0) {
        this.logger.warn('No MMDA ALERT tweets detected in the proxy feed');
      }

      const alertsWithMetadata = parsedAlerts.map(alert => ({
        ...alert,
        lastSeen: new Date().toISOString(),
      }));

      const data = {
        count: alertsWithMetadata.length,
        alerts: alertsWithMetadata,
        source: 'MMDA Twitter feed via public proxy (@MMDA)',
        lastUpdated: new Date().toISOString(),
        note: 'Only tweets starting with "MMDA ALERT" are included.',
      };

      await this.cacheManager.set(cacheKey, data, 600000); // 10 minutes

      // Persist normalized alerts for durability/analytics
      await this.persistAlerts(alertsWithMetadata);

      return data;
    } catch (error) {
      this.logger.error('Error fetching MMDA traffic alerts:', error.message);
      
      // Return fallback data
      return {
        count: 0,
        alerts: [{
          text: 'MMDA traffic alerts temporarily unavailable. Please visit https://x.com/mmda for real-time updates.',
          timestamp: new Date().toISOString(),
          type: 'info',
          source: 'System',
          severity: 'info',
        }],
        source: 'MMDA Alert Service',
        note: 'Ensure the server can reach https://x.com/mmda or configure TWITTER_PROXY_BASE.',
        error: error.message,
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  async getHighways() {
    const cacheKey = 'mmda:highways';
    
    try {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Return list of major Metro Manila highways with details
      const data = {
        highways: this.highways.map(h => ({
          id: h.id,
          name: h.name,
          coordinates: { lat: h.lat, lon: h.lon },
        })),
        count: this.highways.length,
        note: 'For real-time traffic alerts, check /api/mmda/traffic',
      };
      
      await this.cacheManager.set(cacheKey, data, 600000); // 10 minutes
      
      return data;
    } catch (error) {
      this.logger.error('Error fetching highways:', error.message);
      throw new HttpException(
        'Failed to fetch highways',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async getSegments() {
    const cacheKey = 'mmda:segments';
    
    try {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Return information about data source
      const data = {
        message: 'Road segment details are derived from MMDA ALERT tweets',
        note: 'Check /api/mmda/traffic for the latest official advisories',
        suggestion: 'Use keyword filtering on traffic alerts to extract specific road segments',
      };
      
      await this.cacheManager.set(cacheKey, data, 600000); // 10 minutes
      
      return data;
    } catch (error) {
      this.logger.error('Error fetching MMDA segments:', error.message);
      throw new HttpException(
        'Failed to fetch MMDA segments',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async getTrafficByHighway(highwayId: string) {
    try {
      const trafficData: any = await this.getTrafficData();
      
      if (!trafficData || !trafficData.alerts) {
        return {
          highway: highwayId,
          alerts: [],
          note: 'No data available',
        };
      }

      // Filter alerts that mention the highway
      const filteredAlerts = trafficData.alerts.filter(
        (alert: any) => alert.text?.toLowerCase().includes(highwayId.toLowerCase())
      );

      return {
        highway: highwayId,
        count: filteredAlerts.length,
        alerts: filteredAlerts,
        lastUpdated: trafficData.lastUpdated,
        source: trafficData.source,
      };
    } catch (error) {
      this.logger.error(`Error fetching traffic for highway ${highwayId}:`, error.message);
      throw error;
    }
  }

  private extractHandle(url: string): string {
    return url
      .replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//i, '')
      .replace(/^@/, '')
      .split(/[/?]/)[0]
      .trim();
  }

  private buildProxyUrl(handle: string): string {
    const base = (this.twitterProxyBase || '').replace(/\/$/, '');
    if (!base) {
      return `https://r.jina.ai/https://x.com/${handle}`;
    }

    if (base.includes('{handle}')) {
      return base.replace('{handle}', handle);
    }

    return `${base}/${handle}`;
  }

  private async fetchTwitterFeed(handle: string): Promise<string> {
    const url = this.buildProxyUrl(handle);
    const response = await firstValueFrom(
      this.httpService.get(url, {
        timeout: 15000,
        headers: {
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      }),
    );

    return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
  }

  private extractMmdaAlerts(feed: string) {
    const lines = feed
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const alerts = lines
      .filter(line => line.toUpperCase().startsWith('MMDA ALERT'))
      .slice(0, 30)
      .map(line => {
        const text = this.normalizeMarkdown(line);
        return {
          text,
          timestamp: this.deriveTimestamp(text),
          url: this.mmdaTwitterUrl,
          type: 'mmda_alert',
          source: 'MMDA Twitter (@MMDA)',
        };
      });

    return alerts;
  }

  private normalizeMarkdown(text: string): string {
    return text
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private deriveTimestamp(text: string): string {
    const match = text.match(/as of ([0-9]{1,2}:[0-9]{2} [AP]M)/i);
    if (!match) {
      return new Date().toISOString();
    }

    const timeString = match[1];
    const now = new Date();
    const [time, meridiem] = timeString.split(' ');
    const [hoursPart, minutesPart] = time.split(':');
    let hours = parseInt(hoursPart, 10);
    const minutes = parseInt(minutesPart, 10);

    if (meridiem.toUpperCase() === 'PM' && hours < 12) {
      hours += 12;
    }

    if (meridiem.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }

    const timestamp = new Date(now);
    timestamp.setHours(hours, minutes, 0, 0);

    // If the derived time is in the future (e.g., past midnight), roll back one day
    if (timestamp.getTime() > now.getTime()) {
      timestamp.setDate(timestamp.getDate() - 1);
    }

    return timestamp.toISOString();
  }

  private async persistAlerts(alerts: any[]): Promise<void> {
    try {
      const dir = path.resolve(process.cwd(), 'data');
      const filePath = path.join(dir, 'mmda-alerts.json');
      await fs.mkdir(dir, { recursive: true });

      let existing: any[] = [];
      try {
        const raw = await fs.readFile(filePath, 'utf-8');
        existing = JSON.parse(raw);
      } catch (_) {
        existing = [];
      }

      // De-duplicate by text+timestamp
      const key = (a: any) => `${a.text}|${a.timestamp}`;
      const map = new Map(existing.map(a => [key(a), a]));
      alerts.forEach(a => map.set(key(a), a));

      const merged = Array.from(map.values())
        .sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));

      await fs.writeFile(filePath, JSON.stringify(merged, null, 2), 'utf-8');
    } catch (err: any) {
      this.logger.warn(`Failed to persist MMDA alerts: ${err?.message || err}`);
    }
  }
}



