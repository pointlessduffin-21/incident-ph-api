<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <RouterLink to="/" class="text-blue-600 hover:text-blue-800 mb-2 inline-block">
          ← Back to Dashboard
        </RouterLink>
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              {{ weatherStore.location.name }}
            </h1>
            <p class="text-gray-600 mt-1">Live Weather & Typhoon Monitoring</p>
          </div>
          <div v-if="weatherStore.lastUpdated" class="text-right text-sm text-gray-500">
            <p>Last Updated</p>
            <p class="font-semibold">{{ new Date(weatherStore.lastUpdated).toLocaleTimeString() }}</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 2-Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Left Column: Typhoon Reports (2/3 width) -->
        <div class="lg:col-span-2">
          <div class="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg shadow-lg p-6 mb-6">
            <div class="flex items-center">
              <svg class="w-10 h-10 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <div>
                <h2 class="text-3xl font-bold">🌀 Philippine Typhoon Monitoring</h2>
                <p class="mt-1 text-blue-100">Recent & Historical Tropical Cyclones</p>
              </div>
            </div>
          </div>

          <!-- No Typhoons Message -->
          <div v-if="!weatherStore.loading && (!weatherStore.philippineTyphoons || weatherStore.philippineTyphoons.length === 0)" class="mb-6">
          <div class="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
            <div class="flex items-center">
              <svg class="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 class="text-lg font-semibold text-green-900">No Active Typhoons</h3>
                <p class="text-sm text-green-800 mt-1">
                  Currently no tropical cyclones are affecting or threatening the Philippines according to GDACS and PAGASA monitoring systems.
                  This page will automatically update when new typhoon data becomes available.
                </p>
              </div>
            </div>
          </div>
        </div>

          <!-- Philippine Typhoons Scrollable Widget -->
          <div v-if="weatherStore.philippineTyphoons && weatherStore.philippineTyphoons.length > 0">
            <div class="bg-white rounded-lg shadow-lg overflow-hidden">
              <div class="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4">
                <h3 class="text-lg font-bold">📋 Active Typhoon Reports ({{ weatherStore.philippineTyphoons.length }})</h3>
                <p class="text-sm text-blue-100 mt-1">Real-time data from JTWC & GDACS</p>
              </div>
              <div class="p-4" style="max-height: 700px; overflow-y: auto;">
              <div class="space-y-3">
                <div
                  v-for="(typhoon, index) in weatherStore.philippineTyphoons"
                  :key="index"
                  class="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <!-- Compact Typhoon Card -->
                  <div 
                    :class="`p-3 border-l-4 ${
                      typhoon.status === 'Active' ? 'border-red-500 bg-red-50' :
                      typhoon.status === 'Dissipated' ? 'border-orange-500 bg-orange-50' :
                      'border-gray-500 bg-gray-50'
                    }`"
                  >
                    <div class="flex justify-between items-start mb-2">
                      <div class="flex-1">
                        <h4 class="text-base font-bold text-gray-900">{{ typhoon.name }}</h4>
                        <p v-if="typhoon.internationalName && typhoon.internationalName !== typhoon.name" class="text-xs text-gray-600">
                          {{ typhoon.internationalName }}
                        </p>
                      </div>
                      <span 
                        :class="`px-2 py-1 rounded-full text-xs font-semibold ml-2 ${
                          typhoon.status === 'Active' ? 'bg-red-100 text-red-700' :
                          typhoon.status === 'Dissipated' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`"
                      >
                        {{ typhoon.status }}
                      </span>
                    </div>
                    
                    <div class="grid grid-cols-3 gap-2 mb-2 text-xs">
                      <div>
                        <p class="text-gray-600">Category</p>
                        <p class="font-semibold text-gray-900">{{ typhoon.category }}</p>
                      </div>
                      <div>
                        <p class="text-gray-600">Date</p>
                        <p class="font-semibold text-gray-900">{{ typhoon.date }}</p>
                      </div>
                      <div>
                        <p class="text-gray-600">Source</p>
                        <p class="font-semibold text-gray-900">{{ typhoon.source || 'N/A' }}</p>
                      </div>
                    </div>
                    
                    <div class="mt-2">
                      <p class="text-xs text-gray-700 line-clamp-2">{{ typhoon.description }}</p>
                    </div>
                    
                    <!-- Collapsible Track Forecast -->
                    <div v-if="typhoon.trackImageUrl" class="mt-3 border-t pt-3">
                      <details class="group">
                        <summary class="flex items-center justify-between cursor-pointer text-xs font-semibold text-gray-700 hover:text-blue-600 transition">
                          <span>📍 Track Forecast</span>
                          <svg class="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        <div class="mt-2">
                          <img 
                            :src="typhoon.trackImageUrl" 
                            :alt="`${typhoon.name} track forecast`"
                            class="w-full rounded border border-gray-200 hover:border-blue-400 transition cursor-pointer"
                            @click="() => { if (typeof window !== 'undefined') window.open(typhoon.trackImageUrl, '_blank') }"
                          />
                        </div>
                      </details>
                    </div>
                    
                    <!-- Collapsible Satellite Image -->
                    <div v-if="typhoon.satelliteImageUrl" class="mt-3 border-t pt-3">
                      <details class="group">
                        <summary class="flex items-center justify-between cursor-pointer text-xs font-semibold text-gray-700 hover:text-blue-600 transition">
                          <span>🛰️ Satellite Imagery</span>
                          <svg class="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        <div class="mt-2">
                          <img 
                            :src="typhoon.satelliteImageUrl" 
                            :alt="`${typhoon.name} satellite imagery`"
                            class="w-full rounded border border-gray-200 hover:border-blue-400 transition cursor-pointer"
                            @click="() => { if (typeof window !== 'undefined') window.open(typhoon.satelliteImageUrl, '_blank') }"
                          />
                        </div>
                      </details>
                    </div>
                    
                    <!-- Advisory Links -->
                    <div v-if="typhoon.advisoryUrl || typhoon.trackImageUrl || typhoon.satelliteImageUrl" class="mt-3 border-t pt-3">
                      <p class="text-xs font-semibold text-gray-700 mb-2">🔗 Full Advisory:</p>
                      <div class="flex flex-wrap gap-2">
                        <a 
                          v-if="typhoon.advisoryUrl"
                          :href="typhoon.advisoryUrl" 
                          target="_blank"
                          class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition"
                        >
                          📄 Warning Text
                        </a>
                        <a 
                          v-if="typhoon.trackImageUrl"
                          :href="typhoon.trackImageUrl" 
                          target="_blank"
                          class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition"
                        >
                          🗺️ Track Graphic
                        </a>
                        <a 
                          v-if="typhoon.satelliteImageUrl"
                          :href="typhoon.satelliteImageUrl" 
                          target="_blank"
                          class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition"
                        >
                          🛰️ Satellite
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

          <!-- Loading State -->
          <div v-if="weatherStore.loadingPagasa || weatherStore.loadingGdacs" class="text-center py-4">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mt-2 text-gray-600">Loading additional typhoon data...</p>
          </div>
          
          <!-- Info Box -->
          <div class="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <div class="flex">
              <svg class="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="text-sm text-blue-800">
                <p class="font-semibold mb-1">Typhoon Information Sources</p>
                <p>Data compiled from PAGASA official reports, GDACS global monitoring system, and historical records of tropical cyclones affecting the Philippines.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Current Weather (1/3 width) -->
        <div class="lg:col-span-1">
          <!-- Current Weather Section -->
          <div v-if="weatherStore.currentWeather" class="mb-6 sticky top-4">
            <div class="bg-white rounded-lg shadow-lg p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">Current Weather</h2>
              
              <div class="grid grid-cols-2 gap-4">
                <!-- Temperature & Condition -->
                <div class="col-span-2 text-center pb-4 border-b">
                  <div class="text-4xl font-bold text-gray-900">
                    {{ Math.round(weatherStore.currentWeather.temp) }}°C
                  </div>
                  <div class="text-sm text-gray-600 mt-1">
                    Feels like {{ Math.round(weatherStore.currentWeather.feels_like) }}°C
                  </div>
                  <div v-if="weatherStore.currentWeather.weather && weatherStore.currentWeather.weather.length" class="mt-2">
                    <img
                      :src="weatherStore.getWeatherIcon(weatherStore.currentWeather.weather[0]?.icon || '')"
                      :alt="weatherStore.currentWeather.weather[0]?.description || ''"
                      class="w-12 h-12 mx-auto"
                    />
                    <div class="text-xs text-gray-700 capitalize">
                      {{ weatherStore.currentWeather.weather[0]?.description || '' }}
                    </div>
                  </div>
                </div>

                <!-- Wind -->
                <div class="text-center">
                  <div class="text-gray-600 text-xs mb-1">Wind</div>
                  <div class="text-lg font-semibold text-gray-900">
                    {{ (weatherStore.currentWeather.wind_speed * 3.6).toFixed(1) }}
                  </div>
                  <div class="text-xs text-gray-600">km/h</div>
                  <div class="text-xs text-gray-600 mt-1">
                    {{ weatherStore.getWindDirection(weatherStore.currentWeather.wind_deg) }}
                  </div>
                </div>

                <!-- Humidity -->
                <div class="text-center">
                  <div class="text-gray-600 text-xs mb-1">Humidity</div>
                  <div class="text-lg font-semibold text-gray-900">
                    {{ weatherStore.currentWeather.humidity }}
                  </div>
                  <div class="text-xs text-gray-600">%</div>
                </div>

                <!-- Pressure -->
                <div class="text-center">
                  <div class="text-gray-600 text-xs mb-1">Pressure</div>
                  <div class="text-lg font-semibold text-gray-900">
                    {{ weatherStore.currentWeather.pressure }}
                  </div>
                  <div class="text-xs text-gray-600">hPa</div>
                </div>

                <!-- Visibility -->
                <div class="text-center">
                  <div class="text-gray-600 text-xs mb-1">Visibility</div>
                  <div class="text-lg font-semibold text-gray-900">
                    {{ (weatherStore.currentWeather.visibility / 1000).toFixed(1) }}
                  </div>
                  <div class="text-xs text-gray-600">km</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 7-Day Forecast -->
          <div v-if="weatherStore.forecast && weatherStore.forecast.length">
            <div class="bg-white rounded-lg shadow-lg p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">7-Day Forecast</h2>
              
              <div class="space-y-2">
                <div
                  v-for="(day, index) in weatherStore.forecast.slice(0, 7)"
                  :key="index"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div class="flex items-center space-x-3 flex-1">
                    <div class="text-xs font-semibold text-gray-900 w-12">
                      {{ new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }) }}
                    </div>
                    <img
                      v-if="day.weather && day.weather.length"
                      :src="weatherStore.getWeatherIcon(day.weather[0]?.icon || '')"
                      :alt="day.weather[0]?.description || ''"
                      class="w-8 h-8"
                    />
                  </div>
                  <div class="flex items-center space-x-2">
                    <div class="text-sm font-bold text-gray-900">
                      {{ Math.round(day.temp.max) }}°
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ Math.round(day.temp.min) }}°
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Link to Tide Forecast -->
          <div class="mt-6">
            <RouterLink 
              to="/tides"
              class="block bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg shadow-lg p-6 hover:from-blue-600 hover:to-cyan-600 transition-all hover:shadow-xl"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="text-4xl">🌊</div>
                  <div>
                    <h3 class="text-xl font-bold mb-1">Tide Forecast</h3>
                    <p class="text-blue-100 text-sm">View complete tide schedules for coastal areas</p>
                  </div>
                </div>
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Info Note -->
      <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex">
          <svg class="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="text-sm text-blue-800">
            <p class="font-semibold mb-1">About this page</p>
            <p>
              This page provides real-time weather data for Pagbilao, Quezon and typhoon information for the Philippines.
              Data is sourced from OpenWeather API, JTWC (US Navy), GDACS, PAGASA, and tide-forecast.com. 
              Weather and tide data update automatically based on your refresh settings.
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useLocalWeatherStore } from '../stores/localWeather';
import { useSettingsStore } from '../stores/settings';

const weatherStore = useLocalWeatherStore();
const settingsStore = useSettingsStore();

let refreshInterval: number | null = null;

onMounted(async () => {
  // Initial data fetch
  await weatherStore.fetchAllData();
  
  // Set up auto-refresh based on settings
  const refreshMinutes = settingsStore.pollInterval / 60000; // Convert ms to minutes
  if (refreshMinutes > 0) {
    refreshInterval = window.setInterval(() => {
      weatherStore.fetchAllData();
    }, refreshMinutes * 60 * 1000);
  }
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<style scoped>
/* Custom animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bg-white {
  animation: fadeIn 0.3s ease-in-out;
}
</style>
