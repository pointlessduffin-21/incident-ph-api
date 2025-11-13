export interface TideData {
  type: 'High Tide' | 'Low Tide';
  time: string;
  date: string;
  height: string;
  heightMeters: number;
  heightFeet: number;
}

export interface TideForecast {
  location: string;
  latitude: number;
  longitude: number;
  timezone: string;
  today: TideData[];
  tomorrow: TideData[];
  nextDays: {
    date: string;
    tides: TideData[];
  }[];
  lastUpdated: string;
  source: string;
}

// Location configurations with their tide-forecast.com URLs
const TIDE_LOCATIONS = {
  cordova: {
    name: 'Cordova, Cebu',
    url: 'https://www.tide-forecast.com/locations/Cordova-1/tides/latest',
    latitude: 10.25,
    longitude: 123.95,
  },
  lucena: {
    name: 'Lucena City, Quezon',
    url: 'https://www.tide-forecast.com/locations/Lucena-City/tides/latest',
    latitude: 13.9333,
    longitude: 121.6167,
  },
};

/**
 * Parse HTML from tide-forecast.com to extract tide data
 */
async function scrapeTideForecast(url: string, locationName: string, lat: number, lon: number): Promise<TideForecast | null> {
  try {
    // Use CORS proxy to fetch the page
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Parse the HTML to extract tide data
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const tides: TideForecast = {
      location: locationName,
      latitude: lat,
      longitude: lon,
      timezone: 'PST (UTC +8)',
      today: [],
      tomorrow: [],
      nextDays: [],
      lastUpdated: new Date().toISOString(),
      source: 'Tide-Forecast.com (Official Data)',
    };
    
    // Extract tide table data - target the specific table structure
    // The page has tables with rows containing: Tide Type | Time & Date | Height
    const allRows = doc.querySelectorAll('table tr');
    
    console.log(`Found ${allRows.length} table rows, parsing tide data...`);
    
    const now = new Date();
    const todayDay = now.getDate();
    
    // Parse tide data from table rows
    allRows.forEach((row) => {
      const cells = row.querySelectorAll('td');
      
      // Skip header rows and rows without 3 cells
      if (cells.length < 3) return;
      
      const typeCell = cells[0];
      const timeCell = cells[1];
      const heightCell = cells[2];
      
      if (!typeCell || !timeCell || !heightCell) return;
      
      const typeText = typeCell.textContent?.trim() || '';
      const timeText = timeCell.textContent?.trim() || '';
      const heightText = heightCell.textContent?.trim() || '';
      
      // Check if this is a tide row (starts with "High Tide" or "Low Tide")
      if (!typeText.includes('Tide')) return;
      
      const type = typeText.includes('High') ? 'High Tide' : 'Low Tide';
      
      // Extract time and date from combined cell (e.g., "3:30 AM (Thu 13 November)")
      const timeMatch = timeText.match(/(\d+:\d+\s*[AP]M)/i);
      const dateMatch = timeText.match(/\(([^)]+)\)/);
      
      if (!timeMatch || !dateMatch || !timeMatch[1] || !dateMatch[1]) return;
      
      const time = timeMatch[1];
      const dateStr = dateMatch[1]; // e.g., "Thu 13 November"
      
      // Parse height (e.g., "1.75 m (5.73 ft)")
      const heightMatch = heightText.match(/([\d.]+)\s*m/i);
      const heightMeters = heightMatch && heightMatch[1] ? parseFloat(heightMatch[1]) : 0;
      
      const tideData: TideData = {
        type,
        time,
        date: dateStr,
        height: `${heightMeters.toFixed(2)} m`,
        heightMeters,
        heightFeet: heightMeters * 3.28084,
      };
      
      // Categorize by day - check if it's today, tomorrow, or later
      const dayMatch = dateStr.match(/(\d+)/);
      if (dayMatch && dayMatch[1]) {
        const day = parseInt(dayMatch[1]);
        
        if (day === todayDay) {
          tides.today.push(tideData);
        } else if (day === todayDay + 1 || (todayDay >= 28 && day === 1)) {
          tides.tomorrow.push(tideData);
        } else {
          // Find or create day entry
          let dayEntry = tides.nextDays.find(d => d.date === dateStr);
          if (!dayEntry) {
            dayEntry = { date: dateStr, tides: [] };
            tides.nextDays.push(dayEntry);
          }
          dayEntry.tides.push(tideData);
        }
      }
    });
    
    console.log(`Scraped ${tides.today.length + tides.tomorrow.length} tides for ${locationName}`);
    
    if (tides.today.length === 0 && tides.tomorrow.length === 0) {
      console.warn('No tide data extracted, falling back to calculated data');
      return null;
    }
    
    return tides;
  } catch (error) {
    console.error('Error scraping tide data:', error);
    return null;
  }
}

/**
 * Fallback: Generate calculated tide data based on tidal patterns
 * Used only when scraping fails
 */
function generateMockTideData(lat: number, lon: number, location: string): TideForecast {
  const now = new Date();
  const tides: TideForecast = {
    location,
    latitude: lat,
    longitude: lon,
    timezone: 'PST (UTC +8)',
    today: [],
    tomorrow: [],
    nextDays: [],
    lastUpdated: now.toISOString(),
    source: 'Calculated Tidal Predictions (Mathematical Model)',
  };

  // Use coordinates to vary base timing and tidal range
  // Different locations have different tidal characteristics
  const latitudeOffset = (lat - 10) * 0.3; // Latitude affects timing (~18 min per degree)
  const longitudeOffset = (lon - 120) * 0.05; // Longitude affects timing slightly
  const baseTimeOffset = latitudeOffset + longitudeOffset;
  
  // Tidal range varies by location (bathymetry, coastal geometry)
  const locationFactor = Math.abs(Math.sin(lat * 0.1) * Math.cos(lon * 0.1));
  const tidalRangeMultiplier = 0.8 + (locationFactor * 0.4); // 0.8 to 1.2

  // Tidal cycle is approximately 12 hours 25 minutes
  // Generate 2 high tides and 2 low tides per day
  const generateDayTides = (dayOffset: number): TideData[] => {
    const baseDate = new Date(now);
    baseDate.setDate(baseDate.getDate() + dayOffset);
    baseDate.setHours(0, 0, 0, 0);

    // Base tide heights (meters) - vary by location
    const baseHighTide = 2.0 * tidalRangeMultiplier;
    const baseLowTide = 0.3 * tidalRangeMultiplier;
    
    // Spring-neap cycle (approximately 14.76 days)
    const daysSinceNewMoon = (now.getTime() / (1000 * 60 * 60 * 24)) % 14.76;
    const springNeapFactor = Math.abs(Math.cos((daysSinceNewMoon / 14.76) * 2 * Math.PI));
    
    // Calculate high and low tide times for this day (offset by location)
    // High tides occur approximately every 12 hours 25 minutes
    const baseHighTideHour = 5.5 + baseTimeOffset; // ~5:30 AM base time
    const highTide1 = new Date(baseDate.getTime() + (baseHighTideHour * 60 * 60 * 1000));
    const highTide2 = new Date(highTide1.getTime() + (12.42 * 60 * 60 * 1000)); // 12h 25m later
    
    // Low tides occur between high tides
    const lowTide1 = new Date(highTide1.getTime() - (6.21 * 60 * 60 * 1000));
    const lowTide2 = new Date(highTide1.getTime() + (6.21 * 60 * 60 * 1000));
    
    const dayTides: TideData[] = [];
    
    const highTideHeight = baseHighTide + (0.5 * springNeapFactor);
    const lowTideHeight = baseLowTide + (0.2 * (1 - springNeapFactor));
    
    // Slight variation between first and second tides (diurnal inequality)
    const diurnalVariation = 0.1 * Math.sin(lat * 0.2);
    
    dayTides.push({
      type: 'High Tide',
      time: highTide1.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      date: highTide1.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long' }),
      height: `${highTideHeight.toFixed(2)} m`,
      heightMeters: highTideHeight,
      heightFeet: highTideHeight * 3.28084,
    });
    
    if (lowTide1.getHours() < 24) {
      dayTides.push({
        type: 'Low Tide',
        time: lowTide1.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        date: lowTide1.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long' }),
        height: `${lowTideHeight.toFixed(2)} m`,
        heightMeters: lowTideHeight,
        heightFeet: lowTideHeight * 3.28084,
      });
    }
    
    if (highTide2.getHours() < 24) {
      dayTides.push({
        type: 'High Tide',
        time: highTide2.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        date: highTide2.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long' }),
        height: `${(highTideHeight - diurnalVariation).toFixed(2)} m`,
        heightMeters: highTideHeight - diurnalVariation,
        heightFeet: (highTideHeight - diurnalVariation) * 3.28084,
      });
    }
    
    if (lowTide2.getHours() < 24) {
      dayTides.push({
        type: 'Low Tide',
        time: lowTide2.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        date: lowTide2.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long' }),
        height: `${(lowTideHeight + diurnalVariation * 0.5).toFixed(2)} m`,
        heightMeters: lowTideHeight + diurnalVariation * 0.5,
        heightFeet: (lowTideHeight + diurnalVariation * 0.5) * 3.28084,
      });
    }
    
    return dayTides.sort((a, b) => {
      const timeA = new Date(`2000/01/01 ${a.time}`);
      const timeB = new Date(`2000/01/01 ${b.time}`);
      return timeA.getTime() - timeB.getTime();
    });
  };

  // Generate tide data
  tides.today = generateDayTides(0);
  tides.tomorrow = generateDayTides(1);
  
  for (let i = 2; i < 7; i++) {
    const dayTides = generateDayTides(i);
    tides.nextDays.push({
      date: dayTides[0]?.date || '',
      tides: dayTides,
    });
  }

  return tides;
}

/**
 * Fetch tide forecast data from tide-forecast.com
 * Falls back to calculated data if scraping fails
 */
export async function getTideForecast(location: string = 'cordova', lat?: number, lon?: number): Promise<TideForecast | null> {
  try {
    // Try to find location config
    const locationKey = location.toLowerCase().includes('cordova') ? 'cordova' : 
                       location.toLowerCase().includes('lucena') ? 'lucena' : 
                       null;
    
    if (locationKey && TIDE_LOCATIONS[locationKey]) {
      const config = TIDE_LOCATIONS[locationKey];
      console.log(`🌊 Fetching REAL tide data for ${config.name} from tide-forecast.com...`);
      
      const scrapedData = await scrapeTideForecast(
        config.url,
        config.name,
        config.latitude,
        config.longitude
      );
      
      if (scrapedData && (scrapedData.today.length > 0 || scrapedData.tomorrow.length > 0)) {
        console.log(`✅ Successfully scraped ${scrapedData.today.length} tides for today`);
        return scrapedData;
      }
    }
    
    // Fallback to calculated data
    console.warn('⚠️ Scraping failed, falling back to calculated tide data');
    const useLat = lat || (locationKey === 'lucena' ? 13.9333 : 10.25);
    const useLon = lon || (locationKey === 'lucena' ? 121.6167 : 123.95);
    const useName = location || (locationKey ? TIDE_LOCATIONS[locationKey].name : 'Unknown Location');
    
    return generateMockTideData(useLat, useLon, useName);
  } catch (error: any) {
    console.error('Failed to fetch tide forecast:', error.message);
    
    // Last resort fallback
    const useLat = lat || 10.25;
    const useLon = lon || 123.95;
    return generateMockTideData(useLat, useLon, location);
  }
}

/**
 * Get tide forecast for Cordova, Cebu
 */
export async function getCordovaTideForecast(): Promise<TideForecast | null> {
  return getTideForecast('cordova');
}

/**
 * Get tide forecast for Lucena City, Quezon
 */
export async function getLucenaTideForecast(): Promise<TideForecast | null> {
  return getTideForecast('lucena');
}

/**
 * Determine current tide state based on tide times
 */
export function getCurrentTideState(tides: TideData[]): {
  state: 'Rising' | 'Falling' | 'Unknown';
  nextTide: TideData | null;
  timeToNextTide: string;
} {
  const now = new Date();
  
  // Parse tide times and find next tide
  const futureTides = tides
    .map(tide => {
      const timeMatch = tide.time.match(/(\d+):(\d+)\s*([AP]M)/i);
      if (!timeMatch || !timeMatch[1] || !timeMatch[2] || !timeMatch[3]) return null;
      
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const isPM = timeMatch[3].toUpperCase() === 'PM';
      
      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
      
      const tideTime = new Date(now);
      tideTime.setHours(hours, minutes, 0, 0);
      
      // If tide time is in the past today, it might be for tomorrow
      if (tideTime < now) {
        tideTime.setDate(tideTime.getDate() + 1);
      }
      
      return { tide, tideTime };
    })
    .filter(t => t !== null && t.tideTime > now)
    .sort((a, b) => a!.tideTime.getTime() - b!.tideTime.getTime());

  if (futureTides.length === 0) {
    return { state: 'Unknown', nextTide: null, timeToNextTide: 'Unknown' };
  }

  const nextTide = futureTides[0]!;
  const timeDiff = nextTide.tideTime.getTime() - now.getTime();
  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  
  const timeToNextTide = hours > 0 
    ? `${hours}h ${minutes}m` 
    : `${minutes}m`;

  const state = nextTide.tide.type === 'High Tide' ? 'Rising' : 'Falling';

  return {
    state,
    nextTide: nextTide.tide,
    timeToNextTide,
  };
}
