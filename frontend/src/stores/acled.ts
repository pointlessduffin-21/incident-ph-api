import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiService from '../services/api';

export const useAcledStore = defineStore('acled', () => {
  const incidents = ref<any>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchIncidents(limit: number = 50) {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiService.getAcledIncidents(limit);
      incidents.value = response.data;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch ACLED incidents';
    } finally {
      loading.value = false;
    }
  }

  return {
    incidents,
    loading,
    error,
    fetchIncidents,
  };
});





