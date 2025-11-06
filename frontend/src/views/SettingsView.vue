<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useSettingsStore } from '../stores/settings';

const settingsStore = useSettingsStore();

const intervalMinutes = Math.floor(settingsStore.pollInterval / 60000);

const updateInterval = (minutes: number) => {
  settingsStore.updatePollInterval(minutes * 60000);
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <RouterLink to="/" class="text-blue-600 hover:text-blue-800 mb-2 inline-block">
          ← Back to Dashboard
        </RouterLink>
        <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
        <p class="text-gray-600 mt-1">Configure your dashboard preferences</p>
      </div>
    </header>

    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex space-x-8">
          <RouterLink
            to="/"
            class="border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700 py-4 px-1 text-sm font-medium text-gray-500"
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
            to="/settings"
            class="border-b-2 border-blue-600 py-4 px-1 text-sm font-medium text-blue-600"
          >
            Settings
          </RouterLink>
        </div>
      </div>
    </nav>

    <!-- Content -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="bg-white rounded-lg shadow-md p-8">
        <!-- Auto Refresh Section -->
        <div class="mb-8 pb-8 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Auto Refresh</h2>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-700 font-medium">Enable automatic data refresh</p>
              <p class="text-sm text-gray-600 mt-1">
                Data will be automatically fetched from the backend at your configured interval
              </p>
            </div>
            <button
              @click="settingsStore.toggleAutoRefresh()"
              :class="[
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                settingsStore.autoRefresh ? 'bg-blue-600' : 'bg-gray-200'
              ]"
            >
              <span
                :class="[
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  settingsStore.autoRefresh ? 'translate-x-5' : 'translate-x-0'
                ]"
              />
            </button>
          </div>
        </div>

        <!-- Poll Interval Section -->
        <div class="mb-8 pb-8 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Refresh Interval</h2>
          <p class="text-gray-700 mb-4">
            How often should the dashboard automatically fetch new data from the backend API?
          </p>
          
          <div class="space-y-4">
            <!-- Quick Presets -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                @click="updateInterval(0.5)"
                :class="[
                  'px-4 py-3 rounded-lg border-2 font-medium transition-colors',
                  intervalMinutes === 0.5 ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                ]"
              >
                30 seconds
              </button>
              <button
                @click="updateInterval(1)"
                :class="[
                  'px-4 py-3 rounded-lg border-2 font-medium transition-colors',
                  intervalMinutes === 1 ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                ]"
              >
                1 minute
              </button>
              <button
                @click="updateInterval(5)"
                :class="[
                  'px-4 py-3 rounded-lg border-2 font-medium transition-colors',
                  intervalMinutes === 5 ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                ]"
              >
                5 minutes
              </button>
              <button
                @click="updateInterval(10)"
                :class="[
                  'px-4 py-3 rounded-lg border-2 font-medium transition-colors',
                  intervalMinutes === 10 ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                ]"
              >
                10 minutes
              </button>
            </div>

            <!-- Custom Input -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Custom interval (minutes):
              </label>
              <input
                type="number"
                :value="intervalMinutes"
                @input="updateInterval(Number(($event.target as HTMLInputElement).value))"
                min="0.5"
                max="60"
                step="0.5"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              />
            </div>

            <!-- Current Setting Display -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p class="text-sm text-blue-900">
                <strong>Current interval:</strong> {{ settingsStore.getFormattedInterval() }}
                <span v-if="!settingsStore.autoRefresh" class="text-blue-700">(Auto-refresh disabled)</span>
              </p>
            </div>
          </div>
        </div>

        <!-- API Info Section -->
        <div class="mb-8 pb-8 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Backend API</h2>
          <div class="space-y-3">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span class="text-gray-700">API Base URL:</span>
              <code class="ml-2 px-2 py-1 bg-gray-100 rounded text-sm">http://localhost:6144/api</code>
            </div>
            <div class="flex items-start">
              <svg class="w-5 h-5 text-gray-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="text-gray-700">
                  Data sources include MMDA, PAGASA, PHIVOLCS, and ACLED APIs
                </p>
                <p class="text-sm text-gray-600 mt-1">
                  Make sure the backend server is running before enabling auto-refresh
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Reset Section -->
        <div>
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Reset Settings</h2>
          <p class="text-gray-700 mb-4">
            Reset all settings to their default values
          </p>
          <button
            @click="settingsStore.resetSettings()"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
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





