import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiService from '../services/api';

export const useMMDAStore = defineStore('mmda', () => {
  const traffic = ref<any>(null);
  const highways = ref<any>(null);
  const highwayTraffic = ref<any>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchTraffic() {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiService.getMMDATraffic();
      traffic.value = response.data;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch MMDA traffic';
    } finally {
      loading.value = false;
    }
  }

  async function fetchHighways() {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiService.getMMDAHighways();
      highways.value = response.data;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch MMDA highways';
    } finally {
      loading.value = false;
    }
  }

  async function fetchHighwayTraffic(highwayId: string) {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiService.getMMDAHighwayTraffic(highwayId);
      highwayTraffic.value = response.data;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch highway traffic';
    } finally {
      loading.value = false;
    }
  }

  return {
    traffic,
    highways,
    highwayTraffic,
    loading,
    error,
    fetchTraffic,
    fetchHighways,
    fetchHighwayTraffic,
  };
});





