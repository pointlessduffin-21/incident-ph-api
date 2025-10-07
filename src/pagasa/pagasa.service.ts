import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import * as cheerio from 'cheerio';
import { chromium } from 'playwright';

@Injectable()
export class PagasaService {
  private readonly logger = new Logger(PagasaService.name);
  private readonly baseUrl: string;
  private readonly twitterUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.baseUrl = this.configService.get('PAGASA_BASE_URL') || 
                   'https://www.pagasa.dost.gov.ph';
    this.twitterUrl = 'https://x.com/dost_pagasa';
  }

  async getWeatherForecast() {
    const cacheKey = 'pagasa:forecast';
    
    try {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        this.logger.log('Returning cached PAGASA forecast data');
        return cached;
      }

      this.logger.log('Scraping PAGASA Twitter with Playwright...');

      // Launch browser with Playwright
      const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 }
      });
      
      const page = await context.newPage();
      
      try {
        // Navigate to PAGASA Twitter
        await page.goto(this.twitterUrl, { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });
        
        // Wait for tweets to load
        await page.waitForSelector('article[data-testid="tweet"]', { timeout: 10000 });
        
        // Extract tweets
        const tweets = await page.evaluate(() => {
          const tweetElements = document.querySelectorAll('article[data-testid="tweet"]');
          const extractedTweets = [];
          
          tweetElements.forEach((article, index) => {
            if (index >= 20) return; // Limit to 20 tweets
            
            // Extract tweet text
            const tweetTextElement = article.querySelector('[data-testid="tweetText"]');
            const text = tweetTextElement ? tweetTextElement.textContent : '';
            
            // Extract timestamp
            const timeElement = article.querySelector('time');
            const timestamp = timeElement ? timeElement.getAttribute('datetime') : new Date().toISOString();
            
            if (text && text.length > 20) {
              // Categorize tweet type
              let type = 'general';
              const lowerText = text.toLowerCase();
              
              if (lowerText.includes('warning') || lowerText.includes('advisory')) {
                type = 'warning';
              } else if (lowerText.includes('forecast')) {
                type = 'forecast';
              } else if (lowerText.includes('tropical') || 
                         lowerText.includes('cyclone') || 
                         lowerText.includes('typhoon')) {
                type = 'tropical_cyclone';
              }
              
              extractedTweets.push({
                text: text.trim(),
                timestamp: timestamp,
                type: type,
                source: 'PAGASA Twitter',
              });
            }
          });
          
          return extractedTweets;
        });
        
        await browser.close();
        
        // If no tweets found, provide fallback
        if (tweets.length === 0) {
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
        
        return forecast;
        
      } catch (pageError) {
        await browser.close();
        throw pageError;
      }
      
    } catch (error) {
      this.logger.error('Error fetching PAGASA forecast:', error.message);
      
      // Return fallback data
      return {
        count: 0,
        updates: [],
        source: 'PAGASA (Data temporarily unavailable)',
        note: 'For real-time updates, visit https://x.com/dost_pagasa or https://www.pagasa.dost.gov.ph',
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



