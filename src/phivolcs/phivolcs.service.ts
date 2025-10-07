import { Injectable, Logger, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';

@Injectable()
export class PhivolcsService {
  private readonly logger = new Logger(PhivolcsService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.baseUrl = this.configService.get('PHIVOLCS_BASE_URL') || 
                   'https://earthquake.phivolcs.dost.gov.ph';
  }

  async getEarthquakes() {
    const cacheKey = 'phivolcs:earthquakes';
    
    try {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        this.logger.log('Returning cached PHIVOLCS earthquake data');
        return cached;
      }

      // Try PHIVOLCS Earthquake website first
      const url = `${this.baseUrl}`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          httpsAgent: new (require('https').Agent)({
            rejectUnauthorized: false, // Handle SSL certificate issues
          }),
          timeout: 10000,
        })
      );

      const $ = cheerio.load(response.data);
      
      const earthquakes = this.extractEarthquakesFromOfficial($);

      const data = {
        count: earthquakes.length,
        earthquakes,
        source: 'PHIVOLCS Earthquake Information',
        lastUpdated: new Date().toISOString(),
      };

      await this.cacheManager.set(cacheKey, data, 300000); // 5 minutes
      
      return data;
    } catch (error) {
      this.logger.error('Error fetching PHIVOLCS earthquake data:', error.message);
      
      // Return sample data structure so API doesn't fail
      const fallbackData = {
        count: 0,
        earthquakes: [],
        source: 'PHIVOLCS (Data temporarily unavailable)',
        note: 'Check https://earthquake.phivolcs.dost.gov.ph/ or https://x.com/phivolcs_dost for real-time updates',
        error: 'Unable to fetch data. Please check PHIVOLCS official sources.',
        lastUpdated: new Date().toISOString(),
      };
      
      return fallbackData;
    }
  }

  async getLatestEarthquake() {
    const cacheKey = 'phivolcs:latest-earthquake';
    
    try {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        return cached;
      }

      const earthquakesData: any = await this.getEarthquakes();
      
      const latest = earthquakesData.earthquakes && earthquakesData.earthquakes.length > 0
        ? earthquakesData.earthquakes[0]
        : null;

      const data = {
        earthquake: latest,
        lastUpdated: new Date().toISOString(),
      };

      await this.cacheManager.set(cacheKey, data, 300000); // 5 minutes
      
      return data;
    } catch (error) {
      this.logger.error('Error fetching latest earthquake:', error.message);
      throw error;
    }
  }

  async getVolcanoes() {
    const cacheKey = 'phivolcs:volcanoes';
    
    try {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        this.logger.log('Returning cached PHIVOLCS volcano data');
        return cached;
      }

      // Try main PHIVOLCS website for volcano data
      const url = 'https://www.phivolcs.dost.gov.ph';
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          httpsAgent: new (require('https').Agent)({
            rejectUnauthorized: false,
          }),
          timeout: 10000,
        })
      );

      const $ = cheerio.load(response.data);
      
      const volcanoes = this.extractVolcanoes($);

      const data = {
        count: volcanoes.length,
        volcanoes,
        source: 'PHIVOLCS',
        lastUpdated: new Date().toISOString(),
      };

      await this.cacheManager.set(cacheKey, data, 600000); // 10 minutes
      
      return data;
    } catch (error) {
      this.logger.error('Error fetching PHIVOLCS volcano data:', error.message);
      
      // Return major Philippine volcanoes with default data
      const fallbackData = {
        count: 5,
        volcanoes: [
          {
            name: 'Mayon Volcano',
            location: 'Albay',
            alertLevel: 'Check official sources',
            status: 'Visit https://x.com/phivolcs_dost for updates',
            lastUpdate: new Date().toISOString(),
          },
          {
            name: 'Taal Volcano',
            location: 'Batangas',
            alertLevel: 'Check official sources',
            status: 'Visit https://x.com/phivolcs_dost for updates',
            lastUpdate: new Date().toISOString(),
          },
          {
            name: 'Kanlaon Volcano',
            location: 'Negros Island',
            alertLevel: 'Check official sources',
            status: 'Visit https://x.com/phivolcs_dost for updates',
            lastUpdate: new Date().toISOString(),
          },
          {
            name: 'Pinatubo Volcano',
            location: 'Zambales',
            alertLevel: 'Check official sources',
            status: 'Visit https://x.com/phivolcs_dost for updates',
            lastUpdate: new Date().toISOString(),
          },
          {
            name: 'Bulusan Volcano',
            location: 'Sorsogon',
            alertLevel: 'Check official sources',
            status: 'Visit https://x.com/phivolcs_dost for updates',
            lastUpdate: new Date().toISOString(),
          },
        ],
        source: 'PHIVOLCS (Static list)',
        note: 'For real-time updates, visit https://earthquake.phivolcs.dost.gov.ph/ or https://x.com/phivolcs_dost',
        lastUpdated: new Date().toISOString(),
      };
      
      return fallbackData;
    }
  }

  async getVolcanoByName(name: string) {
    try {
      const volcanoes: any = await this.getVolcanoes();
      
      const volcano = volcanoes.volcanoes.find(
        (v: any) => v.name.toLowerCase().includes(name.toLowerCase())
      );

      if (!volcano) {
        throw new HttpException(
          `Volcano '${name}' not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        volcano,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error fetching volcano ${name}:`, error.message);
      throw error;
    }
  }

  private extractEarthquakesFromOfficial($: cheerio.CheerioAPI): any[] {
    const earthquakes = [];
    
    // Try to extract from table
    $('table tbody tr, .earthquake-list tr').each((i, row) => {
      const $row = $(row);
      const cells = $row.find('td');
      
      if (cells.length >= 4) {
        const dateTime = $(cells[0]).text().trim();
        const latitude = $(cells[1]).text().trim();
        const longitude = $(cells[2]).text().trim();
        const depth = $(cells[3]).text().trim();
        const magnitude = $(cells[4]).text().trim();
        const location = $(cells[5]).text().trim();
        
        if (dateTime && magnitude) {
          earthquakes.push({
            dateTime,
            latitude: latitude || 'N/A',
            longitude: longitude || 'N/A',
            depth: depth || 'N/A',
            magnitude: magnitude || 'N/A',
            location: location || 'Unknown',
          });
        }
      }
    });

    // If no data found in table, provide sample structure
    if (earthquakes.length === 0) {
      earthquakes.push({
        dateTime: new Date().toISOString(),
        latitude: 'N/A',
        longitude: 'N/A',
        depth: 'N/A',
        magnitude: 'N/A',
        location: 'Data will be updated from PHIVOLCS website',
        note: 'Please check PHIVOLCS official website for real-time earthquake data',
      });
    }

    return earthquakes;
  }

  private extractVolcanoes($: cheerio.CheerioAPI): any[] {
    const volcanoes = [];
    
    // Try to extract volcano bulletins
    $('.volcano-bulletin, .bulletin-item, table tbody tr').each((i, elem) => {
      const $elem = $(elem);
      
      // Try table row format
      const cells = $elem.find('td');
      if (cells.length >= 3) {
        const name = $(cells[0]).text().trim();
        const alertLevel = $(cells[1]).text().trim();
        const status = $(cells[2]).text().trim();
        
        if (name) {
          volcanoes.push({
            name,
            alertLevel: alertLevel || 'N/A',
            status: status || 'Normal',
            lastUpdate: new Date().toISOString(),
          });
        }
      } else {
        // Try bulletin format
        const name = $elem.find('.volcano-name, h3, h4').first().text().trim();
        const alertLevel = $elem.find('.alert-level, .level').first().text().trim();
        const status = $elem.find('.status, .volcano-status').first().text().trim();
        
        if (name) {
          volcanoes.push({
            name,
            alertLevel: alertLevel || 'N/A',
            status: status || 'Normal',
            lastUpdate: new Date().toISOString(),
          });
        }
      }
    });

    // If no volcanoes found, add major Philippine volcanoes with default data
    if (volcanoes.length === 0) {
      const majorVolcanoes = [
        { name: 'Mayon Volcano', location: 'Albay' },
        { name: 'Taal Volcano', location: 'Batangas' },
        { name: 'Pinatubo Volcano', location: 'Zambales' },
        { name: 'Kanlaon Volcano', location: 'Negros Island' },
        { name: 'Bulusan Volcano', location: 'Sorsogon' },
      ];

      majorVolcanoes.forEach(v => {
        volcanoes.push({
          name: v.name,
          location: v.location,
          alertLevel: 'N/A',
          status: 'Data will be updated from PHIVOLCS website',
          lastUpdate: new Date().toISOString(),
          note: 'Please check PHIVOLCS official website for real-time volcano monitoring',
        });
      });
    }

    return volcanoes;
  }
}



