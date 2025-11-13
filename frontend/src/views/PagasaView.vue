<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePagasaStore } from '../stores/pagasa';
import { RouterLink } from 'vue-router';
import IframeModal from '../components/IframeModal.vue';

const pagasaStore = usePagasaStore();
const showIframeModal = ref(false);

const iframeUrl = computed(() => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/pagasa`;
});

onMounted(async () => {
  await pagasaStore.fetchForecast();
  await pagasaStore.fetchSevereWeather();
  await pagasaStore.fetchTropicalCyclones();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div>
            <RouterLink to="/" class="text-blue-600 hover:text-blue-800 mb-2 inline-block">
              ← Back to Dashboard
            </RouterLink>
            <h1 class="text-3xl font-bold text-gray-900">PAGASA Weather</h1>
            <p class="text-gray-600 mt-1">Philippine Atmospheric, Geophysical and Astronomical Services Administration</p>
          </div>
          <button 
            @click="showIframeModal = true"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>Embed Widget</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <!-- Forecast -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Weather Forecast</h2>
        <div v-if="pagasaStore.forecast && pagasaStore.forecast.updates" class="space-y-4">
          <div
            v-for="(update, index) in pagasaStore.forecast.updates"
            :key="index"
            class="border border-gray-200 rounded-lg p-4"
          >
            <p class="text-gray-800">{{ update.text }}</p>
            <p class="text-sm text-gray-600 mt-2">
              {{ new Date(update.timestamp).toLocaleString() }}
            </p>
          </div>
        </div>
      </div>

      <!-- Severe Weather -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Severe Weather</h2>
        <div v-if="pagasaStore.severeWeather">
          <div v-if="pagasaStore.severeWeather.warnings && pagasaStore.severeWeather.warnings.length > 0" class="mb-6">
            <h3 class="font-semibold text-red-600 mb-2">Warnings</h3>
            <div class="space-y-3">
              <div
                v-for="(warning, index) in pagasaStore.severeWeather.warnings"
                :key="index"
                class="border border-red-200 rounded-lg p-4 bg-red-50"
              >
                <p class="text-gray-800">{{ warning.text }}</p>
                <p class="text-sm text-gray-600 mt-2">
                  {{ new Date(warning.timestamp).toLocaleString() }}
                </p>
              </div>
            </div>
          </div>

          <div v-if="pagasaStore.severeWeather.advisories && pagasaStore.severeWeather.advisories.length > 0">
            <h3 class="font-semibold text-yellow-600 mb-2">Advisories</h3>
            <div class="space-y-3">
              <div
                v-for="(advisory, index) in pagasaStore.severeWeather.advisories"
                :key="index"
                class="border border-yellow-200 rounded-lg p-4 bg-yellow-50"
              >
                <p class="text-gray-800">{{ advisory.text }}</p>
                <p class="text-sm text-gray-600 mt-2">
                  {{ new Date(advisory.timestamp).toLocaleString() }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tropical Cyclones -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Tropical Cyclones</h2>
        <div v-if="pagasaStore.tropicalCyclones && pagasaStore.tropicalCyclones.updates" class="space-y-4">
          <div
            v-for="(update, index) in pagasaStore.tropicalCyclones.updates"
            :key="index"
            class="border border-blue-200 rounded-lg p-4 bg-blue-50"
          >
            <p class="text-gray-800">{{ update.text }}</p>
            <p class="text-sm text-gray-600 mt-2">
              {{ new Date(update.timestamp).toLocaleString() }}
            </p>
          </div>
        </div>
      </div>
    </main>

    <!-- Iframe Modal -->
    <IframeModal
      v-model="showIframeModal"
      title="Embed PAGASA Weather Widget"
      description="Copy the URL or embed code below to integrate the PAGASA weather widget into your website or application."
      :iframe-url="iframeUrl"
      width="100%"
      height="800"
    />
  </div>
</template>





