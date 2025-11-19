<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-blue-100">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <RouterLink to="/" class="text-blue-600 hover:text-blue-800 transition">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </RouterLink>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">🌊 Tide Monitoring Dashboard</h1>
              <p class="text-sm text-gray-600">Real-time tide predictions for multiple locations</p>
            </div>
          </div>
          <button 
            @click="refreshAllData"
            :disabled="loading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh All</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Sub Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="container mx-auto px-4">
        <div class="flex space-x-8">
          <RouterLink
            to="/tides"
            class="border-b-2 border-blue-600 py-4 px-1 text-sm font-medium text-blue-600"
          >
            Dashboard
          </RouterLink>
          <RouterLink
            to="/tides/cordova"
            class="border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700 py-4 px-1 text-sm font-medium text-gray-500"
          >
            Cordova
          </RouterLink>
          <RouterLink
            to="/tides/lucena"
            class="border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700 py-4 px-1 text-sm font-medium text-gray-500"
          >
            Lucena City
          </RouterLink>
          <RouterLink
            to="/tides/settings"
            class="border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700 py-4 px-1 text-sm font-medium text-gray-500"
          >
            Settings
          </RouterLink>
        </div>
      </div>
    </nav>

    <main class="container mx-auto px-4 py-8">
      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Active Locations</p>
              <p class="text-3xl font-bold text-gray-900">{{ tideStore.locations.length }}</p>
            </div>
            <div class="bg-blue-100 rounded-full p-3">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Next High Tide</p>
              <p class="text-xl font-bold text-blue-700">{{ getNextHighTide() }}</p>
            </div>
            <div class="bg-blue-100 rounded-full p-3">
              <span class="text-3xl">⬆️</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Next Low Tide</p>
              <p class="text-xl font-bold text-orange-700">{{ getNextLowTide() }}</p>
            </div>
            <div class="bg-orange-100 rounded-full p-3">
              <span class="text-3xl">⬇️</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Last Updated</p>
              <p class="text-sm font-medium text-gray-900">{{ getLastUpdated() }}</p>
            </div>
            <div class="bg-green-100 rounded-full p-3">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Location Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Cordova -->
        <div v-if="cordovaTides" class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
          <div class="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
            <div class="flex items-center justify-between mb-2">
              <h2 class="text-2xl font-bold">Cordova, Cebu</h2>
              <RouterLink to="/tides/cordova" class="text-white hover:text-blue-100">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </RouterLink>
            </div>
            <p class="text-blue-100 text-sm">📍 {{ cordovaTides.latitude.toFixed(4) }}°N, {{ cordovaTides.longitude.toFixed(4) }}°E</p>
          </div>
          
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Today's Tides</h3>
            <div class="space-y-3">
              <div
                v-for="(tide, index) in cordovaTides.today.slice(0, 4)"
                :key="index"
                class="flex items-center justify-between p-3 rounded-lg"
                :class="tide.type === 'High Tide' ? 'bg-blue-50' : 'bg-orange-50'"
              >
                <div class="flex items-center space-x-3">
                  <span class="text-2xl">{{ tide.type === 'High Tide' ? '⬆️' : '⬇️' }}</span>
                  <div>
                    <div class="text-sm font-semibold" :class="tide.type === 'High Tide' ? 'text-blue-900' : 'text-orange-900'">
                      {{ tide.type }}
                    </div>
                    <div class="text-lg font-bold text-gray-900">{{ tide.time }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-xl font-bold" :class="tide.type === 'High Tide' ? 'text-blue-700' : 'text-orange-700'">
                    {{ tide.heightMeters.toFixed(2) }}m
                  </div>
                  <div class="text-xs text-gray-600">{{ tide.heightFeet.toFixed(1) }}ft</div>
                </div>
              </div>
            </div>
            <RouterLink to="/tides/cordova" class="block mt-4 text-center text-blue-600 hover:text-blue-800 font-medium">
              View Full Forecast →
            </RouterLink>
          </div>
        </div>

        <!-- Lucena City -->
        <div v-if="lucenaTides" class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
          <div class="bg-gradient-to-r from-teal-600 to-green-600 p-6 text-white">
            <div class="flex items-center justify-between mb-2">
              <h2 class="text-2xl font-bold">Lucena City, Quezon</h2>
              <RouterLink to="/tides/lucena" class="text-white hover:text-teal-100">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </RouterLink>
            </div>
            <p class="text-teal-100 text-sm">📍 {{ lucenaTides.latitude.toFixed(4) }}°N, {{ lucenaTides.longitude.toFixed(4) }}°E</p>
          </div>
          
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Today's Tides</h3>
            <div class="space-y-3">
              <div
                v-for="(tide, index) in lucenaTides.today.slice(0, 4)"
                :key="index"
                class="flex items-center justify-between p-3 rounded-lg"
                :class="tide.type === 'High Tide' ? 'bg-blue-50' : 'bg-orange-50'"
              >
                <div class="flex items-center space-x-3">
                  <span class="text-2xl">{{ tide.type === 'High Tide' ? '⬆️' : '⬇️' }}</span>
                  <div>
                    <div class="text-sm font-semibold" :class="tide.type === 'High Tide' ? 'text-blue-900' : 'text-orange-900'">
                      {{ tide.type }}
                    </div>
                    <div class="text-lg font-bold text-gray-900">{{ tide.time }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-xl font-bold" :class="tide.type === 'High Tide' ? 'text-blue-700' : 'text-orange-700'">
                    {{ tide.heightMeters.toFixed(2) }}m
                  </div>
                  <div class="text-xs text-gray-600">{{ tide.heightFeet.toFixed(1) }}ft</div>
                </div>
              </div>
            </div>
            <RouterLink to="/tides/lucena" class="block mt-4 text-center text-teal-600 hover:text-teal-800 font-medium">
              View Full Forecast →
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Additional Locations -->
      <div v-if="tideStore.customLocations.length > 0" class="mt-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Custom Locations</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="location in tideStore.customLocations"
            :key="location.id"
            class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
          >
            <div class="flex items-start justify-between mb-3">
              <div>
                <h3 class="text-lg font-bold text-gray-900">{{ location.name }}</h3>
                <p class="text-sm text-gray-600">{{ location.latitude.toFixed(4) }}°N, {{ location.longitude.toFixed(4) }}°E</p>
              </div>
              <button
                @click="removeLocation(location.id)"
                class="text-red-500 hover:text-red-700"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <div class="text-sm text-gray-700">
              <p>Status: <span class="text-green-600 font-semibold">Active</span></p>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Box -->
      <div class="mt-8 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
        <div class="flex items-start">
          <svg class="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 class="font-bold text-blue-900 mb-2">About Tide Predictions</h4>
            <p class="text-sm text-blue-800 leading-relaxed">
              Tide predictions are calculated based on astronomical tidal patterns and local geography. 
              Times and heights are estimates and may vary due to weather conditions, atmospheric pressure, and other factors.
              Always check official sources for navigation and safety-critical applications.
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useTideStore } from '../stores/tides';
import * as tideService from '../services/tides';
import type { TideForecast } from '../services/tides';

const tideStore = useTideStore();
const loading = ref(false);
const cordovaTides = ref<TideForecast | null>(null);
const lucenaTides = ref<TideForecast | null>(null);

async function refreshAllData() {
  loading.value = true;
  try {
    console.log('🌊 Fetching tide data for all locations...');
    const [cordova, lucena] = await Promise.all([
      tideService.getCordovaTideForecast(),
      tideService.getLucenaTideForecast(),
    ]);
    
    cordovaTides.value = cordova;
    lucenaTides.value = lucena;
    
    console.log('✅ All tide data loaded');
    console.log('  Cordova:', cordova?.source);
    console.log('  Lucena:', lucena?.source);
  } catch (error) {
    console.error('Failed to fetch tide data:', error);
  } finally {
    loading.value = false;
  }
}

function getNextHighTide(): string {
  const allTides = [
    ...(cordovaTides.value?.today || []),
    ...(lucenaTides.value?.today || []),
  ].filter(t => t.type === 'High Tide');
  
  if (allTides.length === 0) return '--:--';
  return allTides[0]?.time || '--:--';
}

function getNextLowTide(): string {
  const allTides = [
    ...(cordovaTides.value?.today || []),
    ...(lucenaTides.value?.today || []),
  ].filter(t => t.type === 'Low Tide');
  
  if (allTides.length === 0) return '--:--';
  return allTides[0]?.time || '--:--';
}

function getLastUpdated(): string {
  if (cordovaTides.value) {
    const date = new Date(cordovaTides.value.lastUpdated);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  return 'Just now';
}

function removeLocation(id: string) {
  tideStore.removeCustomLocation(id);
}

onMounted(() => {
  refreshAllData();
});
</script>
