<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePhivolcsStore } from '../stores/phivolcs';
import { RouterLink } from 'vue-router';
import IframeModal from '../components/IframeModal.vue';

const phivolcsStore = usePhivolcsStore();
const showIframeModal = ref(false);

const iframeUrl = computed(() => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/phivolcs`;
});

onMounted(async () => {
  await phivolcsStore.fetchEarthquakes();
  await phivolcsStore.fetchLatestEarthquake();
  await phivolcsStore.fetchVolcanoes();
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
            <h1 class="text-3xl font-bold text-gray-900">PHIVOLCS</h1>
            <p class="text-gray-600 mt-1">Philippine Institute of Volcanology and Seismology</p>
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
      <!-- Latest Earthquake -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Latest Earthquake</h2>
        <div v-if="phivolcsStore.latestEarthquake && phivolcsStore.latestEarthquake.earthquake" class="border border-red-200 rounded-lg p-4 bg-red-50">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p class="text-sm text-gray-600">Magnitude</p>
              <p class="text-2xl font-bold text-red-600">{{ phivolcsStore.latestEarthquake.earthquake.magnitude }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Location</p>
              <p class="font-semibold">{{ phivolcsStore.latestEarthquake.earthquake.location }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Depth</p>
              <p class="font-semibold">{{ phivolcsStore.latestEarthquake.earthquake.depth }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Time</p>
              <p class="font-semibold">{{ new Date(phivolcsStore.latestEarthquake.earthquake.dateTime).toLocaleString() }}</p>
            </div>
          </div>
          <div class="mt-4">
            <p class="text-sm text-gray-600 mb-1">Coordinates</p>
            <p class="font-semibold">{{ phivolcsStore.latestEarthquake.earthquake.latitude }}, {{ phivolcsStore.latestEarthquake.earthquake.longitude }}</p>
          </div>
        </div>
      </div>

      <!-- Earthquakes List -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Recent Earthquakes</h2>
        <div v-if="phivolcsStore.earthquakes && phivolcsStore.earthquakes.earthquakes" class="space-y-3">
          <div
            v-for="(earthquake, index) in phivolcsStore.earthquakes.earthquakes"
            :key="index"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
              <div>
                <p class="text-2xl font-bold text-red-600">{{ earthquake.magnitude }}</p>
                <p class="text-xs text-gray-500">Magnitude</p>
              </div>
              <div>
                <p class="font-semibold">{{ earthquake.location }}</p>
                <p class="text-xs text-gray-500">Location</p>
              </div>
              <div>
                <p class="font-semibold">{{ earthquake.depth }}</p>
                <p class="text-xs text-gray-500">Depth</p>
              </div>
              <div>
                <p class="font-semibold">{{ earthquake.latitude }}, {{ earthquake.longitude }}</p>
                <p class="text-xs text-gray-500">Coordinates</p>
              </div>
              <div>
                <p class="font-semibold">{{ new Date(earthquake.dateTime).toLocaleString() }}</p>
                <p class="text-xs text-gray-500">Time</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Volcanoes -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Monitored Volcanoes</h2>
        <div v-if="phivolcsStore.volcanoes && phivolcsStore.volcanoes.volcanoes" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="(volcano, index) in phivolcsStore.volcanoes.volcanoes"
            :key="index"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <h3 class="font-semibold text-gray-900 mb-2">{{ volcano.name }}</h3>
            <div class="space-y-1 text-sm">
              <div class="flex items-center">
                <span class="text-gray-600 w-24">Alert Level:</span>
                <span class="font-semibold">{{ volcano.alertLevel }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-gray-600 w-24">Status:</span>
                <span class="font-semibold">{{ volcano.status }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-gray-600 w-24">Last Update:</span>
                <span class="font-semibold">{{ new Date(volcano.lastUpdate).toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Iframe Modal -->
    <IframeModal
      v-model="showIframeModal"
      title="Embed PHIVOLCS Widget"
      description="Copy the URL or embed code below to integrate the PHIVOLCS widget into your website or application."
      :iframe-url="iframeUrl"
      width="100%"
      height="800"
    />
  </div>
</template>





