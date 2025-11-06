export const API_BASE_URL = 'http://localhost:6144/api';

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
} as const;





