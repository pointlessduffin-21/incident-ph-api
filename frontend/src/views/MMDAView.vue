<script setup lang="ts">
import { onMounted } from 'vue';
import { useMMDAStore } from '../stores/mmda';
import { RouterLink } from 'vue-router';

const mmdaStore = useMMDAStore();

onMounted(async () => {
  await mmdaStore.fetchTraffic();
  await mmdaStore.fetchHighways();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between mb-2">
          <RouterLink to="/" class="text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
          </RouterLink>
          <RouterLink to="/settings" class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </RouterLink>
        </div>
        <h1 class="text-3xl font-bold text-gray-900">MMDA Traffic Alerts</h1>
        <p class="text-gray-600 mt-1">Metro Manila Development Authority</p>
      </div>
    </header>

    <!-- Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Traffic Alerts -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Recent Traffic Alerts</h2>
          <button
            @click="mmdaStore.fetchTraffic()"
            :disabled="mmdaStore.loading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {{ mmdaStore.loading ? 'Loading...' : 'Refresh' }}
          </button>
        </div>

        <div v-if="mmdaStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p class="text-red-800">{{ mmdaStore.error }}</p>
        </div>

        <div v-if="mmdaStore.traffic && mmdaStore.traffic.alerts" class="space-y-4">
          <div v-if="mmdaStore.traffic.alerts.length === 0" class="text-center py-8 text-gray-500">
            No traffic alerts available
          </div>
          <div
            v-for="(alert, index) in mmdaStore.traffic.alerts"
            :key="index"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <p class="text-gray-800 mb-2">{{ alert.text }}</p>
            <div class="flex items-center justify-between text-sm text-gray-600">
              <span>{{ new Date(alert.timestamp).toLocaleString() }}</span>
              <a
                v-if="alert.url"
                :href="alert.url"
                target="_blank"
                class="text-blue-600 hover:text-blue-800"
              >
                View Tweet →
              </a>
            </div>
          </div>
          <div v-if="mmdaStore.traffic.lastUpdated" class="text-sm text-gray-500 mt-4">
            Last updated: {{ new Date(mmdaStore.traffic.lastUpdated).toLocaleString() }}
          </div>
        </div>
      </div>

      <!-- Highways -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Major Highways</h2>
        <div v-if="mmdaStore.highways && mmdaStore.highways.highways" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="highway in mmdaStore.highways.highways"
            :key="highway.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            @click="mmdaStore.fetchHighwayTraffic(highway.id)"
          >
            <h3 class="font-semibold text-gray-900 mb-1">{{ highway.name }}</h3>
            <p v-if="highway.coordinates" class="text-sm text-gray-600">
              {{ highway.coordinates.lat }}, {{ highway.coordinates.lon }}
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

