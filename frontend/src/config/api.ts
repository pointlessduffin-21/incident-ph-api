// Use environment variable or fallback to relative path (works with nginx proxy)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const ENDPOINTS = {
  // MMDA
  MMDA_TRAFFIC: '/mmda/traffic',
  MMDA_HIGHWAYS: '/mmda/highways',
  MMDA_SEGMENTS: '/mmda/segments',
  MMDA_HIGHWAY_TRAFFIC: (highwayId: string) => `/mmda/traffic/${highwayId}`,
  
  // PAGASA
  PAGASA_FORECAST: '/pagasa/forecast',
  PAGASA_SEVERE_WEATHER: '/pagasa/severe-weather',
  PAGASA_TROPICAL_CYCLONES: '/pagasa/tropical-cyclones',
  
  // PHIVOLCS
  PHIVOLCS_EARTHQUAKES: '/phivolcs/earthquakes',
  PHIVOLCS_LATEST_EARTHQUAKE: '/phivolcs/latest-earthquake',
  PHIVOLCS_VOLCANOES: '/phivolcs/volcanoes',
  PHIVOLCS_VOLCANO: (name: string) => `/phivolcs/volcanoes/${name}`,
  
  // ACLED
  ACLED_INCIDENTS: '/acled/incidents',
  
  // TIDE
  TIDE_FORECAST: (location: string) => `/tide/forecast/${location}`,
  TIDE_LOCATIONS: '/tide/locations',
} as const;





