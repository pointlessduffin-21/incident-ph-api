<script setup lang="ts">
import { onMounted } from 'vue';
import { useAcledStore } from '../stores/acled';
import { RouterLink } from 'vue-router';

const acledStore = useAcledStore();

onMounted(async () => {
  await acledStore.fetchIncidents();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <RouterLink to="/" class="text-blue-600 hover:text-blue-800 mb-2 inline-block">
          ← Back to Dashboard
        </RouterLink>
        <h1 class="text-3xl font-bold text-gray-900">ACLED Incidents</h1>
        <p class="text-gray-600 mt-1">Armed Conflict Location & Event Data Project</p>
      </div>
    </header>

    <!-- Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Recent Incidents</h2>
          <button
            @click="acledStore.fetchIncidents()"
            :disabled="acledStore.loading"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {{ acledStore.loading ? 'Loading...' : 'Refresh' }}
          </button>
        </div>

        <div v-if="acledStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p class="text-red-800">{{ acledStore.error }}</p>
        </div>

        <div v-if="acledStore.incidents && acledStore.incidents.incidents" class="space-y-4">
          <div v-if="acledStore.incidents.incidents.length === 0" class="text-center py-8 text-gray-500">
            No incidents available
          </div>
          <div
            v-for="(incident, index) in acledStore.incidents.incidents"
            :key="index"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">{{ incident.eventType }}</h3>
                <p class="text-sm text-gray-600 mb-1">
                  <strong>Sub-event:</strong> {{ incident.subEventType }}
                </p>
                <p class="text-sm text-gray-600 mb-1">
                  <strong>Location:</strong> {{ incident.admin1 }}, {{ incident.location }}
                </p>
                <p class="text-sm text-gray-600">
                  <strong>Date:</strong> {{ incident.eventDate }}
                </p>
              </div>
              <div>
                <div v-if="incident.actors && incident.actors.length > 0" class="mb-2">
                  <p class="text-sm text-gray-600 mb-1"><strong>Actors:</strong></p>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="(actor, actorIndex) in incident.actors"
                      :key="actorIndex"
                      class="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                    >
                      {{ actor }}
                    </span>
                  </div>
                </div>
                <div v-if="incident.fatalities" class="mb-2">
                  <p class="text-sm text-gray-600">
                    <strong>Fatalities:</strong> {{ incident.fatalities }}
                  </p>
                </div>
                <div v-if="incident.coordinates">
                  <p class="text-xs text-gray-500">
                    {{ incident.coordinates.lat }}, {{ incident.coordinates.lon }}
                  </p>
                </div>
              </div>
            </div>
            <div v-if="incident.notes" class="mt-3 pt-3 border-t border-gray-200">
              <p class="text-sm text-gray-700">{{ incident.notes }}</p>
            </div>
          </div>
          <div v-if="acledStore.incidents.lastUpdated" class="text-sm text-gray-500 mt-4">
            Last updated: {{ new Date(acledStore.incidents.lastUpdated).toLocaleString() }}
          </div>
        </div>
      </div>
    </main>
  </div>
</template>





