import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../config/api';

export interface TideEvent {
  type: 'High Tide' | 'Low Tide';
  time: string;
  heightMeters: number;
  heightFeet: number;
}

export interface TideDay {
  date: string;
  events: TideEvent[];
}

export interface TideForecast {
  location: string;
  timezone: string;
  tides: TideDay[];
  cachedAt: string;
}

export interface TideLocation {
  slug: string;
  name: string;
}

/**
 * Fetch available tide locations from backend API
 */
export async function getTideLocations(): Promise<TideLocation[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.TIDE_LOCATIONS}`);
    return response.data.locations || [];
  } catch (error: any) {
    console.error('Failed to fetch tide locations:', error.message);
    throw new Error('Failed to fetch tide locations');
  }
}

/**
 * Fetch tide forecast for a specific location from backend API
 */
export async function getTideForecast(locationSlug: string): Promise<TideForecast> {
  try {
    const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.TIDE_FORECAST(locationSlug)}`);
    return response.data;
  } catch (error: any) {
    console.error(`Failed to fetch tide forecast for ${locationSlug}:`, error.message);
    throw new Error(`Failed to fetch tide forecast for ${locationSlug}`);
  }
}

/**
 * Get tide forecast for Cordova, Cebu
 */
export async function getCordovaTideForecast(): Promise<TideForecast> {
  return getTideForecast('cordova-1');
}

/**
 * Get tide forecast for Manila Bay
 */
export async function getManilaBayTideForecast(): Promise<TideForecast> {
  return getTideForecast('manila-bay');
}

/**
 * Get tide forecast for Cebu City
 */
export async function getCebuCityTideForecast(): Promise<TideForecast> {
  return getTideForecast('cebu-city');
}

/**
 * Get tide forecast for Davao Gulf
 */
export async function getDavaoGulfTideForecast(): Promise<TideForecast> {
  return getTideForecast('davao-gulf');
}

/**
 * Get tide forecast for Subic Bay
 */
export async function getSubicBayTideForecast(): Promise<TideForecast> {
  return getTideForecast('subic-bay');
}

/**
 * Get tide forecast for Puerto Princesa
 */
export async function getPuertoPrincesaTideForecast(): Promise<TideForecast> {
  return getTideForecast('puerto-princesa');
}

/**
 * Determine current tide state based on tide times
 */
export function getCurrentTideState(tides: TideDay[]): {
  state: 'Rising' | 'Falling' | 'Unknown';
  nextTide: TideEvent | null;
  timeToNextTide: string;
} {
  if (!tides || tides.length === 0) {
    return { state: 'Unknown', nextTide: null, timeToNextTide: 'Unknown' };
  }

  const now = new Date();
  const allEvents: Array<{ event: TideEvent; dateTime: Date }> = [];

  // Parse all tide events across all days
  for (const day of tides) {
    for (const event of day.events) {
      const timeMatch = event.time.match(/(\d+):(\d+)\s*([AP]M)/i);
      if (!timeMatch || !timeMatch[1] || !timeMatch[2] || !timeMatch[3]) continue;

      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const isPM = timeMatch[3].toUpperCase() === 'PM';

      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;

      // Parse the date from the day.date string
      const dateMatch = day.date.match(/(\d+)/);
      if (!dateMatch || !dateMatch[1]) continue;

      const dayNum = parseInt(dateMatch[1]);
      const eventDate = new Date(now);
      eventDate.setDate(dayNum);
      eventDate.setHours(hours, minutes, 0, 0);

      // If the date is in the past this month, it might be next month
      if (eventDate < now && Math.abs(eventDate.getTime() - now.getTime()) > 24 * 60 * 60 * 1000) {
        eventDate.setMonth(eventDate.getMonth() + 1);
      }

      allEvents.push({ event, dateTime: eventDate });
    }
  }

  // Find the next future tide event
  const futureEvents = allEvents
    .filter(e => e.dateTime > now)
    .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

  if (futureEvents.length === 0) {
    return { state: 'Unknown', nextTide: null, timeToNextTide: 'Unknown' };
  }

  const nextEvent = futureEvents[0];
  if (!nextEvent) {
    return {
      state: 'Unknown' as const,
      nextTide: null,
      timeToNextTide: 'N/A',
    };
  }
  
  const timeDiff = nextEvent.dateTime.getTime() - now.getTime();
  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

  const timeToNextTide = hours > 0 
    ? `${hours}h ${minutes}m` 
    : `${minutes}m`;

  const state = nextEvent.event.type === 'High Tide' ? 'Rising' : 'Falling';

  return {
    state,
    nextTide: nextEvent.event,
    timeToNextTide,
  };
}

/**
 * Get current tide height estimation based on tide events
 * This is a rough estimation using linear interpolation between high and low tides
 */
export function estimateCurrentTideHeight(tides: TideDay[]): {
  heightMeters: number;
  heightFeet: number;
  percentage: number;
} | null {
  if (!tides || tides.length === 0) {
    return null;
  }

  const now = new Date();
  const allEvents: Array<{ event: TideEvent; dateTime: Date }> = [];

  // Parse all tide events
  for (const day of tides) {
    for (const event of day.events) {
      const timeMatch = event.time.match(/(\d+):(\d+)\s*([AP]M)/i);
      if (!timeMatch || !timeMatch[1] || !timeMatch[2] || !timeMatch[3]) continue;

      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const isPM = timeMatch[3].toUpperCase() === 'PM';

      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;

      const dateMatch = day.date.match(/(\d+)/);
      if (!dateMatch || !dateMatch[1]) continue;

      const dayNum = parseInt(dateMatch[1]);
      const eventDate = new Date(now);
      eventDate.setDate(dayNum);
      eventDate.setHours(hours, minutes, 0, 0);

      if (eventDate < now && Math.abs(eventDate.getTime() - now.getTime()) > 24 * 60 * 60 * 1000) {
        eventDate.setMonth(eventDate.getMonth() + 1);
      }

      allEvents.push({ event, dateTime: eventDate });
    }
  }

  // Sort all events
  allEvents.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

  // Find the two events that bracket the current time
  let prevEvent: { event: TideEvent; dateTime: Date } | null = null;
  let nextEvent: { event: TideEvent; dateTime: Date } | null = null;

  for (let i = 0; i < allEvents.length; i++) {
    if (allEvents[i].dateTime <= now) {
      prevEvent = allEvents[i];
    } else {
      nextEvent = allEvents[i];
      break;
    }
  }

  if (!prevEvent || !nextEvent) {
    return null;
  }

  // Linear interpolation between prev and next tide
  const totalTime = nextEvent.dateTime.getTime() - prevEvent.dateTime.getTime();
  const elapsedTime = now.getTime() - prevEvent.dateTime.getTime();
  const progress = elapsedTime / totalTime;

  const heightDiff = nextEvent.event.heightMeters - prevEvent.event.heightMeters;
  const currentHeightMeters = prevEvent.event.heightMeters + (heightDiff * progress);
  const currentHeightFeet = currentHeightMeters * 3.28084;

  // Calculate percentage (0-100) based on typical tide range
  // Assuming typical range is 0.3m (low) to 2.0m (high)
  const minHeight = 0.3;
  const maxHeight = 2.0;
  const percentage = Math.max(0, Math.min(100, ((currentHeightMeters - minHeight) / (maxHeight - minHeight)) * 100));

  return {
    heightMeters: currentHeightMeters,
    heightFeet: currentHeightFeet,
    percentage,
  };
}
