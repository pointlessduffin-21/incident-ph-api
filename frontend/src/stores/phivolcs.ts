import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiService from '../services/api';

export const usePhivolcsStore = defineStore('phivolcs', () => {
  const earthquakes = ref<any>(null);
  const latestEarthquake = ref<any>(null);
  const volcanoes = ref<any>(null);
  const volcano = ref<any>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchEarthquakes() {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiService.getPhivolcsEarthquakes();
      earthquakes.value = response.data;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch earthquakes';
    } finally {
      loading.value = false;
    }
  }

  async function fetchLatestEarthquake() {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiService.getPhivolcsLatestEarthquake();
      latestEarthquake.value = response.data;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch latest earthquake';
    } finally {
      loading.value = false;
    }
  }

  async function fetchVolcanoes() {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiService.getPhivolcsVolcanoes();
      volcanoes.value = response.data;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch volcanoes';
    } finally {
      loading.value = false;
    }
  }

  async function fetchVolcano(name: string) {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiService.getPhivolcsVolcano(name);
      volcano.value = response.data;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch volcano';
    } finally {
      loading.value = false;
    }
  }

  return {
    earthquakes,
    latestEarthquake,
    volcanoes,
    volcano,
    loading,
    error,
    fetchEarthquakes,
    fetchLatestEarthquake,
    fetchVolcanoes,
    fetchVolcano,
  };
});





