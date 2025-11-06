<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useWindyStore } from '../stores/windy';
import { useOpenWeatherStore } from '../stores/openweather';
import { useGdacsStore } from '../stores/gdacs';

const windyStore = useWindyStore();
const {
  typhoonAlert,
  loading,
  error,
  forecastTimeline,
  typhoonThreshold,
  lastUpdated,
} = storeToRefs(windyStore);

const owStore = useOpenWeatherStore();
const { alerts: owAlerts, loading: owLoading, error: owError, lastUpdated: owUpdated } = storeToRefs(owStore);
const gdacsStore = useGdacsStore();
const { cyclones: gdacsCyclones } = storeToRefs(gdacsStore);

// Fixed location: Pagbilao, Quezon
const PAGBILAO = { lat: 13.964, lon: 121.747 };
const latitude = ref(PAGBILAO.lat);
const longitude = ref(PAGBILAO.lon);
const locationName = ref('Pagbilao, Quezon');
const enableBrowserAlerts = ref(true);
const hasBrowserAlertFired = ref(false);
const thresholdInput = ref(typhoonThreshold.value);
// NHC DIY widget state
const nhcRadiusKm = ref(1500);
const nhcFeatures = ref<any[]>([]);
let nhcMap: any = null;
let nhcCircle: any = null;

const modelOptions = [
  { label: 'GFS (Global Forecast System)', value: 'gfs', embedProduct: 'gfs' },
  { label: 'ECMWF (Windy Premium)', value: 'ecmwf', embedProduct: 'ecmwf' },
  { label: 'ICON-EU (Regional)', value: 'iconEU', embedProduct: 'iconEU' },
];

const selectedModel = ref<'gfs' | 'ecmwf' | 'iconEU'>('gfs');

const embedProduct = computed(() => {
  return (
    modelOptions.find((option) => option.value === selectedModel.value)?.embedProduct ||
    'gfs'
  );
});

const embedUrl = computed(() => {
  const lat = latitude.value.toFixed(3);
  const lon = longitude.value.toFixed(3);
  return `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&detailLat=${lat}&detailLon=${lon}&zoom=6&level=surface&overlay=wind&product=${embedProduct.value}&menu=&message=true&marker=true&calendar=&pressure=true&type=map&location=coordinates&detail=true&metricWind=default&metricTemp=default&radarRange=-1`;
});

const windyWarningsUrl = computed(() => {
  const lat = latitude.value.toFixed(3);
  const lon = longitude.value.toFixed(3);
  // Windy warnings overlay. If the layer name changes, use the UI menu to generate embed and replace overlay below.
  return `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&zoom=5&level=surface&overlay=weatherWarnings&product=${embedProduct.value}&menu=true&message=true&marker=true&calendar=now&pressure=true&type=map&location=coordinates&detail=true&detailLat=${lat}&detailLon=${lon}&metricWind=default&metricTemp=default&radarRange=-1`;
});

const forecastRows = computed(() => {
  return forecastTimeline.value
    .slice(0, 16)
    .map((row) => ({
      ...row,
      displayTime: row.timestamp ? new Date(row.timestamp).toLocaleString() : 'Unknown',
    }));
});

async function loadForecast() {
  await windyStore.fetchForecast(latitude.value, longitude.value, {
    locationName: locationName.value.trim() || 'Selected location',
    model: selectedModel.value,
    thresholdKmh: thresholdInput.value,
  });
}

function handleThresholdChange() {
  if (Number.isFinite(thresholdInput.value) && thresholdInput.value > 0) {
    windyStore.setThreshold(thresholdInput.value);
  }
}

watch(typhoonThreshold, (value) => {
  if (value !== thresholdInput.value) {
    thresholdInput.value = value;
  }
});

watch(
  typhoonAlert,
  (alert) => {
    if (!alert || !alert.isActive) {
      hasBrowserAlertFired.value = false;
      return;
    }

    if (!enableBrowserAlerts.value || hasBrowserAlertFired.value) {
      return;
    }

    if (typeof window !== 'undefined') {
      window.alert(
        `Typhoon alert for ${alert.locationName}: forecast winds up to ${alert.maxWindKmh} km/h (threshold ${alert.thresholdKmh} km/h).`,
      );
      hasBrowserAlertFired.value = true;
    }
  },
  { deep: true },
);

onMounted(async () => {
  await loadForecast();
  await initWindyMapForecast();
  await owStore.fetch(latitude.value, longitude.value);
  await initNHCWidget();
  await gdacsStore.fetchNear(latitude.value, longitude.value, nhcRadiusKm.value);
});

onBeforeUnmount(() => {
  // Best-effort cleanup if Windy attached listeners; full teardown API is not public.
});

async function initWindyMapForecast() {
  const apiKey = (import.meta as any).env?.VITE_WINDY_API_KEY || 'k05QJnNygG6pXub1VyQShJ6A0txMhs9W';

  // Load Windy Map Forecast boot script once
  if (!(window as any)._windyBootLoading) {
    (window as any)._windyBootLoading = new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://api.windy.com/assets/map-forecast/libBoot.js';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    });
  }

  await (window as any)._windyBootLoading;

  const windyInit = (window as any).windyInit as (opts: any, cb: (windyAPI: any) => void) => void;
  if (typeof windyInit !== 'function') return;

  const opts = {
    key: apiKey,
    lat: latitude.value,
    lon: longitude.value,
    zoom: 6,
    overlay: 'wind',
    level: 'surface',
    metricWind: 'km/h',
  };

  windyInit(opts, (windyAPI: any) => {
    const { map, store } = windyAPI;

    // React to coordinate/model changes by updating view and overlay
    watch([latitude, longitude], ([lat, lon]) => {
      map.setView([lat, lon], map.getZoom());
      store.set('lat', lat);
      store.set('lon', lon);
    });

    watch([latitude, longitude], async ([lat, lon]) => {
      await owStore.fetch(lat, lon);
    });

    watch(selectedModel, () => {
      // Windy JS API model switching is limited; keep overlay consistent
      store.set('overlay', 'wind');
    });
  });
}

async function ensureLeafletLoaded() {
  const hasL = typeof (window as any).L !== 'undefined';
  if (hasL) return;
  await new Promise<void>((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const s = document.createElement('script');
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = (e) => reject(e);
    document.head.appendChild(s);
  });
}

async function initNHCWidget() {
  await ensureLeafletLoaded();
  const L = (window as any).L;
  if (!L) return;

  nhcMap = L.map('nhcMap').setView([latitude.value, longitude.value], 4);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(nhcMap);

  nhcCircle = L.circle([latitude.value, longitude.value], {
    radius: nhcRadiusKm.value * 1000,
    color: '#2563eb',
    fillColor: '#93c5fd',
    fillOpacity: 0.15,
  }).addTo(nhcMap);

  await queryNHC();

  watch([latitude, longitude], async ([lat, lon]) => {
    nhcMap.setView([lat, lon], nhcMap.getZoom());
    nhcCircle.setLatLng([lat, lon]);
    await queryNHC();
    await gdacsStore.fetchNear(lat, lon, nhcRadiusKm.value);
  });

  watch(nhcRadiusKm, async (km) => {
    nhcCircle.setRadius(km * 1000);
    await queryNHC();
    await gdacsStore.fetchNear(latitude.value, longitude.value, km);
  });
}

async function queryNHC() {
  const nhcMapServer =
    'https://mapservices.weather.noaa.gov/tropical/rest/services/tropical/NHC_tropical_weather/MapServer/0/query';
  const geom = JSON.stringify({
    x: longitude.value,
    y: latitude.value,
    spatialReference: { wkid: 4326 },
  });

  const url = `${nhcMapServer}?f=geojson&geometry=${encodeURIComponent(
    geom,
  )}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&distance=${nhcRadiusKm.value}&units=esriSRUnit_Kilometer&outFields=*`;

  try {
    const resp = await fetch(url);
    const data = await resp.json();
    nhcFeatures.value = Array.isArray(data.features) ? data.features : [];

    const L = (window as any).L;
    if (L) {
      // Remove previous markers layer (quick approach: clear all non-tile, non-circle layers)
      nhcMap.eachLayer((layer: any) => {
        if (layer !== nhcCircle && !(layer.getAttribution && layer.getAttribution())) {
          if (layer._url) return; // tile layer
          if (layer === nhcCircle) return;
          nhcMap.removeLayer(layer);
        }
      });
      nhcFeatures.value.forEach((f: any) => {
        if (f?.geometry?.coordinates) {
          const [lon, lat] = f.geometry.coordinates;
          L.marker([lat, lon]).addTo(nhcMap);
        }
      });
    }
  } catch (e) {
    // noop: keep UI clean; list will simply be empty
  }
}

function centerNHCFeature(f: any) {
  const coords = f?.geometry?.coordinates;
  const Lref: any = (typeof window !== 'undefined' ? (window as any).L : null);
  if (coords && Lref && nhcMap) {
    const [lon, lat] = coords;
    nhcMap.setView([lat, lon], 6);
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <RouterLink to="/" class="text-blue-600 hover:text-blue-800 mb-2 inline-block">
          ← Back to Dashboard
        </RouterLink>
        <h1 class="text-3xl font-bold text-gray-900">Windy Typhoon Alerts</h1>
        <p class="text-gray-600 mt-1">
          Monitor potential typhoon conditions using Windy.com's point forecast data and wind alerts.
        </p>
        <p class="text-sm text-gray-500">
          Requires a valid <span class="font-semibold">VITE_WINDY_API_KEY</span> configured in your environment.
        </p>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <section class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Typhoon Alert Status</h2>
        <div v-if="typhoonAlert" class="space-y-3">
          <div
            :class="[
              'rounded-lg border p-4',
              typhoonAlert.isActive
                ? 'border-red-300 bg-red-50 text-red-800'
                : 'border-green-300 bg-green-50 text-green-800',
            ]"
          >
            <div class="flex items-center justify-between">
              <p class="font-semibold">
                {{ typhoonAlert.isActive ? '⚠️ Incoming Typhoon Conditions' : '✅ No Typhoon Conditions Detected' }}
              </p>
              <span class="text-sm font-medium">Threshold: {{ typhoonAlert.thresholdKmh }} km/h</span>
            </div>
            <p class="mt-2">{{ typhoonAlert.message }}</p>
            <p class="mt-2 text-sm">
              Peak forecast wind: <span class="font-semibold">{{ typhoonAlert.maxWindKmh }} km/h</span>
              <span v-if="typhoonAlert.timestamp">
                • Expected around {{ new Date(typhoonAlert.timestamp).toLocaleString() }}
              </span>
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div class="border rounded-lg p-3 bg-gray-50">
              <p class="font-medium text-gray-900 mb-1">Location</p>
              <p>{{ locationName || 'Selected location' }}</p>
              <p class="text-xs text-gray-500 mt-1">Lat {{ latitude.toFixed(2) }}, Lon {{ longitude.toFixed(2) }}</p>
            </div>
            <div class="border rounded-lg p-3 bg-gray-50">
              <p class="font-medium text-gray-900 mb-1">Model</p>
              <p>{{ selectedModel.toUpperCase() }}</p>
            </div>
            <div class="border rounded-lg p-3 bg-gray-50">
              <p class="font-medium text-gray-900 mb-1">Last Updated</p>
              <p>
                {{ lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Not yet fetched' }}
              </p>
            </div>
          </div>
        </div>
        <div v-else class="border border-gray-200 rounded-lg p-4 bg-gray-50 text-gray-600">
          Fetch a forecast to evaluate typhoon risk for your chosen coordinates.
        </div>
      </section>

      <section class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Forecast Controls</h2>
        <form class="grid grid-cols-1 md:grid-cols-2 gap-4" @submit.prevent="loadForecast">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
            <input
              v-model="locationName"
              type="text"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Metro Manila"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Forecast Model</label>
            <select
              v-model="selectedModel"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option v-for="option in modelOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          <!-- Fixed to Pagbilao; latitude/longitude inputs removed -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Typhoon Threshold (km/h)</label>
            <input
              v-model.number="thresholdInput"
              type="number"
              min="60"
              step="any"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              @change="handleThresholdChange"
            />
            <p class="text-xs text-gray-500 mt-1">
              Default is 118 km/h (Philippine typhoon classification).
            </p>
          </div>
          <div class="flex items-center space-x-3">
            <input
              id="browser-alerts"
              v-model="enableBrowserAlerts"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="browser-alerts" class="text-sm text-gray-700">Browser alert when typhoon detected</label>
          </div>
          <div class="md:col-span-2 flex items-center space-x-4">
            <button
              type="submit"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              Refresh Forecast
            </button>
            <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
          </div>
        </form>
      </section>

      <section class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <!-- Map Forecast (JS API) -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden xl:col-span-2">
          <div class="bg-gradient-to-r from-sky-500 to-sky-600 px-6 py-4">
            <h2 class="text-lg font-semibold text-white">Windy Map Forecast (API)</h2>
            <p class="text-sm text-sky-100">Interactive Windy map initialized via API key at your chosen coordinates.</p>
          </div>
          <div id="windy" class="w-full" style="height: 460px;"></div>
        </div>

        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
            <h2 class="text-lg font-semibold text-white">Windy Map</h2>
            <p class="text-sm text-blue-100">Interactive Windy map centered on the selected coordinates.</p>
          </div>
          <div class="aspect-video">
            <iframe
              :src="embedUrl"
              title="Windy forecast map"
              class="w-full h-full border-0"
              loading="lazy"
              allow="fullscreen"
            ></iframe>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
            <h2 class="text-lg font-semibold text-white">Wind Forecast Timeline</h2>
            <p class="text-sm text-red-100">Comparable wind and gust speeds converted to km/h.</p>
          </div>
          <div class="p-6 max-h-[28rem] overflow-y-auto">
            <div v-if="loading" class="text-center py-8 text-gray-500">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <p class="mt-2">Loading Windy forecast...</p>
            </div>
            <div v-else-if="forecastRows.length === 0" class="text-gray-500 text-center py-10">
              No forecast data available. Try refreshing with different coordinates.
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="(row, index) in forecastRows"
                :key="index"
                class="border border-gray-200 rounded-lg p-4"
              >
                <div class="flex items-center justify-between text-sm text-gray-600">
                  <p class="font-semibold text-gray-900">{{ row.displayTime }}</p>
                  <span class="px-2 py-1 text-xs rounded-full"
                    :class="row.gustKmh && row.gustKmh >= typhoonThreshold ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'"
                  >
                    {{ row.gustKmh ?? '—' }} km/h gusts
                  </span>
                </div>
                <div class="mt-2 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p class="text-gray-500">Wind (km/h)</p>
                    <p class="text-lg font-semibold text-gray-900">
                      {{ row.windKmh ?? '—' }}
                    </p>
                  </div>
                  <div>
                    <p class="text-gray-500">Gust (km/h)</p>
                    <p class="text-lg font-semibold text-gray-900">
                      {{ row.gustKmh ?? '—' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
          <h2 class="text-lg font-semibold text-white">Typhoon Warnings (OpenWeather)</h2>
          <p class="text-sm text-teal-100">Nearby tropical cyclone alerts from OpenWeather sources for these coordinates.</p>
        </div>
        <div class="p-6">
          <div v-if="owLoading" class="text-center py-8 text-gray-500">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <p class="mt-2">Loading typhoon alerts...</p>
          </div>
          <div v-else-if="owError" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {{ owError }}
          </div>
          <div v-else>
            <p class="text-sm text-gray-500 mb-3">Last updated: {{ owUpdated ? new Date(owUpdated).toLocaleString() : '—' }}</p>
            <div v-if="owAlerts && owAlerts.length > 0" class="space-y-3">
              <div v-for="(a, i) in owAlerts" :key="i" class="border border-gray-200 rounded-lg p-4">
                <p class="font-semibold text-gray-900">{{ a.event || 'Typhoon Alert' }}</p>
                <p class="text-sm text-gray-700 mt-1" v-if="a.description">{{ a.description }}</p>
                <p class="text-xs text-gray-500 mt-2">
                  {{ a.start ? new Date(a.start * 1000).toLocaleString() : '' }}
                  <span v-if="a.end">— {{ new Date(a.end * 1000).toLocaleString() }}</span>
                  <span v-if="a.sender_name"> • {{ a.sender_name }}</span>
                </p>
              </div>
            </div>
            <div v-else class="text-gray-600">No typhoon alerts found for these coordinates.</div>
          </div>
        </div>
      </section>

      <!-- NHC DIY widget -->
      <section class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4">
          <h2 class="text-lg font-semibold text-white">NHC Tropical Cyclones (DIY)</h2>
          <p class="text-sm text-slate-200">Active features within a radius of your coordinates. Click a storm to recenter.</p>
        </div>
        <div class="p-6 space-y-4">
          <div class="flex items-center space-x-3">
            <label class="text-sm text-gray-700">Radius (km)</label>
            <input v-model.number="nhcRadiusKm" type="number" min="100" step="50" class="w-32 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div id="nhcMap" class="w-full" style="height: 360px;"></div>
          <div>
            <h3 class="text-sm font-semibold text-gray-800 mb-2">Nearby storms</h3>
            <ul class="space-y-2" v-if="nhcFeatures.length > 0 || (gdacsCyclones && gdacsCyclones.length > 0)">
              <li
                v-for="(f, idx) in nhcFeatures"
                :key="idx"
                class="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                @click="centerNHCFeature(f)"
              >
                <div class="flex items-center justify-between">
                  <p class="font-medium text-gray-900">
                    {{ f.properties?.STORMNAME || 'Storm' }}
                  </p>
                  <span class="text-xs text-gray-500">{{ f.properties?.BASIN || '' }}</span>
                </div>
                <p class="text-xs text-gray-600" v-if="f.properties?.ADVDATE">Advisory: {{ f.properties.ADVDATE }}</p>
              </li>
              <li
                v-for="(e, j) in gdacsCyclones"
                :key="'g'+j"
                class="border border-gray-200 rounded-lg p-3"
              >
                <div class="flex items-center justify-between">
                  <p class="font-medium text-gray-900">
                    {{ e.eventname || 'Cyclone' }}
                  </p>
                  <span class="text-xs text-gray-500">{{ e.alertlevel || '' }} • {{ e.distanceKm }} km</span>
                </div>
                <p class="text-xs text-gray-600" v-if="e.fromdate">Since: {{ e.fromdate }}</p>
              </li>
            </ul>
            <p v-else class="text-gray-600">No active features found in this radius.</p>
          </div>
        </div>
      </section>

      <section class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
          <h2 class="text-lg font-semibold text-white">Weather Warnings (Windy)</h2>
          <p class="text-sm text-amber-100">Windy warnings overlay centered on your coordinates.</p>
        </div>
        <div class="relative pb-[65%]">
          <iframe
            :src="windyWarningsUrl"
            title="Windy weather warnings"
            class="absolute inset-0 w-full h-full border-0"
            loading="lazy"
            allow="fullscreen"
          ></iframe>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.aspect-video {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
}

.aspect-video iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>

