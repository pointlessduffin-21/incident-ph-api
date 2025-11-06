import axios from 'axios';
import { API_BASE_URL } from '../config/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // MMDA
  async getMMDATraffic() {
    const { data } = await apiClient.get<ApiResponse<any>>('/mmda/traffic');
    return data;
  },

  async getMMDAHighways() {
    const { data } = await apiClient.get<ApiResponse<any>>('/mmda/highways');
    return data;
  },

  async getMMDASegments() {
    const { data } = await apiClient.get<ApiResponse<any>>('/mmda/segments');
    return data;
  },

  async getMMDAHighwayTraffic(highwayId: string) {
    const { data } = await apiClient.get<ApiResponse<any>>(`/mmda/traffic/${highwayId}`);
    return data;
  },

  // PAGASA
  async getPagasaForecast() {
    const { data } = await apiClient.get<ApiResponse<any>>('/pagasa/forecast');
    return data;
  },

  async getPagasaSevereWeather() {
    const { data } = await apiClient.get<ApiResponse<any>>('/pagasa/severe-weather');
    return data;
  },

  async getPagasaTropicalCyclones() {
    const { data } = await apiClient.get<ApiResponse<any>>('/pagasa/tropical-cyclones');
    return data;
  },

  // PHIVOLCS
  async getPhivolcsEarthquakes() {
    const { data } = await apiClient.get<ApiResponse<any>>('/phivolcs/earthquakes');
    return data;
  },

  async getPhivolcsLatestEarthquake() {
    const { data } = await apiClient.get<ApiResponse<any>>('/phivolcs/latest-earthquake');
    return data;
  },

  async getPhivolcsVolcanoes() {
    const { data } = await apiClient.get<ApiResponse<any>>('/phivolcs/volcanoes');
    return data;
  },

  async getPhivolcsVolcano(name: string) {
    const { data } = await apiClient.get<ApiResponse<any>>(`/phivolcs/volcanoes/${name}`);
    return data;
  },

  // ACLED
  async getAcledIncidents(limit: number = 50) {
    const { data } = await apiClient.get<ApiResponse<any>>('/acled/incidents', {
      params: { limit },
    });
    return data;
  },
};

export default apiService;





