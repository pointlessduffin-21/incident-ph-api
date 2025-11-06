import axios from 'axios';

export interface OpenWeatherAlert {
  sender_name?: string;
  event?: string; // e.g., "Typhoon Warning"
  start?: number; // unix seconds
  end?: number;   // unix seconds
  description?: string;
  tags?: string[];
}

export interface OpenWeatherOneCall {
  lat: number;
  lon: number;
  timezone?: string;
  alerts?: OpenWeatherAlert[];
}

const client = axios.create({ timeout: 15000 });

export async function getOneCall(lat: number, lon: number, key?: string) {
  const apiKey = key || import.meta.env.VITE_OPENWEATHER_KEY;
  if (!apiKey) {
    throw new Error('Missing OpenWeather API key. Set VITE_OPENWEATHER_KEY.');
  }
  const url3 = 'https://api.openweathermap.org/data/3.0/onecall';
  try {
    const { data } = await client.get<OpenWeatherOneCall>(url3, {
      params: { lat, lon, appid: apiKey, units: 'metric' },
    });
    return data;
  } catch (err: any) {
    const status = err?.response?.status;
    // Fallback: some keys are not enabled for One Call 3.0 yet; try 2.5
    if (status === 401 || status === 403) {
      const url25 = 'https://api.openweathermap.org/data/2.5/onecall';
      const { data } = await client.get<OpenWeatherOneCall>(url25, {
        params: { lat, lon, appid: apiKey, units: 'metric' },
      });
      return data;
    }
    throw err;
  }
}

export default { getOneCall };


