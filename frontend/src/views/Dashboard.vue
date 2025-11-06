<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useMMDAStore } from '../stores/mmda';
import { usePagasaStore } from '../stores/pagasa';
import { usePhivolcsStore } from '../stores/phivolcs';
import { useAcledStore } from '../stores/acled';
import { useSettingsStore } from '../stores/settings';

const mmdaStore = useMMDAStore();
const pagasaStore = usePagasaStore();
const phivolcsStore = usePhivolcsStore();
const acledStore = useAcledStore();
const settingsStore = useSettingsStore();

let intervalId: number | null = null;

const fetchAllData = async () => {
  await Promise.all([
    mmdaStore.fetchTraffic(),
    pagasaStore.fetchForecast(),
    pagasaStore.fetchSevereWeather(),
    phivolcsStore.fetchLatestEarthquake(),
    phivolcsStore.fetchVolcanoes(),
    acledStore.fetchIncidents(10),
  ]);
};

onMounted(async () => {
  // Fetch all data on mount
  await fetchAllData();

  // Set up auto-refresh if enabled
  if (settingsStore.autoRefresh) {
    intervalId = window.setInterval(fetchAllData, settingsStore.pollInterval);
  }
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            Incident PH Dashboard
          </h1>
          <p class="text-gray-600 mt-1">
            Real-time monitoring of traffic, weather, geological events, and incidents
          </p>
        </div>
        <RouterLink to="/settings" class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </RouterLink>
      </div>
    </header>

    <!-- Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex space-x-8">
          <RouterLink
            to="/"
            class="border-b-2 border-blue-600 py-4 px-1 text-sm font-medium text-blue-600"
          >
            Dashboard
          </RouterLink>
          <RouterLink
            to="/mmda"
            class="border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700 py-4 px-1 text-sm font-medium text-gray-500"
          >
            MMDA
          </RouterLink>
          <RouterLink
            to="/pagasa"
            class="border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700 py-4 px-1 text-sm font-medium text-gray-500"
          >
            PAGASA
          </RouterLink>
          <RouterLink
            to="/windy"
            class="border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700 py-4 px-1 text-sm font-medium text-gray-500"
          >
            Windy
          </RouterLink>
          <RouterLink
            to="/phivolcs"
            class="border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700 py-4 px-1 text-sm font-medium text-gray-500"
          >
            PHIVOLCS
          </RouterLink>
          <RouterLink
            to="/acled"
            class="border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700 py-4 px-1 text-sm font-medium text-gray-500"
          >
            ACLED
          </RouterLink>
          <RouterLink
            to="/local-weather"
            class="border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700 py-4 px-1 text-sm font-medium text-gray-500"
          >
            Local Weather
          </RouterLink>
          <RouterLink
            to="/settings"
            class="border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700 py-4 px-1 text-sm font-medium text-gray-500"
          >
            Settings
          </RouterLink>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- 2x2 Grid Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <!-- MMDA Widget -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
            <div class="flex items-center">
              <svg class="w-8 h-8 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <h3 class="text-xl font-bold text-white">MMDA Traffic Alerts</h3>
            </div>
            <RouterLink to="/mmda" class="text-white hover:text-blue-100 text-sm">View All →</RouterLink>
          </div>
          <div class="p-6">
            <div v-if="mmdaStore.loading" class="text-center py-8 text-gray-500">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p class="mt-2">Loading traffic data...</p>
            </div>
            <div v-else-if="mmdaStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {{ mmdaStore.error }}
            </div>
            <div v-else-if="mmdaStore.traffic && mmdaStore.traffic.alerts" class="space-y-3 max-h-96 overflow-y-auto">
              <div v-if="mmdaStore.traffic.alerts.length === 0" class="text-center py-8 text-gray-500">
                No traffic alerts available
              </div>
              <div
                v-for="(alert, index) in mmdaStore.traffic.alerts.slice(0, 5)"
                :key="index"
                class="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <p class="text-gray-800 text-sm mb-2">{{ alert.text }}</p>
                <div class="flex items-center justify-between text-xs text-gray-600">
                  <span>{{ new Date(alert.timestamp).toLocaleString() }}</span>
                  <a v-if="alert.url" :href="alert.url" target="_blank" class="text-blue-600 hover:text-blue-800">View →</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PAGASA Widget -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4 flex items-center justify-between">
            <div class="flex items-center">
              <svg class="w-8 h-8 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <h3 class="text-xl font-bold text-white">PAGASA Weather</h3>
            </div>
            <RouterLink to="/pagasa" class="text-white hover:text-yellow-100 text-sm">View All →</RouterLink>
          </div>
          <div class="p-6">
            <div v-if="pagasaStore.loading" class="text-center py-8 text-gray-500">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
              <p class="mt-2">Loading weather data...</p>
            </div>
            <div v-else-if="pagasaStore.severeWeather" class="space-y-3 max-h-96 overflow-y-auto">
              <div v-if="pagasaStore.severeWeather.warnings && pagasaStore.severeWeather.warnings.length > 0">
                <div class="mb-3">
                  <h4 class="font-semibold text-red-600 mb-2">⚠️ Active Warnings</h4>
                  <div v-for="(warning, index) in pagasaStore.severeWeather.warnings.slice(0, 2)" :key="index" class="border border-red-200 rounded-lg p-3 bg-red-50 mb-2">
                    <p class="text-sm text-gray-800 mb-1">{{ warning.text.substring(0, 150) }}...</p>
                    <p class="text-xs text-gray-600">{{ new Date(warning.timestamp).toLocaleString() }}</p>
                  </div>
                </div>
              </div>
              <div v-if="pagasaStore.severeWeather.advisories && pagasaStore.severeWeather.advisories.length > 0">
                <h4 class="font-semibold text-yellow-600 mb-2">📋 Advisories</h4>
                <div v-for="(advisory, index) in pagasaStore.severeWeather.advisories.slice(0, 2)" :key="index" class="border border-yellow-200 rounded-lg p-3 bg-yellow-50 mb-2">
                  <p class="text-sm text-gray-800 mb-1">{{ advisory.text.substring(0, 150) }}...</p>
                  <p class="text-xs text-gray-600">{{ new Date(advisory.timestamp).toLocaleString() }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PHIVOLCS Widget -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex items-center justify-between">
            <div class="flex items-center">
              <svg class="w-8 h-8 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 class="text-xl font-bold text-white">PHIVOLCS</h3>
            </div>
            <RouterLink to="/phivolcs" class="text-white hover:text-red-100 text-sm">View All →</RouterLink>
          </div>
          <div class="p-6">
            <div v-if="phivolcsStore.loading" class="text-center py-8 text-gray-500">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <p class="mt-2">Loading geological data...</p>
            </div>
            <div v-else class="space-y-4 max-h-96 overflow-y-auto">
              <div v-if="phivolcsStore.latestEarthquake && phivolcsStore.latestEarthquake.earthquake" class="border-2 border-red-300 rounded-lg p-4 bg-red-50">
                <h4 class="font-bold text-red-600 mb-3">Latest Earthquake</h4>
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p class="text-gray-600 text-xs">Magnitude</p>
                    <p class="text-2xl font-bold text-red-600">{{ phivolcsStore.latestEarthquake.earthquake.magnitude }}</p>
                  </div>
                  <div>
                    <p class="text-gray-600 text-xs">Location</p>
                    <p class="font-semibold">{{ phivolcsStore.latestEarthquake.earthquake.location }}</p>
                  </div>
                  <div>
                    <p class="text-gray-600 text-xs">Depth</p>
                    <p class="font-semibold">{{ phivolcsStore.latestEarthquake.earthquake.depth }}</p>
                  </div>
                  <div>
                    <p class="text-gray-600 text-xs">Time</p>
                    <p class="font-semibold">{{ new Date(phivolcsStore.latestEarthquake.earthquake.dateTime).toLocaleString() }}</p>
                  </div>
                </div>
              </div>
              <div v-if="phivolcsStore.volcanoes && phivolcsStore.volcanoes.volcanoes">
                <h4 class="font-semibold text-gray-700 mb-2">Active Volcanoes ({{ phivolcsStore.volcanoes.volcanoes.length }})</h4>
                <div class="space-y-2">
                  <div
                    v-for="(volcano, index) in phivolcsStore.volcanoes.volcanoes.slice(0, 3)"
                    :key="index"
                    class="border border-gray-200 rounded-lg p-3"
                  >
                    <div class="flex justify-between items-start">
                      <div>
                        <p class="font-semibold text-gray-900">{{ volcano.name }}</p>
                        <p class="text-sm text-gray-600">Alert: {{ volcano.alertLevel }}</p>
                      </div>
                      <span class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">{{ volcano.status }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ACLED Widget -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between">
            <div class="flex items-center">
              <svg class="w-8 h-8 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 class="text-xl font-bold text-white">ACLED Incidents</h3>
            </div>
            <RouterLink to="/acled" class="text-white hover:text-purple-100 text-sm">View All →</RouterLink>
          </div>
          <div class="p-6">
            <div v-if="acledStore.loading" class="text-center py-8 text-gray-500">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p class="mt-2">Loading incidents...</p>
            </div>
            <div v-else-if="acledStore.incidents && acledStore.incidents.incidents" class="space-y-3 max-h-96 overflow-y-auto">
              <div v-if="acledStore.incidents.incidents.length === 0" class="text-center py-8 text-gray-500">
                No incidents reported
              </div>
              <div
                v-for="(incident, index) in acledStore.incidents.incidents.slice(0, 5)"
                :key="index"
                class="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <div class="flex justify-between items-start mb-2">
                  <h4 class="font-semibold text-gray-900 text-sm">{{ incident.eventType }}</h4>
                  <span v-if="incident.fatalities" class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                    {{ incident.fatalities }} fatalities
                  </span>
                </div>
                <p class="text-xs text-gray-600 mb-1">{{ incident.admin1 }}, {{ incident.location }}</p>
                <p class="text-xs text-gray-500">{{ incident.eventDate }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Section -->
      <div class="bg-white rounded-lg shadow-md p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">About Incident PH</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          Incident PH is a comprehensive monitoring dashboard that aggregates real-time data from multiple
          official Philippine sources including:
        </p>
        <ul class="list-disc list-inside space-y-2 text-gray-700">
          <li><strong>MMDA:</strong> Metro Manila traffic alerts and highway information</li>
          <li><strong>PAGASA:</strong> Weather forecasts, severe weather warnings, and tropical cyclone bulletins</li>
          <li><strong>PHIVOLCS:</strong> Earthquake data and volcano status monitoring</li>
          <li><strong>ACLED:</strong> Conflict and incident reports across the Philippines</li>
        </ul>
      </div>
    </main>
  </div>
</template>

<style scoped>
.router-link-active {
  border-bottom-color: #2563eb !important;
  color: #2563eb !important;
}
</style>

