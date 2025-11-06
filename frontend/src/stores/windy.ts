import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { WindyPointForecastResponse } from '../services/windy';
import windyService from '../services/windy';

interface TyphoonAlert {
  isActive: boolean;
  message: string;
  maxWindKmh: number;
  thresholdKmh: number;
  timestamp: string | null;
  locationName: string;
}

interface FetchOptions {
  locationName?: string;
  model?: string;
  thresholdKmh?: number;
}

interface RequestMeta {
  lat: number;
  lon: number;
  locationName: string;
  model: string;
}

type SupportedParameter = 'wind' | 'windGust';

export const useWindyStore = defineStore('windy', () => {
  const forecast = ref<WindyPointForecastResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastUpdated = ref<string | null>(null);
  const typhoonAlert = ref<TyphoonAlert | null>(null);
  const typhoonThreshold = ref<number>(118); // km/h (≈ 33 m/s)
  const lastRequest = ref<RequestMeta | null>(null);

  async function fetchForecast(lat: number, lon: number, options?: FetchOptions) {
    loading.value = true;
    error.value = null;

    if (options?.thresholdKmh) {
      typhoonThreshold.value = options.thresholdKmh;
    }

    const locationName = options?.locationName ?? 'Selected location';
    const model = options?.model ?? 'gfs';

    try {
      const data = await windyService.getPointForecast({
        lat,
        lon,
        model,
        parameters: ['wind', 'windGust', 'pressure', 'precip'],
        levels: ['surface'],
        timeformat: 'iso',
      });

      forecast.value = data;
      lastUpdated.value = new Date().toISOString();
      lastRequest.value = { lat, lon, locationName, model };
      typhoonAlert.value = analyzeTyphoonRisk(data, locationName);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to fetch Windy forecast';
      error.value = message;
      forecast.value = null;
      typhoonAlert.value = null;
    } finally {
      loading.value = false;
    }
  }

  function analyzeTyphoonRisk(
    data: WindyPointForecastResponse,
    locationName: string,
  ): TyphoonAlert | null {
    const gustSeries = extractSeries(data, 'windGust');
    const windSeries = extractSeries(data, 'wind');

    const gustSeriesKmh = convertSeriesToKmh(gustSeries, data, 'windGust');
    const windSeriesKmh = convertSeriesToKmh(windSeries, data, 'wind');
    const combinedKmh = [...gustSeriesKmh, ...windSeriesKmh].filter(
      (value): value is number => typeof value === 'number' && !Number.isNaN(value),
    );

    if (combinedKmh.length === 0) {
      return null;
    }

    const maxKmh = Math.max(...combinedKmh);
    const gustIndex = gustSeriesKmh.findIndex((value) => value === maxKmh);
    const windIndex = windSeriesKmh.findIndex((value) => value === maxKmh);
    const timestamps = Array.isArray(data.ts) ? data.ts : [];

    const index = gustIndex !== -1 ? gustIndex : windIndex;
    const timestamp = index !== -1 && timestamps[index] ? timestamps[index] : null;
    const threshold = typhoonThreshold.value;

    if (maxKmh >= threshold) {
      return {
        isActive: true,
        message: `Typhoon-level winds expected for ${locationName}.`,
        maxWindKmh: Math.round(maxKmh),
        thresholdKmh: threshold,
        timestamp: timestamp ? formatTimestamp(timestamp) : null,
        locationName,
      };
    }

    return {
      isActive: false,
      message: `No typhoon conditions detected for ${locationName}.`,
      maxWindKmh: Math.round(maxKmh),
      thresholdKmh: threshold,
      timestamp: null,
      locationName,
    };
  }

  function extractSeries(
    data: WindyPointForecastResponse,
    parameter: SupportedParameter,
  ): number[] {
    const series = data?.[parameter];
    if (!series) {
      return [];
    }

    const surfaceSeries = series.surface ?? series['10m'];
    if (Array.isArray(surfaceSeries)) {
      return surfaceSeries;
    }

    const firstEntry = Object.values(series).find((value) => Array.isArray(value));
    return (firstEntry as number[]) ?? [];
  }

  function convertToKmh(
    value: number,
    data: WindyPointForecastResponse,
    parameter: SupportedParameter,
  ): number {
    const unitKey = parameter === 'wind' ? 'wind' : 'windGust';
    const unit = data?.units?.[unitKey] ?? 'm/s';

    switch (unit) {
      case 'km/h':
      case 'kmh':
        return value;
      case 'mph':
        return value * 1.60934;
      case 'kt':
      case 'kts':
      case 'knots':
      case 'kn':
        return value * 1.852;
      case 'm/s':
      default:
        return value * 3.6;
    }
  }

  function formatTimestamp(timestamp: number | string): string {
    let date: Date;
    if (typeof timestamp === 'number') {
      // Windy may return seconds or milliseconds; detect heuristically
      // If it's > 10^12, it's already in ms; otherwise treat as seconds
      const tsMs = timestamp > 1_000_000_000_000 ? timestamp : timestamp * 1000;
      date = new Date(tsMs);
    } else {
      date = new Date(timestamp);
    }
    return Number.isNaN(date.getTime()) ? '' : date.toISOString();
  }

  function setThreshold(kmh: number) {
    typhoonThreshold.value = kmh;

    if (forecast.value && lastRequest.value) {
      typhoonAlert.value = analyzeTyphoonRisk(
        forecast.value,
        lastRequest.value.locationName,
      );
    }
  }

  const forecastTimeline = computed(() => {
    if (!forecast.value || !Array.isArray(forecast.value.ts)) {
      return [] as Array<{
        timestamp: string;
        windKmh: number | null;
        gustKmh: number | null;
      }>;
    }

    const timestamps = forecast.value.ts;
    const windSeries = extractSeries(forecast.value, 'wind');
    const gustSeries = extractSeries(forecast.value, 'windGust');
    const windKmhSeries = convertSeriesToKmh(windSeries, forecast.value, 'wind');
    const gustKmhSeries = convertSeriesToKmh(gustSeries, forecast.value, 'windGust');

    return timestamps.map((ts, index) => {
      const windValue = windKmhSeries[index];
      const gustValue = gustKmhSeries[index];

      return {
        timestamp: formatTimestamp(ts),
        windKmh: typeof windValue === 'number' ? Math.round(windValue) : null,
        gustKmh: typeof gustValue === 'number' ? Math.round(gustValue) : null,
      };
    });
  });

  function convertSeriesToKmh(
    values: number[],
    data: WindyPointForecastResponse,
    parameter: SupportedParameter,
  ): Array<number | null> {
    return values.map((value) =>
      typeof value === 'number' && !Number.isNaN(value)
        ? convertToKmh(value, data, parameter)
        : null,
    );
  }

  return {
    forecast,
    loading,
    error,
    lastUpdated,
    typhoonAlert,
    typhoonThreshold,
    forecastTimeline,
    fetchForecast,
    setThreshold,
  };
});

export type WindyStore = ReturnType<typeof useWindyStore>;

