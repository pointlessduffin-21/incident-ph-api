import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { chromium } from 'playwright';

@Injectable()
export class MmdaService {
  private readonly logger = new Logger(MmdaService.name);
  private readonly mmdaTwitterUrl: string;

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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.mmdaTwitterUrl = this.configService.get('MMDA_TWITTER_URL') || 'https://x.com/mmda';
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

      this.logger.log('Scraping MMDA Twitter feed for traffic alerts...');

      const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const context = await browser.newContext({
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 },
      });

      const page = await context.newPage();

      try {
        await page.goto(this.mmdaTwitterUrl, {
          waitUntil: 'networkidle',
          timeout: 30000,
        });

        await page.waitForSelector('article[data-testid="tweet"]', { timeout: 15000 });

        const alerts = await page.evaluate(() => {
          const tweetArticles = document.querySelectorAll('article[data-testid="tweet"]');
          const mmdaAlerts: any[] = [];

          tweetArticles.forEach((article, index) => {
            if (index >= 30) return; // only inspect the latest 30 tweets

            const tweetTextElement = article.querySelector('[data-testid="tweetText"]');
            const text = tweetTextElement ? tweetTextElement.textContent?.trim() || '' : '';

            if (!text) {
              return;
            }

            const normalized = text.replace(/\s+/g, ' ').trim();
            if (!normalized.toUpperCase().startsWith('MMDA ALERT')) {
              return;
            }

            const timeElement = article.querySelector('time');
            const timestamp = timeElement ? timeElement.getAttribute('datetime') : new Date().toISOString();

            const statusAnchor = article.querySelector<HTMLAnchorElement>('a[href*="/status/"]');
            const tweetUrl = statusAnchor ? statusAnchor.href : 'https://x.com/mmda';

            mmdaAlerts.push({
              text: normalized,
              timestamp,
              url: tweetUrl,
              type: 'mmda_alert',
              source: 'MMDA Twitter (@MMDA)',
            });
          });

          return mmdaAlerts;
        });

        await browser.close();

        const alertsWithMetadata = alerts.map(alert => ({
          ...alert,
          lastSeen: new Date().toISOString(),
        }));

        if (alertsWithMetadata.length === 0) {
          this.logger.warn('No MMDA ALERT tweets detected in the latest feed');
        }

        const data = {
          count: alertsWithMetadata.length,
          alerts: alertsWithMetadata,
          source: 'MMDA Twitter Official Feed (@MMDA)',
          lastUpdated: new Date().toISOString(),
          note: 'Only tweets starting with "MMDA ALERT" are included.',
        };

        await this.cacheManager.set(cacheKey, data, 600000); // 10 minutes

        return data;
      } catch (browserError) {
        await browser.close();
        throw browserError;
      }
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
        note: 'Ensure the server can reach https://x.com/mmda and Playwright is installed.',
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
}



