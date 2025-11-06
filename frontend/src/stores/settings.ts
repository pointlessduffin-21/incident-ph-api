import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

const DEFAULT_POLL_INTERVAL = 60000; // 60 seconds in milliseconds
const STORAGE_KEY = 'incident_ph_settings';

interface SettingsState {
  pollInterval: number;
  autoRefresh: boolean;
}

export const useSettingsStore = defineStore('settings', () => {
  const pollInterval = ref<number>(DEFAULT_POLL_INTERVAL);
  const autoRefresh = ref<boolean>(true);

  // Load settings from localStorage on init
  function loadSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: SettingsState = JSON.parse(stored);
        pollInterval.value = parsed.pollInterval || DEFAULT_POLL_INTERVAL;
        autoRefresh.value = parsed.autoRefresh !== undefined ? parsed.autoRefresh : true;
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  // Save settings to localStorage
  function saveSettings() {
    try {
      const settings: SettingsState = {
        pollInterval: pollInterval.value,
        autoRefresh: autoRefresh.value,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  // Update poll interval
  function updatePollInterval(interval: number) {
    pollInterval.value = Math.max(10000, interval); // Minimum 10 seconds
    saveSettings();
  }

  // Toggle auto refresh
  function toggleAutoRefresh() {
    autoRefresh.value = !autoRefresh.value;
    saveSettings();
  }

  // Reset to defaults
  function resetSettings() {
    pollInterval.value = DEFAULT_POLL_INTERVAL;
    autoRefresh.value = true;
    saveSettings();
  }

  // Format interval for display
  function getFormattedInterval(): string {
    const seconds = Math.floor(pollInterval.value / 1000);
    if (seconds < 60) {
      return `${seconds} seconds`;
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  // Initialize by loading settings
  loadSettings();

  // Watch for changes and save
  watch([pollInterval, autoRefresh], () => {
    saveSettings();
  });

  return {
    pollInterval,
    autoRefresh,
    updatePollInterval,
    toggleAutoRefresh,
    resetSettings,
    getFormattedInterval,
  };
});





