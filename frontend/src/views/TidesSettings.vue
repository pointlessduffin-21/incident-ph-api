<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-purple-100">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center space-x-4">
          <RouterLink to="/tides" class="text-purple-600 hover:text-purple-800 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </RouterLink>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">⚙️ Tide Monitoring Settings</h1>
            <p class="text-sm text-gray-600">Manage your tide monitoring locations</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Sub Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="container mx-auto px-4">
        <div class="flex space-x-8">
          <RouterLink
            to="/tides"
            class="border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700 py-4 px-1 text-sm font-medium text-gray-500"
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
            class="border-b-2 border-purple-600 py-4 px-1 text-sm font-medium text-purple-600"
          >
            Settings
          </RouterLink>
        </div>
      </div>
    </nav>

    <main class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto space-y-6">
        
        <!-- Add New Location Card -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg class="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Location
          </h2>
          
          <form @submit.prevent="addLocation" class="space-y-4">
            <div>
              <label for="locationName" class="block text-sm font-medium text-gray-700 mb-1">
                Location Name *
              </label>
              <input
                id="locationName"
                v-model="newLocation.name"
                type="text"
                required
                placeholder="e.g., Manila Bay, Subic Bay"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="latitude" class="block text-sm font-medium text-gray-700 mb-1">
                  Latitude * <span class="text-xs text-gray-500">(-90 to 90)</span>
                </label>
                <input
                  id="latitude"
                  v-model.number="newLocation.latitude"
                  type="number"
                  step="0.0001"
                  min="-90"
                  max="90"
                  required
                  placeholder="e.g., 14.5995"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                />
              </div>

              <div>
                <label for="longitude" class="block text-sm font-medium text-gray-700 mb-1">
                  Longitude * <span class="text-xs text-gray-500">(-180 to 180)</span>
                </label>
                <input
                  id="longitude"
                  v-model.number="newLocation.longitude"
                  type="number"
                  step="0.0001"
                  min="-180"
                  max="180"
                  required
                  placeholder="e.g., 120.9842"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                />
              </div>
            </div>

            <!-- Validation Error -->
            <div v-if="validationError" class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p class="text-sm text-red-800">{{ validationError }}</p>
            </div>

            <!-- Success Message -->
            <div v-if="successMessage" class="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <p class="text-sm text-green-800">{{ successMessage }}</p>
            </div>

            <button
              type="submit"
              class="w-full md:w-auto px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium flex items-center justify-center space-x-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Location</span>
            </button>
          </form>

          <!-- Helper Text -->
          <div class="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="text-sm text-blue-800">
                <p class="font-medium mb-1">💡 How to find coordinates:</p>
                <ul class="list-disc list-inside space-y-1 text-xs">
                  <li>Open Google Maps and search for your location</li>
                  <li>Right-click on the exact point and select "What's here?"</li>
                  <li>Copy the coordinates (latitude, longitude) from the bottom</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Default Locations -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg class="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Default Locations
          </h2>
          
          <div class="space-y-3">
            <div
              v-for="location in tideStore.defaultLocations"
              :key="location.id"
              class="flex items-center justify-between p-4 border-2 border-blue-200 bg-blue-50 rounded-lg"
            >
              <div class="flex items-center space-x-4">
                <div class="text-3xl">📍</div>
                <div>
                  <div class="font-bold text-gray-900">{{ location.name }}</div>
                  <div class="text-sm text-gray-600">
                    {{ location.latitude.toFixed(4) }}°N, {{ location.longitude.toFixed(4) }}°E
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                  Default
                </span>
                <RouterLink
                  :to="`/tides/${location.id}`"
                  class="px-4 py-2 text-blue-600 hover:bg-blue-100 rounded-lg transition font-medium text-sm"
                >
                  View Forecast →
                </RouterLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Custom Locations -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg class="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Custom Locations
            <span class="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
              {{ tideStore.customLocations.length }}
            </span>
          </h2>
          
          <!-- Empty State -->
          <div v-if="tideStore.customLocations.length === 0" class="text-center py-12">
            <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p class="text-gray-600 mb-2">No custom locations yet</p>
            <p class="text-sm text-gray-500">Add your first location using the form above</p>
          </div>

          <!-- Custom Locations List -->
          <div v-else class="space-y-3">
            <div
              v-for="location in tideStore.customLocations"
              :key="location.id"
              class="flex items-center justify-between p-4 border-2 border-purple-200 bg-purple-50 rounded-lg hover:border-purple-300 transition"
            >
              <div class="flex items-center space-x-4">
                <div class="text-3xl">🌊</div>
                <div>
                  <div class="font-bold text-gray-900">{{ location.name }}</div>
                  <div class="text-sm text-gray-600">
                    {{ location.latitude.toFixed(4) }}°N, {{ location.longitude.toFixed(4) }}°E
                  </div>
                  <div class="text-xs text-gray-500 mt-1">
                    Added {{ new Date(location.addedAt).toLocaleDateString() }}
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <button
                  @click="removeLocation(location.id)"
                  class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium text-sm flex items-center space-x-1"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Clear All Button -->
          <div v-if="tideStore.customLocations.length > 0" class="mt-6 pt-6 border-t border-gray-200">
            <button
              @click="clearAllCustomLocations"
              class="text-red-600 hover:text-red-800 font-medium text-sm flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear All Custom Locations</span>
            </button>
          </div>
        </div>

        <!-- Info Section -->
        <div class="bg-gradient-to-br from-amber-50 to-orange-100 border-l-4 border-amber-500 rounded-lg p-6">
          <div class="flex items-start">
            <svg class="w-6 h-6 text-amber-600 mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 class="font-bold text-amber-900 mb-2">About Tide Predictions</h4>
              <p class="text-sm text-amber-800 leading-relaxed mb-2">
                Tide forecasts are calculated using astronomical tidal patterns based on the semi-diurnal tidal cycle common in the Philippines.
                The calculations account for:
              </p>
              <ul class="text-sm text-amber-800 list-disc list-inside space-y-1">
                <li>12 hour 25 minute tidal cycle (2 high tides and 2 low tides per day)</li>
                <li>Daily advancement of approximately 50 minutes</li>
                <li>Spring and neap tide variations based on lunar cycles</li>
                <li>Geographic location (latitude and longitude)</li>
              </ul>
              <p class="text-sm text-amber-800 leading-relaxed mt-2">
                <strong>Note:</strong> These are predicted tides for general planning purposes. For critical maritime operations, 
                please consult official tide tables from NAMRIA (National Mapping and Resource Information Authority).
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useTideStore } from '../stores/tides';

const tideStore = useTideStore();

const newLocation = ref({
  name: '',
  latitude: 0,
  longitude: 0,
});

const validationError = ref<string | null>(null);
const successMessage = ref<string | null>(null);

function validateForm(): boolean {
  validationError.value = null;

  if (!newLocation.value.name.trim()) {
    validationError.value = 'Location name is required';
    return false;
  }

  if (newLocation.value.latitude < -90 || newLocation.value.latitude > 90) {
    validationError.value = 'Latitude must be between -90 and 90';
    return false;
  }

  if (newLocation.value.longitude < -180 || newLocation.value.longitude > 180) {
    validationError.value = 'Longitude must be between -180 and 180';
    return false;
  }

  return true;
}

function addLocation() {
  if (!validateForm()) {
    return;
  }

  try {
    tideStore.addCustomLocation(
      newLocation.value.name.trim(),
      newLocation.value.latitude,
      newLocation.value.longitude
    );

    // Show success message
    successMessage.value = `✅ ${newLocation.value.name} has been added successfully!`;
    
    // Reset form
    newLocation.value = {
      name: '',
      latitude: 0,
      longitude: 0,
    };

    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = null;
    }, 3000);
  } catch (error: any) {
    validationError.value = error.message || 'Failed to add location';
  }
}

function removeLocation(id: string) {
  if (confirm('Are you sure you want to remove this location?')) {
    const success = tideStore.removeCustomLocation(id);
    if (success) {
      successMessage.value = '✅ Location removed successfully';
      setTimeout(() => {
        successMessage.value = null;
      }, 3000);
    }
  }
}

function clearAllCustomLocations() {
  if (confirm('Are you sure you want to remove all custom locations? This action cannot be undone.')) {
    tideStore.clearCustomLocations();
    successMessage.value = '✅ All custom locations have been cleared';
    setTimeout(() => {
      successMessage.value = null;
    }, 3000);
  }
}
</script>
