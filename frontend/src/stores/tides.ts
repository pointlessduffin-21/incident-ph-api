import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface CustomLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  addedAt: number;
}

export interface DefaultLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  isDefault: true;
}

export type Location = CustomLocation | DefaultLocation;

const STORAGE_KEY = 'tide-custom-locations';

export const useTideStore = defineStore('tides', () => {
  // State
  const customLocations = ref<CustomLocation[]>([]);
  
  // Default locations (Cordova & Lucena)
  const defaultLocations: DefaultLocation[] = [
    {
      id: 'cordova',
      name: 'Cordova, Cebu',
      latitude: 10.25,
      longitude: 123.95,
      isDefault: true,
    },
    {
      id: 'lucena',
      name: 'Lucena City, Quezon',
      latitude: 13.9333,
      longitude: 121.6167,
      isDefault: true,
    },
  ];

  // Computed
  const locations = computed<Location[]>(() => {
    return [...defaultLocations, ...customLocations.value];
  });

  const totalLocations = computed(() => locations.value.length);

  // Actions
  function loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          customLocations.value = parsed;
        }
      }
    } catch (error) {
      console.error('Failed to load custom locations from localStorage:', error);
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customLocations.value));
    } catch (error) {
      console.error('Failed to save custom locations to localStorage:', error);
    }
  }

  function addCustomLocation(name: string, latitude: number, longitude: number): CustomLocation {
    const newLocation: CustomLocation = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      latitude,
      longitude,
      addedAt: Date.now(),
    };

    customLocations.value.push(newLocation);
    saveToStorage();
    
    return newLocation;
  }

  function removeCustomLocation(id: string): boolean {
    const index = customLocations.value.findIndex(loc => loc.id === id);
    if (index !== -1) {
      customLocations.value.splice(index, 1);
      saveToStorage();
      return true;
    }
    return false;
  }

  function getLocationById(id: string): Location | undefined {
    return locations.value.find(loc => loc.id === id);
  }

  function clearCustomLocations() {
    customLocations.value = [];
    saveToStorage();
  }

  // Initialize
  loadFromStorage();

  return {
    // State
    customLocations,
    defaultLocations,
    
    // Computed
    locations,
    totalLocations,
    
    // Actions
    addCustomLocation,
    removeCustomLocation,
    getLocationById,
    clearCustomLocations,
    loadFromStorage,
  };
});
