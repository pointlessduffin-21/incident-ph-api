import { defineStore } from 'pinia';
import { ref } from 'vue';
import qweatherService, { type QWeatherWarning } from '../services/qweather';

export const useQWeatherStore = defineStore('qweather', () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const warnings = ref<QWeatherWarning[]>([]);
  const lastUpdated = ref<string | null>(null);

  function isTyphoonWarning(w: QWeatherWarning): boolean {
    const hay = `${w.title ?? ''} ${w.text ?? ''} ${w.type ?? ''}`.toLowerCase();
    return hay.includes('typhoon') || hay.includes('tropical cyclone') || hay.includes('hurricane');
  }

  async function fetchWarnings(lat: number, lon: number) {
    loading.value = true;
    error.value = null;
    try {
      const res = await qweatherService.getWarnings(lat, lon);
      const list = res?.warning ?? [];
      warnings.value = list.filter(isTyphoonWarning);
      lastUpdated.value = res?.updateTime ?? new Date().toISOString();
    } catch (err: any) {
      error.value = err?.message ?? 'Failed to fetch QWeather warnings';
      warnings.value = [];
    } finally {
      loading.value = false;
    }
  }

  return { loading, error, warnings, lastUpdated, fetchWarnings };
});


