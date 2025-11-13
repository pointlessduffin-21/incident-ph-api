<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-bold text-gray-900 flex items-center">
        <svg class="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
        Tide Graph - {{ viewMode === '24h' ? '24 Hours' : '7 Days' }}
      </h3>
      <div class="flex space-x-2">
        <button
          @click="viewMode = '24h'"
          :class="viewMode === '24h' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
          class="px-4 py-2 rounded-lg font-medium text-sm transition"
        >
          24 Hours
        </button>
        <button
          @click="viewMode = '7d'"
          :class="viewMode === '7d' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
          class="px-4 py-2 rounded-lg font-medium text-sm transition"
        >
          7 Days
        </button>
        <button
          @click="$emit('openEmbed')"
          class="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-medium text-sm transition flex items-center space-x-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <span>Embed</span>
        </button>
      </div>
    </div>

    <!-- Graph Container -->
    <div class="relative bg-gradient-to-b from-blue-50 to-white rounded-lg border-2 border-blue-200 p-4 overflow-x-auto">
      <!-- Y-axis labels -->
      <div class="absolute left-0 top-0 bottom-0 flex flex-col justify-between py-4 text-xs text-gray-600 font-medium">
        <span>{{ maxHeight.toFixed(1) }}m</span>
        <span>{{ ((maxHeight + minHeight) / 2).toFixed(1) }}m</span>
        <span>{{ minHeight.toFixed(1) }}m</span>
      </div>

      <!-- Graph SVG -->
      <div class="ml-12" style="min-width: 600px; height: 300px;">
        <svg :viewBox="`0 0 ${svgWidth} ${svgHeight}`" class="w-full h-full">
          <!-- Grid lines -->
          <g class="grid-lines">
            <line 
              v-for="i in 5" 
              :key="`h-grid-${i}`"
              :x1="0" 
              :y1="(svgHeight / 4) * (i - 1)" 
              :x2="svgWidth" 
              :y2="(svgHeight / 4) * (i - 1)"
              stroke="#e5e7eb" 
              stroke-width="1"
              stroke-dasharray="4,4"
            />
            <line 
              v-for="i in timePoints.length" 
              :key="`v-grid-${i}`"
              :x1="((svgWidth / (timePoints.length - 1)) * (i - 1))" 
              :y1="0" 
              :x2="((svgWidth / (timePoints.length - 1)) * (i - 1))" 
              :y2="svgHeight"
              stroke="#e5e7eb" 
              stroke-width="1"
              stroke-dasharray="4,4"
            />
          </g>

          <!-- Tide curve -->
          <path
            :d="tideCurvePath"
            fill="none"
            stroke="#0ea5e9"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- Fill under curve -->
          <path
            :d="tideFillPath"
            fill="url(#tideGradient)"
            opacity="0.3"
          />

          <!-- Gradient definition -->
          <defs>
            <linearGradient id="tideGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#0ea5e9;stop-opacity:0" />
            </linearGradient>
          </defs>

          <!-- High/Low tide markers -->
          <g v-for="(point, index) in tidePoints" :key="`marker-${index}`">
            <circle
              :cx="point.x"
              :cy="point.y"
              :r="point.isExtreme ? 8 : 0"
              :fill="point.type === 'High Tide' ? '#10b981' : '#f59e0b'"
              stroke="white"
              stroke-width="2"
            />
            <text
              v-if="point.isExtreme"
              :x="point.x"
              :y="point.y - 15"
              text-anchor="middle"
              class="text-xs font-bold"
              :fill="point.type === 'High Tide' ? '#10b981' : '#f59e0b'"
            >
              {{ point.height.toFixed(2) }}m
            </text>
          </g>

          <!-- Current time indicator -->
          <line
            v-if="viewMode === '24h'"
            :x1="currentTimeX"
            y1="0"
            :x2="currentTimeX"
            :y2="svgHeight"
            stroke="#ef4444"
            stroke-width="2"
            stroke-dasharray="6,3"
          />
          <text
            v-if="viewMode === '24h'"
            :x="currentTimeX"
            :y="svgHeight - 5"
            text-anchor="middle"
            class="text-xs font-bold"
            fill="#ef4444"
          >
            NOW
          </text>
        </svg>
      </div>

      <!-- X-axis labels -->
      <div class="ml-12 mt-2 flex justify-between text-xs text-gray-600 font-medium" style="min-width: 600px;">
        <span v-for="(label, index) in timeLabels" :key="`label-${index}`">
          {{ label }}
        </span>
      </div>
    </div>

    <!-- Legend -->
    <div class="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
      <div class="flex items-center space-x-2">
        <div class="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow" />
        <span class="text-gray-700">High Tide</span>
      </div>
      <div class="flex items-center space-x-2">
        <div class="w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow" />
        <span class="text-gray-700">Low Tide</span>
      </div>
      <div class="flex items-center space-x-2">
        <div class="w-8 h-0.5 bg-red-500" style="border-top: 2px dashed #ef4444;" />
        <span class="text-gray-700">Current Time</span>
      </div>
    </div>

    <!-- Stats Summary -->
    <div class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 text-center border border-blue-200">
        <p class="text-xs text-gray-600 mb-1">Avg High</p>
        <p class="text-xl font-bold text-blue-600">{{ averageHigh.toFixed(2) }}m</p>
      </div>
      <div class="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 text-center border border-orange-200">
        <p class="text-xs text-gray-600 mb-1">Avg Low</p>
        <p class="text-xl font-bold text-orange-600">{{ averageLow.toFixed(2) }}m</p>
      </div>
      <div class="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 text-center border border-purple-200">
        <p class="text-xs text-gray-600 mb-1">Avg Range</p>
        <p class="text-xl font-bold text-purple-600">{{ (averageHigh - averageLow).toFixed(2) }}m</p>
      </div>
      <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 text-center border border-green-200">
        <p class="text-xs text-gray-600 mb-1">Tides/Day</p>
        <p class="text-xl font-bold text-green-600">{{ tidesPerDay }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { TideForecast } from '../services/tides';

interface Props {
  forecast: TideForecast;
}

const props = defineProps<Props>();
const viewMode = ref<'24h' | '7d'>('24h');

const svgWidth = 1000;
const svgHeight = 300;

// Get all tides for the selected view
const allTides = computed(() => {
  if (viewMode.value === '24h') {
    return [...props.forecast.today, ...props.forecast.tomorrow];
  } else {
    const tides = [...props.forecast.today, ...props.forecast.tomorrow];
    props.forecast.nextDays.forEach(day => {
      tides.push(...day.tides);
    });
    return tides;
  }
});

// Calculate min/max heights
const maxHeight = computed(() => {
  const heights = allTides.value.map(t => t.heightMeters);
  return Math.max(...heights, 2.0);
});

const minHeight = computed(() => {
  const heights = allTides.value.map(t => t.heightMeters);
  return Math.min(...heights, 0.3);
});

// Generate time points for smooth curve
const timePoints = computed(() => {
  const points: Array<{ time: Date; height: number; label: string }> = [];
  const now = new Date();
  
  if (viewMode.value === '24h') {
    // Generate hourly points for 24 hours
    for (let i = 0; i <= 24; i++) {
      const time = new Date(now.getTime() + i * 60 * 60 * 1000);
      points.push({
        time,
        height: interpolateHeight(time),
        label: i % 3 === 0 ? time.toLocaleTimeString('en-US', { hour: 'numeric' }) : '',
      });
    }
  } else {
    // Generate 4 points per day for 7 days
    for (let day = 0; day <= 7; day++) {
      for (let hour of [0, 6, 12, 18]) {
        const time = new Date(now);
        time.setDate(time.getDate() + day);
        time.setHours(hour, 0, 0, 0);
        points.push({
          time,
          height: interpolateHeight(time),
          label: hour === 12 ? time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
        });
      }
    }
  }
  
  return points;
});

const timeLabels = computed(() => {
  return timePoints.value
    .filter(p => p.label)
    .map(p => p.label);
});

// Interpolate tide height at any given time
function interpolateHeight(targetTime: Date): number {
  const tides = allTides.value;
  if (tides.length === 0) return 1.0;
  
  // Parse all tide times
  const tidesWithTime = tides.map(tide => {
    const timeMatch = tide.time.match(/(\d+):(\d+)\s*([AP]M)/i);
    if (!timeMatch || !timeMatch[1] || !timeMatch[2] || !timeMatch[3]) return null;
    
    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const isPM = timeMatch[3].toUpperCase() === 'PM';
    
    if (isPM && hours !== 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
    
    // Create date object for this tide
    const tideDate = new Date(targetTime);
    tideDate.setHours(hours, minutes, 0, 0);
    
    return {
      tide,
      time: tideDate,
      height: tide.heightMeters,
    };
  }).filter(t => t !== null);

  if (tidesWithTime.length === 0) return 1.0;

  // Find surrounding tides
  let before = tidesWithTime[0];
  let after = tidesWithTime[tidesWithTime.length - 1];
  
  for (let i = 0; i < tidesWithTime.length - 1; i++) {
    if (tidesWithTime[i]!.time <= targetTime && tidesWithTime[i + 1]!.time > targetTime) {
      before = tidesWithTime[i];
      after = tidesWithTime[i + 1];
      break;
    }
  }

  if (!before || !after) return tidesWithTime[0]!.height;

  // Interpolate using sine curve for realistic tidal movement
  const timeDiff = after.time.getTime() - before.time.getTime();
  const timeElapsed = targetTime.getTime() - before.time.getTime();
  const ratio = timeDiff > 0 ? timeElapsed / timeDiff : 0.5;
  
  const sinRatio = (Math.sin((ratio - 0.5) * Math.PI) + 1) / 2;
  const interpolated = before.height + (after.height - before.height) * sinRatio;
  
  return Math.max(minHeight.value, Math.min(maxHeight.value, interpolated));
}

// Generate SVG path for tide curve
const tideCurvePath = computed(() => {
  const points = timePoints.value;
  if (points.length === 0) return '';
  
  const xScale = svgWidth / (points.length - 1);
  const heightRange = maxHeight.value - minHeight.value || 1;
  
  let path = `M 0 ${svgHeight - ((points[0].height - minHeight.value) / heightRange) * svgHeight}`;
  
  for (let i = 1; i < points.length; i++) {
    const x = i * xScale;
    const y = svgHeight - ((points[i].height - minHeight.value) / heightRange) * svgHeight;
    path += ` L ${x} ${y}`;
  }
  
  return path;
});

// Generate SVG path for fill under curve
const tideFillPath = computed(() => {
  const curvePath = tideCurvePath.value;
  if (!curvePath) return '';
  
  return `${curvePath} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;
});

// Generate points for tide markers (high/low)
const tidePoints = computed(() => {
  const points: Array<{ 
    x: number; 
    y: number; 
    type: string; 
    height: number; 
    isExtreme: boolean 
  }> = [];
  
  const xScale = svgWidth / (timePoints.value.length - 1);
  const heightRange = maxHeight.value - minHeight.value || 1;
  
  // Mark actual high and low tides
  allTides.value.forEach(tide => {
    // Find closest time point
    const timeMatch = tide.time.match(/(\d+):(\d+)\s*([AP]M)/i);
    if (!timeMatch || !timeMatch[1] || !timeMatch[2] || !timeMatch[3]) return;
    
    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const isPM = timeMatch[3].toUpperCase() === 'PM';
    
    if (isPM && hours !== 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
    
    // Find corresponding x position
    const now = new Date();
    const tideTime = new Date(now);
    tideTime.setHours(hours, minutes, 0, 0);
    
    const timeDiff = tideTime.getTime() - now.getTime();
    const hoursFromNow = timeDiff / (1000 * 60 * 60);
    
    if (viewMode.value === '24h' && (hoursFromNow < 0 || hoursFromNow > 24)) return;
    if (viewMode.value === '7d' && (hoursFromNow < 0 || hoursFromNow > 168)) return;
    
    const x = viewMode.value === '24h' 
      ? (hoursFromNow / 24) * svgWidth
      : (hoursFromNow / 168) * svgWidth;
    const y = svgHeight - ((tide.heightMeters - minHeight.value) / heightRange) * svgHeight;
    
    points.push({
      x: Math.max(0, Math.min(svgWidth, x)),
      y,
      type: tide.type,
      height: tide.heightMeters,
      isExtreme: true,
    });
  });
  
  return points;
});

// Current time position on x-axis
const currentTimeX = computed(() => {
  if (viewMode.value === '7d') return 0;
  return 0; // First point is "now" for 24h view
});

// Statistics
const averageHigh = computed(() => {
  const highs = allTides.value.filter(t => t.type === 'High Tide').map(t => t.heightMeters);
  return highs.length > 0 ? highs.reduce((a, b) => a + b, 0) / highs.length : 0;
});

const averageLow = computed(() => {
  const lows = allTides.value.filter(t => t.type === 'Low Tide').map(t => t.heightMeters);
  return lows.length > 0 ? lows.reduce((a, b) => a + b, 0) / lows.length : 0;
});

const tidesPerDay = computed(() => {
  const days = viewMode.value === '24h' ? 1 : 7;
  return Math.round(allTides.value.length / days);
});
</script>
