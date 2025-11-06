import axios from 'axios';

export interface QWeatherWarning {
  id: string;
  sender?: string;
  pubTime?: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  level?: string;
  type?: string;
  text?: string;
}

export interface QWeatherWarningResponse {
  code: string;
  updateTime?: string;
  warning?: QWeatherWarning[];
}

const q = axios.create({
  baseURL: 'https://devapi.qweather.com/v7',
  timeout: 15000,
});

export async function getWarnings(lat: number, lon: number, key?: string) {
  const apiKey = key || import.meta.env.VITE_QWEATHER_KEY;
  if (!apiKey) {
    throw new Error('Missing QWeather API key. Set VITE_QWEATHER_KEY in your environment.');
  }
  const { data } = await q.get<QWeatherWarningResponse>(`/warning/now`, {
    params: { location: `${lon},${lat}`, key: apiKey },
  });
  return data;
}

export default { getWarnings };


