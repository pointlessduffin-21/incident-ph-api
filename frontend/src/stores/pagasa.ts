import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiService from '../services/api';

export const usePagasaStore = defineStore('pagasa', () => {
  const forecast = ref<any>(null);
  const severeWeather = ref<any>(null);
  const tropicalCyclones = ref<any>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchForecast() {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiService.getPagasaForecast();
      forecast.value = response.data;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch PAGASA forecast';
    } finally {
      loading.value = false;
    }
  }

  async function fetchSevereWeather() {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiService.getPagasaSevereWeather();
      severeWeather.value = response.data;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch severe weather';
    } finally {
      loading.value = false;
    }
  }

  async function fetchTropicalCyclones() {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiService.getPagasaTropicalCyclones();
      tropicalCyclones.value = response.data;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch tropical cyclones';
    } finally {
      loading.value = false;
    }
  }

  return {
    forecast,
    severeWeather,
    tropicalCyclones,
    loading,
    error,
    fetchForecast,
    fetchSevereWeather,
    fetchTropicalCyclones,
  };
});





