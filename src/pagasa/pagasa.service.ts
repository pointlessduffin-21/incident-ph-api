import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import * as cheerio from 'cheerio';
import { chromium } from 'playwright';
import { firstValueFrom } from 'rxjs';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class PagasaService {
  private readonly logger = new Logger(PagasaService.name);
  private readonly baseUrl: string;
  private readonly twitterUrl: string;
  private readonly twitterProxyBase: string;
  private readonly pagasaHandle: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.baseUrl = this.configService.get('PAGASA_BASE_URL') || 
                   'https://www.pagasa.dost.gov.ph';
    this.twitterUrl = this.configService.get('PAGASA_TWITTER_URL') || 'https://x.com/dost_pagasa';
    this.twitterProxyBase = this.configService.get('TWITTER_PROXY_BASE') || 'https://r.jina.ai/https://x.com';
    this.pagasaHandle = this.extractHandle(this.twitterUrl) || 'dost_pagasa';
  }

  async getWeatherForecast() {
    const cacheKey = 'pagasa:forecast';
    
    try {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        this.logger.log('Returning cached PAGASA forecast data');
        return cached;
      }

      this.logger.log('Fetching PAGASA updates...');

      let tweets: any[] = [];

      try {
        tweets = await this.fetchTweetsViaPlaywright();
      } catch (playwrightError) {
        const message = playwrightError instanceof Error ? playwrightError.message : String(playwrightError);
        this.logger.warn(`Playwright scraping failed (${message}). Falling back to proxy feed...`);
        tweets = await this.fetchTweetsViaProxy();
      }

      if (tweets.length === 0) {
        this.logger.warn('No PAGASA tweets retrieved from any source; returning placeholder data');
        tweets.push({
          text: 'No current PAGASA updates found. Please check https://x.com/dost_pagasa for latest weather information.',
          timestamp: new Date().toISOString(),
          type: 'info',
          source: 'System',
        });
      }

      const forecast = {
        count: tweets.length,
        updates: tweets,
        source: 'PAGASA Twitter (@dost_pagasa)',
        lastUpdated: new Date().toISOString(),
      };

      await this.cacheManager.set(cacheKey, forecast, 1800000); // 30 minutes
      
      // Persist normalized updates for durability/analytics
      await this.persistUpdates(tweets);

      return forecast;
      
    } catch (error) {
      this.logger.error('Error fetching PAGASA forecast:', error.message);
      
      // Return fallback data
      return {
        count: 0,
        updates: [],
        source: 'PAGASA (Data temporarily unavailable)',
        note: 'For real-time updates, visit https://x.com/dost_pagasa or configure TWITTER_PROXY_BASE for scraping.',
        error: 'Unable to fetch data. Please check official sources.',
        lastUpdated: new Date().toISOString(),
      };
    }
  }



  async getSevereWeather() {
    const cacheKey = 'pagasa:severe-weather';
    
    try {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Get tweets and filter for warnings/advisories
      const forecast: any = await this.getWeatherForecast();
      
      const severeWeather = {
        count: 0,
        warnings: [],
        advisories: [],
        source: 'PAGASA Twitter (@dost_pagasa)',
        lastUpdated: new Date().toISOString(),
      };

      if (forecast.updates) {
        forecast.updates.forEach((tweet: any) => {
          const text = tweet.text.toLowerCase();
          if (text.includes('warning') || text.includes('alert')) {
            severeWeather.warnings.push(tweet);
            severeWeather.count++;
          } else if (text.includes('advisory')) {
            severeWeather.advisories.push(tweet);
            severeWeather.count++;
          }
        });
      }

      await this.cacheManager.set(cacheKey, severeWeather, 600000); // 10 minutes
      
      return severeWeather;
    } catch (error) {
      this.logger.error('Error fetching severe weather:', error.message);
      
      // Return informative fallback
      return {
        count: 0,
        warnings: [],
        advisories: [],
        source: 'PAGASA (Data temporarily unavailable)',
        note: 'For real-time severe weather updates, visit https://www.pagasa.dost.gov.ph or follow https://x.com/dost_pagasa',
        error: 'Unable to fetch data. Please check PAGASA official sources.',
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  async getTropicalCyclones() {
    const cacheKey = 'pagasa:tropical-cyclones';
    
    try {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Get tweets and filter for tropical cyclone information
      const forecast: any = await this.getWeatherForecast();
      
      const cyclones = {
        count: 0,
        updates: [],
        source: 'PAGASA Twitter (@dost_pagasa)',
        lastUpdated: new Date().toISOString(),
      };

      if (forecast.updates) {
        forecast.updates.forEach((tweet: any) => {
          const text = tweet.text.toLowerCase();
          if (text.includes('tropical') || 
              text.includes('cyclone') || 
              text.includes('typhoon') ||
              text.includes('depression') ||
              text.includes('storm')) {
            cyclones.updates.push(tweet);
            cyclones.count++;
          }
        });
      }

      await this.cacheManager.set(cacheKey, cyclones, 600000); // 10 minutes
      
      return cyclones;
    } catch (error) {
      this.logger.error('Error fetching tropical cyclones:', error.message);
      
      // Return informative fallback data
      return {
        count: 0,
        updates: [],
        source: 'PAGASA (Data temporarily unavailable)',
        note: 'For real-time updates, visit https://www.pagasa.dost.gov.ph or follow https://x.com/dost_pagasa on Twitter/X',
        error: 'Unable to fetch data. Please check PAGASA official sources.',
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  private async fetchTweetsViaPlaywright(): Promise<any[]> {
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
      await page.goto(this.twitterUrl, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      await page.waitForSelector('article[data-testid="tweet"]', { timeout: 10000 });

      return await page.evaluate(() => {
        const tweetElements = document.querySelectorAll('article[data-testid="tweet"]');
        const extractedTweets = [];

        tweetElements.forEach((article, index) => {
          if (index >= 20) return;

          const tweetTextElement = article.querySelector('[data-testid="tweetText"]');
          const text = tweetTextElement ? tweetTextElement.textContent : '';

          const timeElement = article.querySelector('time');
          const timestamp = timeElement ? timeElement.getAttribute('datetime') : new Date().toISOString();

          if (text && text.length > 20) {
            let type = 'general';
            const lowerText = text.toLowerCase();

            if (lowerText.includes('warning') || lowerText.includes('advisory')) {
              type = 'warning';
            } else if (lowerText.includes('forecast')) {
              type = 'forecast';
            } else if (lowerText.includes('tropical') || lowerText.includes('cyclone') || lowerText.includes('typhoon')) {
              type = 'tropical_cyclone';
            }

            const statusAnchor = article.querySelector<HTMLAnchorElement>('a[href*="/status/"]');
            const url = statusAnchor ? statusAnchor.href : undefined;

            extractedTweets.push({
              text: text.trim(),
              timestamp: timestamp,
              type: type,
              source: 'PAGASA Twitter',
              url,
            });
          }
        });

        return extractedTweets;
      });
    } finally {
      await browser.close();
    }
  }

  private async fetchTweetsViaProxy(): Promise<any[]> {
    try {
      const url = this.buildProxyUrl(this.pagasaHandle);
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

      const payload = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      const lines = payload
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .filter(line => !line.startsWith('[') && !line.startsWith('!['))
        .filter(line => line.toLowerCase() !== 'pinned')
        .filter(line => !line.toLowerCase().includes("'s posts"))
        .filter(line => !line.toLowerCase().includes('’s posts'))
        .filter(line => !line.startsWith('Published Time:'))
        .filter(line => !line.startsWith('The official Twitter account'));

      return lines
        .filter(line => line.length > 40)
        .slice(0, 20)
        .map(line => {
          const normalized = this.normalizeMarkdown(line);
          return {
            text: normalized,
            timestamp: new Date().toISOString(),
            type: this.classifyTweet(normalized),
            source: 'PAGASA Twitter (proxy)',
            url: this.twitterUrl,
          };
        });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Proxy feed scraping failed: ${message}`);
      return [];
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

  private classifyTweet(text: string): string {
    const lower = text.toLowerCase();

    if (lower.includes('warning') || lower.includes('advisory') || lower.includes('thunderstorm advisory')) {
      return 'warning';
    }

    if (lower.includes('tropical') || lower.includes('cyclone') || lower.includes('typhoon') || lower.includes('storm')) {
      return 'tropical_cyclone';
    }

    if (lower.includes('forecast')) {
      return 'forecast';
    }

    return 'general';
  }

  private normalizeMarkdown(text: string): string {
    return text
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private async persistUpdates(updates: any[]): Promise<void> {
    try {
      const dir = path.resolve(process.cwd(), 'data');
      const filePath = path.join(dir, 'pagasa-updates.json');
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
      updates.forEach(a => map.set(key(a), a));

      const merged = Array.from(map.values())
        .sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));

      await fs.writeFile(filePath, JSON.stringify(merged, null, 2), 'utf-8');
    } catch (err: any) {
      this.logger.warn(`Failed to persist PAGASA updates: ${err?.message || err}`);
    }
  }

  private extractText($: cheerio.CheerioAPI, selector: string): string {
    const element = $(selector).first();
    return element.text().trim() || 'No data available';
  }

  private extractRegionalForecasts($: cheerio.CheerioAPI): any[] {
    const forecasts = [];
    
    $('.forecast-region, .region-forecast, .regional-weather').each((i, elem) => {
      const region = $(elem).find('.region-name, h3, h4').first().text().trim();
      const forecast = $(elem).find('.forecast-text, p').first().text().trim();
      
      if (region || forecast) {
        forecasts.push({
          region: region || `Region ${i + 1}`,
          forecast: forecast || 'No forecast available',
        });
      }
    });

    // If no regional forecasts found, try alternative structure
    if (forecasts.length === 0) {
      const regions = [
        'Metro Manila', 'Luzon', 'Visayas', 'Mindanao',
        'Ilocos Region', 'Cordillera', 'Cagayan Valley', 'Central Luzon',
        'CALABARZON', 'MIMAROPA', 'Bicol Region', 'Western Visayas',
        'Central Visayas', 'Eastern Visayas', 'Zamboanga Peninsula',
        'Northern Mindanao', 'Davao Region', 'SOCCSKSARGEN', 'Caraga', 'BARMM'
      ];

      regions.forEach(region => {
        forecasts.push({
          region,
          forecast: 'Forecast data will be updated from PAGASA website',
        });
      });
    }

    return forecasts;
  }

  private extractWarnings($: cheerio.CheerioAPI): string[] {
    const warnings = [];
    
    $('.warning, .alert, .weather-warning, .advisory').each((i, elem) => {
      const warning = $(elem).text().trim();
      if (warning) {
        warnings.push(warning);
      }
    });

    return warnings;
  }

  private extractActiveCyclones($: cheerio.CheerioAPI): any[] {
    const cyclones = [];
    
    $('.cyclone-info, .tc-bulletin, .tropical-cyclone').each((i, elem) => {
      const name = $(elem).find('.cyclone-name, .tc-name, h3').first().text().trim();
      const status = $(elem).find('.cyclone-status, .tc-status').first().text().trim();
      const location = $(elem).find('.cyclone-location, .tc-location').first().text().trim();
      
      if (name || status || location) {
        cyclones.push({
          name: name || 'Unnamed',
          status: status || 'Unknown',
          location: location || 'Unknown',
          lastUpdate: new Date().toISOString(),
        });
      }
    });

    return cyclones;
  }

  private extractBulletins($: cheerio.CheerioAPI): any[] {
    const bulletins = [];
    
    $('.bulletin, .weather-bulletin, .announcement').each((i, elem) => {
      const title = $(elem).find('h3, h4, .bulletin-title').first().text().trim();
      const content = $(elem).find('p, .bulletin-content').first().text().trim();
      const date = $(elem).find('.date, .bulletin-date').first().text().trim();
      
      if (title || content) {
        bulletins.push({
          title: title || 'Weather Bulletin',
          content: content || 'No content available',
          date: date || new Date().toISOString(),
        });
      }
    });

    return bulletins;
  }

  private extractCycloneHistory($: cheerio.CheerioAPI): any[] {
    const history = [];
    
    $('.cyclone-history, .past-cyclones, .tc-history').each((i, elem) => {
      const name = $(elem).find('.name, h4').first().text().trim();
      const year = $(elem).find('.year').first().text().trim();
      
      if (name) {
        history.push({
          name,
          year: year || new Date().getFullYear().toString(),
        });
      }
    });

    return history;
  }
}



