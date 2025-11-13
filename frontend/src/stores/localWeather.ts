import { defineStore } from 'pinia';
import { ref } from 'vue';
import weatherService, { 
  PAGBILAO_COORDS, 
  type CurrentWeather, 
  type WeatherForecast, 
  type TyphoonAlert,
  type GDACSTyphoon,
  type PhilippineTyphoon
} from '../services/weather';
import apiService from '../services/api';
import * as tideService from '../services/tides';
import type { TideForecast } from '../services/tides';

export const useLocalWeatherStore = defineStore('localWeather', () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // Current weather data
  const currentWeather = ref<CurrentWeather | null>(null);
  const forecast = ref<WeatherForecast[]>([]);
  const typhoonAlerts = ref<TyphoonAlert[]>([]);
  const timezone = ref<string>('');
  
  // PAGASA typhoon data
  const pagasaTyphoons = ref<any>(null);
  const loadingPagasa = ref(false);
  const pagasaError = ref<string | null>(null);
  
  // GDACS typhoon data
  const gdacsTyphoons = ref<GDACSTyphoon[]>([]);
  const loadingGdacs = ref(false);
  const gdacsError = ref<string | null>(null);
  
  // Philippine typhoon history
  const philippineTyphoons = ref<PhilippineTyphoon[]>([]);
  
  // Tide forecast data
  const tideForecast = ref<TideForecast | null>(null);
  const loadingTides = ref(false);
  const tidesError = ref<string | null>(null);
  
  const lastUpdated = ref<string | null>(null);

  async function fetchPagbilaaoWeather() {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await weatherService.getCurrentWeather(
        PAGBILAO_COORDS.lat,
        PAGBILAO_COORDS.lon
      );
      
      currentWeather.value = data.current;
      forecast.value = data.daily || [];
      timezone.value = data.timezone || '';
      
      // Filter for typhoon-related alerts
      if (data.alerts) {
        typhoonAlerts.value = data.alerts.filter((alert: TyphoonAlert) => 
          weatherService.isTyphoonAlert(alert)
        );
      } else {
        typhoonAlerts.value = [];
      }
      
      lastUpdated.value = new Date().toISOString();
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch weather data';
      currentWeather.value = null;
      forecast.value = [];
      typhoonAlerts.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function fetchPagasaTyphoons() {
    loadingPagasa.value = true;
    pagasaError.value = null;
    
    try {
      const response = await apiService.getPagasaTropicalCyclones();
      pagasaTyphoons.value = response.data;
    } catch (err: any) {
      pagasaError.value = err.message || 'Failed to fetch PAGASA typhoon data';
      pagasaTyphoons.value = null;
    } finally {
      loadingPagasa.value = false;
    }
  }

  async function fetchGDACSTyphoons() {
    loadingGdacs.value = true;
    gdacsError.value = null;
    
    try {
      const storms = await weatherService.getGDACSTyphoons();
      gdacsTyphoons.value = storms;
    } catch (err: any) {
      gdacsError.value = err.message || 'Failed to fetch GDACS typhoon data';
      gdacsTyphoons.value = [];
    } finally {
      loadingGdacs.value = false;
    }
  }

  async function fetchPhilippineTyphoons() {
    try {
      philippineTyphoons.value = await weatherService.getPhilippineTyphoons();
    } catch (err: any) {
      console.error('Failed to fetch Philippine typhoons:', err);
      philippineTyphoons.value = [];
    }
  }

  async function fetchTideForecast() {
    loadingTides.value = true;
    tidesError.value = null;
    
    try {
      const tides = await tideService.getCordovaTideForecast();
      tideForecast.value = tides;
    } catch (err: any) {
      tidesError.value = err.message || 'Failed to fetch tide forecast';
      tideForecast.value = null;
    } finally {
      loadingTides.value = false;
    }
  }

  async function fetchAllData() {
    // Fetch all data in parallel
    await Promise.all([
      fetchPagbilaaoWeather(),
      fetchPagasaTyphoons(),
      fetchGDACSTyphoons(),
      fetchPhilippineTyphoons(),
    ]);
  }

  function getWindDirection(deg: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(deg / 22.5) % 16;
    return directions[index] || 'N';
  }

  function getWeatherIcon(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  return {
    // State
    loading,
    error,
    currentWeather,
    forecast,
    typhoonAlerts,
    timezone,
    pagasaTyphoons,
    loadingPagasa,
    pagasaError,
    gdacsTyphoons,
    loadingGdacs,
    gdacsError,
    philippineTyphoons,
    tideForecast,
    loadingTides,
    tidesError,
    lastUpdated,
    
    // Actions
    fetchPagbilaaoWeather,
    fetchPagasaTyphoons,
    fetchGDACSTyphoons,
    fetchPhilippineTyphoons,
    fetchTideForecast,
    fetchAllData,
    
    // Helpers
    getWindDirection,
    getWeatherIcon,
    
    // Constants
    location: PAGBILAO_COORDS,
  };
});
