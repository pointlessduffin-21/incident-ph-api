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
              <h1 class="text-2xl font-bold text-gray-900">🌊 Tide Forecast</h1>
              <p class="text-sm text-gray-600">Real-time tide predictions for Philippine coastal areas</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button 
              @click="showIframeModal = true"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>Embed Widget</span>
            </button>
            <button 
              @click="refreshData"
              :disabled="loading"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="loading && !tideForecast" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p class="text-lg text-gray-700">Loading tide forecast...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-6">
        <div class="flex items-start">
          <svg class="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 class="text-lg font-semibold text-red-900 mb-1">Failed to Load Tide Data</h3>
            <p class="text-red-800">{{ error }}</p>
            <button @click="refreshData" class="mt-3 text-red-700 underline hover:text-red-900">
              Try Again
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else-if="tideForecast" class="space-y-6">
        <!-- Location Info Card -->
        <div class="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-3xl font-bold mb-2">{{ tideForecast.location }}</h2>
              <p class="text-blue-100 text-sm">
                📍 {{ tideForecast.latitude.toFixed(4) }}°N, {{ tideForecast.longitude.toFixed(4) }}°E
              </p>
              <p class="text-blue-100 text-sm mt-1">
                🕐 {{ tideForecast.timezone }}
              </p>
            </div>
            <div class="text-right">
              <div class="text-sm text-blue-100 mb-1">Next Tide</div>
              <div v-if="nextTideInfo.nextTide" class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3">
                <div class="text-2xl font-bold">{{ nextTideInfo.nextTide.type === 'High Tide' ? '⬆️' : '⬇️' }}</div>
                <div class="text-sm mt-1">{{ nextTideInfo.nextTide.time }}</div>
                <div class="text-xs mt-1">in {{ nextTideInfo.timeToNextTide }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Today's Tides -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-2xl font-bold text-gray-900">Today</h3>
              <span class="text-sm text-gray-500">{{ new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }}</span>
            </div>
            
            <div v-if="tideForecast.today.length === 0" class="text-center py-8 text-gray-500">
              <svg class="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No tide data available for today</p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="(tide, index) in tideForecast.today"
                :key="index"
                class="relative overflow-hidden rounded-lg border-2 transition-all hover:shadow-md"
                :class="tide.type === 'High Tide' ? 'border-blue-300 bg-blue-50' : 'border-orange-300 bg-orange-50'"
              >
                <div class="flex items-center justify-between p-4">
                  <div class="flex items-center space-x-4">
                    <div class="text-4xl">
                      {{ tide.type === 'High Tide' ? '⬆️' : '⬇️' }}
                    </div>
                    <div>
                      <div class="text-lg font-bold" :class="tide.type === 'High Tide' ? 'text-blue-900' : 'text-orange-900'">
                        {{ tide.type }}
                      </div>
                      <div class="text-2xl font-bold text-gray-900 mt-1">{{ tide.time }}</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-3xl font-bold" :class="tide.type === 'High Tide' ? 'text-blue-700' : 'text-orange-700'">
                      {{ tide.heightMeters.toFixed(2) }}m
                    </div>
                    <div class="text-sm text-gray-600 mt-1">{{ tide.heightFeet.toFixed(1) }} ft</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tomorrow's Tides -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-2xl font-bold text-gray-900">Tomorrow</h3>
              <span class="text-sm text-gray-500">{{ getTomorrowDate() }}</span>
            </div>
            
            <div v-if="tideForecast.tomorrow.length === 0" class="text-center py-8 text-gray-500">
              <svg class="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No tide data available for tomorrow</p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="(tide, index) in tideForecast.tomorrow"
                :key="index"
                class="relative overflow-hidden rounded-lg border-2 transition-all hover:shadow-md"
                :class="tide.type === 'High Tide' ? 'border-blue-300 bg-blue-50' : 'border-orange-300 bg-orange-50'"
              >
                <div class="flex items-center justify-between p-4">
                  <div class="flex items-center space-x-4">
                    <div class="text-4xl">
                      {{ tide.type === 'High Tide' ? '⬆️' : '⬇️' }}
                    </div>
                    <div>
                      <div class="text-lg font-bold" :class="tide.type === 'High Tide' ? 'text-blue-900' : 'text-orange-900'">
                        {{ tide.type }}
                      </div>
                      <div class="text-2xl font-bold text-gray-900 mt-1">{{ tide.time }}</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-3xl font-bold" :class="tide.type === 'High Tide' ? 'text-blue-700' : 'text-orange-700'">
                      {{ tide.heightMeters.toFixed(2) }}m
                    </div>
                    <div class="text-sm text-gray-600 mt-1">{{ tide.heightFeet.toFixed(1) }} ft</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Extended Forecast -->
        <div v-if="tideForecast.nextDays.length > 0" class="bg-white rounded-xl shadow-lg p-6">
          <h3 class="text-2xl font-bold text-gray-900 mb-6">Extended Forecast</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="(dayData, index) in tideForecast.nextDays"
              :key="index"
              class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition"
            >
              <div class="font-bold text-gray-900 mb-3 text-center border-b pb-2">
                {{ dayData.date }}
              </div>
              <div class="space-y-2">
                <div
                  v-for="(tide, tideIndex) in dayData.tides"
                  :key="tideIndex"
                  class="flex items-center justify-between text-sm"
                >
                  <div class="flex items-center space-x-2">
                    <span class="text-lg">{{ tide.type === 'High Tide' ? '⬆️' : '⬇️' }}</span>
                    <span class="font-medium text-gray-700">{{ tide.time }}</span>
                  </div>
                  <div class="text-right">
                    <div class="font-bold" :class="tide.type === 'High Tide' ? 'text-blue-700' : 'text-orange-700'">
                      {{ tide.heightMeters.toFixed(2) }}m
                    </div>
                    <div class="text-xs text-gray-500">{{ tide.heightFeet.toFixed(1) }}ft</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Info Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Tide Chart Info -->
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg p-6">
            <div class="flex items-start">
              <svg class="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 class="font-bold text-blue-900 mb-2">Understanding Tides</h4>
                <p class="text-sm text-blue-800 leading-relaxed">
                  ⬆️ <strong>High Tide</strong>: Water level is at its highest. Best time for deep-water activities and boat launching.<br>
                  ⬇️ <strong>Low Tide</strong>: Water level is at its lowest. Ideal for beachcombing, reef exploration, and fishing.
                </p>
              </div>
            </div>
          </div>

          <!-- Data Source Info -->
          <div class="bg-gradient-to-br from-cyan-50 to-teal-100 border-l-4 border-cyan-500 rounded-lg p-6">
            <div class="flex items-start">
              <svg class="w-6 h-6 text-cyan-600 mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <h4 class="font-bold text-cyan-900 mb-2">Data Source</h4>
                <p class="text-sm text-cyan-800 leading-relaxed">
                  Tide predictions sourced from <strong>{{ tideForecast.source }}</strong>.<br>
                  Data is based on Mean Lower Low Water (MLLW) satellite measurements.<br>
                  Last updated: {{ new Date(tideForecast.lastUpdated).toLocaleString() }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Iframe Modal -->
    <IframeModal
      v-model="showIframeModal"
      title="Embed Tide Forecast Widget"
      description="Copy the URL or embed code below to integrate the tide forecast widget into your website or application."
      :iframe-url="iframeUrl"
      width="100%"
      height="800"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { RouterLink } from 'vue-router';
import IframeModal from '../components/IframeModal.vue';
import * as tideService from '../services/tides';
import type { TideForecast } from '../services/tides';

const tideForecast = ref<TideForecast | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const showIframeModal = ref(false);

const iframeUrl = computed(() => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/tides`;
});

const nextTideInfo = computed(() => {
  if (!tideForecast.value || tideForecast.value.today.length === 0) {
    return { state: 'Unknown', nextTide: null, timeToNextTide: 'Unknown' };
  }
  return tideService.getCurrentTideState(tideForecast.value.today);
});

async function refreshData() {
  loading.value = true;
  error.value = null;

  try {
    const data = await tideService.getCordovaTideForecast();
    if (data) {
      tideForecast.value = data;
    } else {
      error.value = 'No tide data available for this location';
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch tide forecast';
    console.error('Tide forecast error:', err);
  } finally {
    loading.value = false;
  }
}

function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

onMounted(() => {
  refreshData();
});
</script>
