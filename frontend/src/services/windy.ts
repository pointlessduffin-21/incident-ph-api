import axios from 'axios';

const WINDY_BASE_URL = 'https://api.windy.com/api';

const windyClient = axios.create({
  baseURL: WINDY_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export type WindyLevelSeries = Record<string, number[] | undefined>;

export interface WindyPointForecastResponse {
  ts: Array<number | string>;
  units?: Record<string, string>;
  wind?: WindyLevelSeries;
  windGust?: WindyLevelSeries;
  precip?: WindyLevelSeries;
  [key: string]: any;
}

export interface WindyPointForecastRequest {
  lat: number;
  lon: number;
  model?: string;
  parameters?: string[];
  levels?: string[];
  timeformat?: 'iso' | 'unix';
}

export async function getPointForecast(
  request: WindyPointForecastRequest,
): Promise<WindyPointForecastResponse> {
  const apiKey = import.meta.env.VITE_WINDY_API_KEY;

  if (!apiKey) {
    throw new Error('Missing Windy API key. Set VITE_WINDY_API_KEY in your environment.');
  }

  const payload = {
    lat: request.lat,
    lon: request.lon,
    model: request.model ?? 'gfs',
    parameters: request.parameters ?? ['wind', 'windGust', 'pressure', 'precip'],
    levels: request.levels ?? ['surface'],
    timeformat: request.timeformat ?? 'iso',
    key: apiKey,
  };

  const { data } = await windyClient.post<WindyPointForecastResponse>(
    '/point-forecast/v2',
    payload,
  );

  return data;
}

export default {
  getPointForecast,
};

