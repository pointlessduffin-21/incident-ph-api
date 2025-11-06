import axios from 'axios';

// Pagbilao, Quezon coordinates
export const PAGBILAO_COORDS = {
  lat: 13.9667,
  lon: 121.6833,
  name: 'Pagbilao, Quezon',
};

// Philippines center coordinates for typhoon search
export const PHILIPPINES_COORDS = {
  lat: 12.8797,
  lon: 121.7740,
};

export interface CurrentWeather {
  temp: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_deg: number;
  clouds: number;
  visibility: number;
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  dt: number;
}

export interface WeatherForecast {
  dt: number;
  temp: {
    day: number;
    min: number;
    max: number;
    night: number;
    eve: number;
    morn: number;
  };
  feels_like: {
    day: number;
    night: number;
    eve: number;
    morn: number;
  };
  pressure: number;
  humidity: number;
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  speed: number;
  deg: number;
  clouds: number;
  rain?: number;
  pop: number;
}

export interface TyphoonAlert {
  sender_name?: string;
  event: string;
  start: number;
  end: number;
  description: string;
  tags?: string[];
}

export interface WeatherResponse {
  current: CurrentWeather;
  daily?: WeatherForecast[];
  alerts?: TyphoonAlert[];
  timezone?: string;
}

const weatherClient = axios.create({
  timeout: 15000,
});

export async function getCurrentWeather(lat: number, lon: number, apiKey?: string): Promise<WeatherResponse> {
  const key = apiKey || import.meta.env.VITE_OPENWEATHER_KEY;
  if (!key) {
    throw new Error('OpenWeather API key is required. Set VITE_OPENWEATHER_KEY in your .env file.');
  }

  // Fetch current weather
  const currentResponse = await weatherClient.get(
    'https://api.openweathermap.org/data/2.5/weather',
    {
      params: {
        lat,
        lon,
        appid: key,
        units: 'metric',
      },
    }
  );

  // Fetch 7-day forecast
  const forecastResponse = await weatherClient.get(
    'https://api.openweathermap.org/data/2.5/forecast',
    {
      params: {
        lat,
        lon,
        appid: key,
        units: 'metric',
      },
    }
  );

  // Transform current weather data
  const current: CurrentWeather = {
    temp: currentResponse.data.main.temp,
    feels_like: currentResponse.data.main.feels_like,
    humidity: currentResponse.data.main.humidity,
    pressure: currentResponse.data.main.pressure,
    wind_speed: currentResponse.data.wind.speed,
    wind_deg: currentResponse.data.wind.deg,
    clouds: currentResponse.data.clouds.all,
    visibility: currentResponse.data.visibility,
    weather: currentResponse.data.weather,
    dt: currentResponse.data.dt,
  };

  // Transform forecast data - aggregate daily
  const dailyMap = new Map<string, any>();
  forecastResponse.data.list.forEach((item: any) => {
    const date = new Date(item.dt * 1000).toDateString();
    if (!dailyMap.has(date)) {
      dailyMap.set(date, {
        dt: item.dt,
        temps: [item.main.temp],
        temp_min: item.main.temp_min,
        temp_max: item.main.temp_max,
        humidity: item.main.humidity,
        pressure: item.main.pressure,
        weather: item.weather,
        clouds: item.clouds.all,
        wind_speed: item.wind.speed,
        wind_deg: item.wind.deg,
        pop: item.pop || 0,
        rain: item.rain?.['3h'] || 0,
      });
    } else {
      const existing = dailyMap.get(date);
      existing.temps.push(item.main.temp);
      existing.temp_min = Math.min(existing.temp_min, item.main.temp_min);
      existing.temp_max = Math.max(existing.temp_max, item.main.temp_max);
      existing.pop = Math.max(existing.pop, item.pop || 0);
      existing.rain += item.rain?.['3h'] || 0;
    }
  });

  // Convert to daily forecast format
  const daily: WeatherForecast[] = Array.from(dailyMap.values()).map((day) => ({
    dt: day.dt,
    temp: {
      day: day.temps.reduce((a: number, b: number) => a + b, 0) / day.temps.length,
      min: day.temp_min,
      max: day.temp_max,
      night: day.temps[day.temps.length - 1] || day.temp_min,
      eve: day.temps[Math.floor(day.temps.length / 2)] || day.temp_max,
      morn: day.temps[0] || day.temp_min,
    },
    feels_like: {
      day: day.temps.reduce((a: number, b: number) => a + b, 0) / day.temps.length,
      night: day.temps[day.temps.length - 1] || day.temp_min,
      eve: day.temps[Math.floor(day.temps.length / 2)] || day.temp_max,
      morn: day.temps[0] || day.temp_min,
    },
    pressure: day.pressure,
    humidity: day.humidity,
    weather: day.weather,
    speed: day.wind_speed,
    deg: day.wind_deg,
    clouds: day.clouds,
    rain: day.rain,
    pop: day.pop,
  }));

  return {
    current,
    daily,
    alerts: [],
    timezone: currentResponse.data.timezone ? `UTC+${currentResponse.data.timezone / 3600}` : undefined,
  };
}

// Function to check if an alert is typhoon-related
export function isTyphoonAlert(alert: TyphoonAlert): boolean {
  const text = `${alert.event} ${alert.description}`.toLowerCase();
  const keywords = ['typhoon', 'tropical cyclone', 'tropical storm', 'hurricane', 'tropical depression'];
  return keywords.some(keyword => text.includes(keyword));
}

// Philippine typhoon interface
export interface PhilippineTyphoon {
  name: string;
  internationalName?: string;
  category: string;
  maxWinds: string;
  date: string;
  affectedAreas: string[];
  status: 'Active' | 'Dissipated' | 'Past';
  description: string;
  source?: string;
  coordinates?: { lat: number; lon: number };
  trackImageUrl?: string;
  satelliteImageUrl?: string;
  advisoryUrl?: string;
}

// Fetch real typhoon data from multiple sources
export async function getPhilippineTyphoons(): Promise<PhilippineTyphoon[]> {
  const allTyphoons: PhilippineTyphoon[] = [];

  // Source 1: Try RSS2JSON service for JTWC RSS feed
  try {
    console.log('Fetching from JTWC via RSS2JSON...');
    const rssUrl = 'https://www.metoc.navy.mil/jtwc/rss/jtwc.rss';
    const { data } = await weatherClient.get(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`,
      { timeout: 8000 }
    );
    
    if (data.status === 'ok' && data.items && data.items.length > 0) {
      console.log(`Found ${data.items.length} items from JTWC RSS`);
      
      const jtwcTyphoons: PhilippineTyphoon[] = [];
      
      data.items.forEach((item: any) => {
        const description = item.description || item.content || '';
        const title = item.title || 'Unknown';
        
        // Extract typhoon warnings from the HTML content
        const typhoonMatches = description.matchAll(/(?:Typhoon|Super Typhoon|Tropical Storm|Tropical Depression)\s+(\d+\w+)\s*\(([^)]+)\)\s*Warning\s*#(\d+)/gi);
        
        for (const match of typhoonMatches) {
          const designation = match[1]; // e.g., "31W"
          const name = match[2]; // e.g., "Kalmaegi"
          const warningNum = match[3];
          const category = match[0].split(' ')[0] + ' ' + (match[0].split(' ')[1] || '').replace(/\s+\d+\w+/i, ''); // Extract category
          
          // Extract issued date from content
          const issuedMatch = description.match(/Issued at (\d{2}\/\d{4}Z)/i);
          const issuedDate = issuedMatch ? issuedMatch[1] : item.pubDate ? new Date(item.pubDate).toLocaleDateString() : 'Recent';
          
          // Determine affected region from title
          let region = 'Western Pacific';
          if (title.includes('Northwest Pacific') || title.includes('North Indian')) region = 'Northwest Pacific/North Indian Ocean';
          else if (title.includes('Central/Eastern Pacific')) region = 'Central/Eastern Pacific';
          else if (title.includes('Southern Hemisphere')) region = 'Southern Hemisphere';
          
          // Build product code from designation (e.g., "31W" -> "wp31")
          const productCode = `wp${designation.replace(/\D/g, '')}`;
          
          // Extract URLs matching this specific typhoon's product code
          const urlPattern = new RegExp(`href="([^"]*${productCode}[^"]*\\.(txt|gif|jpg|kmz))"`, 'gi');
          const urlMatches = description.matchAll(urlPattern);
          const urls: string[] = [];
          for (const match of urlMatches) {
            if (match[1]) urls.push(match[1]);
          }
          
          // Also match satellite imagery pattern: designation_timestamp.jpg (e.g., "31W_060000sair.jpg")
          const satPattern = new RegExp(`href="([^"]*${designation.replace('W', 'W_')}[^"]*sair\\.jpg)"`, 'i');
          const satMatch = description.match(satPattern);
          
          // Find specific URL types for this typhoon
          const warningTextUrl = urls.find(url => url && url.includes('web.txt'));
          const graphicUrl = urls.find(url => url && url.endsWith('.gif'));
          const satelliteUrl = satMatch ? satMatch[1] : urls.find(url => url && url.includes('sair.jpg'));
          
          jtwcTyphoons.push({
            name: `${category.trim()} ${designation} (${name})`,
            internationalName: name,
            category: category.trim(),
            maxWinds: `Warning #${warningNum}`,
            date: issuedDate,
            affectedAreas: [region],
            status: 'Active' as const,
            description: `Active tropical cyclone ${designation} (${name}). Latest warning #${warningNum} issued. JTWC official advisory with track forecast and satellite imagery available.`,
            source: 'JTWC (US Navy)',
            coordinates: undefined,
            trackImageUrl: graphicUrl,
            satelliteImageUrl: satelliteUrl,
            advisoryUrl: warningTextUrl,
          });
        }
        
        // If no specific typhoons found but item mentions "No Current Tropical Cyclone Warnings"
        if (jtwcTyphoons.length === 0 && !description.includes('No Current Tropical Cyclone Warnings')) {
          // Add the regional summary as an info card
          const region = title.replace('Current ', '').replace(' Systems', '');
          jtwcTyphoons.push({
            name: title,
            internationalName: title,
            category: 'Regional Summary',
            maxWinds: 'N/A',
            date: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : 'Recent',
            affectedAreas: [region],
            status: 'Active' as const,
            description: description.replace(/<[^>]*>/g, '').substring(0, 300).trim() || 'See JTWC for current tropical cyclone information.',
            source: 'JTWC (US Navy)',
            coordinates: undefined,
          });
        }
      });
      
      if (jtwcTyphoons.length > 0) {
        console.log(`✅ Parsed ${jtwcTyphoons.length} typhoons from JTWC`);
        allTyphoons.push(...jtwcTyphoons);
      }
    }
  } catch (error: any) {
    console.error('JTWC RSS fetch failed:', error.message);
  }

  // Source 2: Try GDACS as fallback
  try {
    console.log('Fetching from GDACS...');
    const gdacsStorms = await getGDACSTyphoons();
    
    if (gdacsStorms.length > 0) {
      console.log(`Found ${gdacsStorms.length} storms from GDACS`);
      const gdacsTyphoons = gdacsStorms.map((storm) => {
        const isActive = !storm.todate || new Date(storm.todate) > new Date();
        const category = storm.alertlevel === 'Red' ? 'Super Typhoon' : 
                        storm.alertlevel === 'Orange' ? 'Typhoon' : 
                        'Tropical Storm';
        
        return {
          name: storm.eventname || 'Unknown Storm',
          internationalName: storm.eventname,
          category,
          maxWinds: 'See GDACS for details',
          date: storm.fromdate 
            ? `${new Date(storm.fromdate).toLocaleDateString()}${storm.todate ? ' - ' + new Date(storm.todate).toLocaleDateString() : ' - Present'}`
            : 'Unknown',
          affectedAreas: storm.country ? storm.country.split(',').map(c => c.trim()) : ['Western Pacific'],
          status: isActive ? 'Active' as const : 'Past' as const,
          description: storm.description || `Active tropical cyclone monitored by GDACS. Alert Level: ${storm.alertlevel || 'Unknown'}. ${isActive ? 'Currently tracking across the region.' : 'System has dissipated.'}`,
          source: 'GDACS',
          coordinates: storm.lat && storm.lon ? { lat: storm.lat, lon: storm.lon } : undefined,
        };
      });
      
      allTyphoons.push(...gdacsTyphoons);
    }
  } catch (error) {
    console.error('GDACS fetch failed:', error);
  }

  // Source 3: Try backend PAGASA endpoint if available
  try {
    console.log('Trying backend PAGASA endpoint...');
    const response = await weatherClient.get('http://localhost:6144/api/pagasa/tropical-cyclones', {
      timeout: 3000,
    });
    
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      console.log(`Found ${response.data.length} storms from PAGASA backend`);
      const pagasaTyphoons = response.data.map((tc: any) => ({
        name: tc.name || tc.localName || 'Unknown',
        internationalName: tc.internationalName || tc.intlName,
        category: tc.category || tc.classification || 'Tropical Depression',
        maxWinds: tc.maxWinds || tc.windSpeed || 'N/A',
        date: tc.date || tc.dateRange || new Date().toISOString().split('T')[0],
        affectedAreas: tc.affectedAreas || tc.areas || [],
        status: tc.status || (tc.isActive ? 'Active' as const : 'Past' as const),
        description: tc.description || tc.remarks || '',
        source: 'PAGASA',
        coordinates: tc.coordinates || tc.position,
      }));
      
      allTyphoons.push(...pagasaTyphoons);
    }
  } catch (error) {
    console.warn('Backend PAGASA endpoint unavailable (this is expected if backend is off)');
  }

  if (allTyphoons.length === 0) {
    console.warn('⚠️ No typhoon data available from any source. This could mean:');
    console.warn('1. No active typhoons currently in the region');
    console.warn('2. API endpoints are temporarily unavailable');
    console.warn('3. CORS or network issues preventing data fetch');
  } else {
    console.log(`✅ Successfully loaded ${allTyphoons.length} typhoon records from real sources`);
  }

  return allTyphoons;
}

// GDACS typhoon interface
export interface GDACSTyphoon {
  eventid: string;
  eventname: string;
  fromdate?: string;
  todate?: string;
  lat?: number;
  lon?: number;
  alertlevel?: string;
  alertscore?: number;
  country?: string;
  description?: string;
}

// Fetch GDACS typhoon data with CORS proxy fallback
export async function getGDACSTyphoons(): Promise<GDACSTyphoon[]> {
  const endpoints = [
    'https://www.gdacs.org/gdacsapi/api/events/geteventlist/TC',
    'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://www.gdacs.org/gdacsapi/api/events/geteventlist/TC'),
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Trying GDACS endpoint: ${endpoint.substring(0, 50)}...`);
      
      const { data } = await weatherClient.get(endpoint, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      console.log('GDACS Response:', data);
      
      if (!data?.features || !Array.isArray(data.features)) {
        console.warn('GDACS returned invalid data structure');
        continue;
      }
      
      const storms = data.features
        .map((feature: any) => {
          const props = feature.properties || {};
          const coords = feature.geometry?.coordinates;
          return {
            eventid: props.eventid,
            eventname: props.eventname || props.name || 'Unknown Storm',
            fromdate: props.fromdate,
            todate: props.todate,
            lat: coords?.[1] || props.lat,
            lon: coords?.[0] || props.lon,
            alertlevel: props.alertlevel,
            alertscore: props.alertscore,
            country: props.country,
            description: props.description,
          };
        })
        .filter((storm: GDACSTyphoon) => {
          // Filter for Western Pacific region (Philippines area)
          if (!storm.lat || !storm.lon) return false;
          return storm.lat >= 0 && storm.lat <= 30 && storm.lon >= 100 && storm.lon <= 180;
        });
      
      console.log(`✅ GDACS returned ${storms.length} storms in Western Pacific region`);
      return storms;
      
    } catch (error: any) {
      console.error(`GDACS endpoint failed: ${error.message}`);
      continue;
    }
  }
  
  console.error('❌ All GDACS endpoints failed');
  return [];
}

export default {
  getCurrentWeather,
  isTyphoonAlert,
  getGDACSTyphoons,
  getPhilippineTyphoons,
  PAGBILAO_COORDS,
  PHILIPPINES_COORDS,
};
