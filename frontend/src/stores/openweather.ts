import { defineStore } from 'pinia';
import { ref } from 'vue';
import openweatherService, { type OpenWeatherAlert } from '../services/openweather';

export const useOpenWeatherStore = defineStore('openweather', () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const alerts = ref<OpenWeatherAlert[]>([]);
  const lastUpdated = ref<string | null>(null);

  function isTyphoonRelated(a: OpenWeatherAlert): boolean {
    const hay = `${a.event ?? ''} ${a.description ?? ''}`.toLowerCase();
    return (
      hay.includes('typhoon') ||
      hay.includes('tropical cyclone') ||
      hay.includes('hurricane') ||
      (Array.isArray(a.tags) && a.tags.some((t) => /typhoon|cyclone|hurricane/i.test(t)))
    );
  }

  async function fetch(lat: number, lon: number) {
    loading.value = true;
    error.value = null;
    try {
      const data = await openweatherService.getOneCall(lat, lon);
      const list = data.alerts ?? [];
      alerts.value = list.filter(isTyphoonRelated);
      lastUpdated.value = new Date().toISOString();
    } catch (err: any) {
      error.value = err?.message ?? 'Failed to fetch OpenWeather alerts';
      alerts.value = [];
    } finally {
      loading.value = false;
    }
  }

  return { loading, error, alerts, lastUpdated, fetch };
});


