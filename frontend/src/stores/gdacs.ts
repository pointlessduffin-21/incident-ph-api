import { defineStore } from 'pinia';
import { ref } from 'vue';
import gdacsService from '../services/gdacs';

export const useGdacsStore = defineStore('gdacs', () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const cyclones = ref<any[]>([]);
  const lastUpdated = ref<string | null>(null);

  function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async function fetchNear(lat: number, lon: number, radiusKm: number) {
    loading.value = true;
    error.value = null;
    try {
      const data = await gdacsService.getActiveCyclones();
      const features = data?.features ?? [];
      cyclones.value = features
        .map((f) => {
          const props = f?.properties || {};
          const coords = f?.geometry?.coordinates as [number, number] | undefined;
          const cLon = coords?.[0] ?? props.lon;
          const cLat = coords?.[1] ?? props.lat;
          if (typeof cLat !== 'number' || typeof cLon !== 'number') return null;
          const dist = haversineKm(lat, lon, cLat, cLon);
          return { ...props, lat: cLat, lon: cLon, distanceKm: Math.round(dist) };
        })
        .filter((x): x is any => !!x && x.distanceKm <= radiusKm)
        .sort((a, b) => a.distanceKm - b.distanceKm);
      lastUpdated.value = new Date().toISOString();
    } catch (err: any) {
      error.value = err?.message || 'Failed to fetch GDACS cyclones';
      cyclones.value = [];
    } finally {
      loading.value = false;
    }
  }

  return { loading, error, cyclones, lastUpdated, fetchNear };
});



