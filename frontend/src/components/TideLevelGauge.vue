<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
      <svg class="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      Current Tide Level
    </h3>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Gauge Visualization -->
      <div class="lg:col-span-2 flex flex-col items-center justify-center">
        <div class="w-full max-w-4xl">
          <!-- Digital Clock -->
          <div class="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-2xl p-6 mb-6 border border-slate-700">
            <div class="text-center">
              <div class="text-sm font-medium text-slate-400 mb-2">Current Time</div>
              <div class="flex items-center justify-center space-x-2">
                <div class="bg-slate-700/50 rounded-lg px-6 py-4 min-w-[100px]">
                  <div class="text-5xl font-bold text-cyan-400 tabular-nums">{{ currentTime.hours }}</div>
                  <div class="text-xs text-slate-400 mt-1">HOURS</div>
                </div>
                <div class="text-5xl font-bold text-cyan-400 animate-pulse">:</div>
                <div class="bg-slate-700/50 rounded-lg px-6 py-4 min-w-[100px]">
                  <div class="text-5xl font-bold text-cyan-400 tabular-nums">{{ currentTime.minutes }}</div>
                  <div class="text-xs text-slate-400 mt-1">MINUTES</div>
                </div>
                <div class="text-5xl font-bold text-cyan-400 animate-pulse">:</div>
                <div class="bg-slate-700/50 rounded-lg px-6 py-4 min-w-[100px]">
                  <div class="text-5xl font-bold text-cyan-400 tabular-nums animate-pulse">{{ currentTime.seconds }}</div>
                  <div class="text-xs text-slate-400 mt-1">SECONDS</div>
                </div>
                <div class="bg-slate-700/50 rounded-lg px-4 py-4">
                  <div class="text-3xl font-bold text-cyan-400">{{ currentTime.period }}</div>
                  <div class="text-xs text-slate-400 mt-1">&nbsp;</div>
                </div>
              </div>
              <div class="text-slate-400 text-sm mt-3">{{ currentTime.date }}</div>
            </div>
          </div>

          <!-- Wide Gauge -->
          <div class="relative h-96 bg-gradient-to-t from-blue-100 via-blue-50 to-sky-50 rounded-2xl border-4 border-blue-300 overflow-hidden shadow-2xl">
            <!-- Water Level Fill with enhanced animation -->
            <div
              class="absolute bottom-0 left-0 right-0 transition-all duration-2000 ease-in-out water-fill"
              :style="{ height: `${currentLevelPercentage}%` }"
            >
              <!-- Multiple Wave Layers for depth effect -->
              <div class="absolute inset-0 overflow-hidden">
                <!-- Wave Layer 1 -->
                <div 
                  class="absolute w-[200%] h-12 -top-6"
                  style="
                    background: repeating-linear-gradient(
                      90deg,
                      rgba(255, 255, 255, 0.4) 0px,
                      rgba(255, 255, 255, 0.1) 40px,
                      rgba(255, 255, 255, 0.4) 80px
                    );
                    animation: wave 4s linear infinite;
                  "
                />
                <!-- Wave Layer 2 -->
                <div 
                  class="absolute w-[200%] h-10 -top-4"
                  style="
                    background: repeating-linear-gradient(
                      90deg,
                      rgba(255, 255, 255, 0.3) 0px,
                      rgba(255, 255, 255, 0.05) 35px,
                      rgba(255, 255, 255, 0.3) 70px
                    );
                    animation: wave 3s linear infinite reverse;
                  "
                />
                <!-- Wave Layer 3 -->
                <div 
                  class="absolute w-[200%] h-8 -top-2"
                  style="
                    background: repeating-linear-gradient(
                      90deg,
                      rgba(255, 255, 255, 0.2) 0px,
                      rgba(255, 255, 255, 0.05) 30px,
                      rgba(255, 255, 255, 0.2) 60px
                    );
                    animation: wave 5s linear infinite;
                  "
                />
                <!-- Shimmer effect -->
                <div 
                  class="absolute inset-0"
                  style="
                    background: linear-gradient(
                      90deg,
                      transparent 0%,
                      rgba(255, 255, 255, 0.2) 50%,
                      transparent 100%
                    );
                    animation: shimmer 3s ease-in-out infinite;
                  "
                />
              </div>
              
              <!-- Bubbles Animation -->
              <div class="absolute inset-0 overflow-hidden pointer-events-none">
                <div class="bubble bubble-1"></div>
                <div class="bubble bubble-2"></div>
                <div class="bubble bubble-3"></div>
                <div class="bubble bubble-4"></div>
                <div class="bubble bubble-5"></div>
              </div>
            </div>

            <!-- Height Scale on Left -->
            <div class="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between py-6 px-2 bg-gradient-to-r from-slate-800/20 to-transparent">
              <div v-for="i in 11" :key="`scale-${i}`" class="flex items-center">
                <div class="w-3 h-0.5 bg-slate-600"></div>
                <span class="text-xs font-bold text-slate-700 ml-1">{{ (maxHeight - (maxHeight - minHeight) * (i - 1) / 10).toFixed(1) }}</span>
              </div>
            </div>

            <!-- Min/Max Markers with animation -->
            <div class="absolute top-4 right-4 bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
              <div class="text-xs font-medium">HIGH TIDE</div>
              <div class="text-2xl font-bold">{{ maxHeight.toFixed(2) }}m</div>
            </div>
            <div class="absolute bottom-4 right-4 bg-green-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg">
              <div class="text-xs font-medium">LOW TIDE</div>
              <div class="text-2xl font-bold">{{ minHeight.toFixed(2) }}m</div>
            </div>

            <!-- Current Level Indicator with enhanced design -->
            <div 
              class="absolute left-16 right-0 flex items-center transition-all duration-2000 ease-in-out z-20"
              :style="{ bottom: `${currentLevelPercentage}%` }"
            >
              <div class="absolute left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 shadow-lg animate-pulse-slow" />
              <div class="absolute left-0 w-4 h-4 bg-yellow-400 rounded-full shadow-lg border-2 border-white"></div>
              <div class="absolute right-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-lg font-bold px-6 py-3 rounded-xl shadow-2xl border-2 border-white">
                <div class="flex items-baseline space-x-2">
                  <span class="text-3xl">{{ currentHeight.toFixed(2) }}</span>
                  <span class="text-sm">meters</span>
                </div>
                <div class="text-xs opacity-90 mt-1">{{ (currentHeight * 3.28084).toFixed(1) }} feet</div>
              </div>
            </div>

            <!-- Percentage Indicator -->
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-10">
              <div class="bg-white/90 backdrop-blur-md rounded-2xl px-8 py-6 shadow-2xl border-2 border-blue-200">
                <div class="text-6xl font-bold text-blue-600">{{ Math.round(currentLevelPercentage) }}%</div>
                <div class="text-sm text-slate-600 mt-2">Tide Level</div>
              </div>
            </div>
          </div>

          <!-- Status Badge -->
          <div class="mt-6 text-center">
            <div 
              class="inline-flex items-center space-x-3 px-8 py-4 rounded-2xl font-bold text-white shadow-2xl transform hover:scale-105 transition-transform"
              :class="tideDirection === 'Rising' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-orange-500 to-amber-600'"
            >
              <svg v-if="tideDirection === 'Rising'" class="w-8 h-8 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <svg v-else class="w-8 h-8 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <span class="text-2xl">Tide {{ tideDirection }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tide Information -->
      <div class="space-y-4">
        <!-- Current Status -->
        <div class="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border-l-4 border-blue-500">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900">Current Level</p>
              <p class="text-2xl font-bold text-blue-700">{{ currentHeight.toFixed(2) }} m</p>
              <p class="text-xs text-gray-600 mt-1">{{ (currentHeight * 3.28084).toFixed(1) }} feet</p>
            </div>
          </div>
        </div>

        <!-- Next Tide -->
        <div 
          class="rounded-lg p-4 border-l-4"
          :class="nextTide?.type === 'High Tide' 
            ? 'bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-500' 
            : 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-500'"
        >
          <div class="flex items-start">
            <div class="text-2xl mr-3">
              {{ nextTide?.type === 'High Tide' ? '⬆️' : '⬇️' }}
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900">Next {{ nextTide?.type || 'Tide' }}</p>
              <p class="text-xl font-bold" :class="nextTide?.type === 'High Tide' ? 'text-teal-700' : 'text-orange-700'">
                {{ nextTide?.time || '--:--' }}
              </p>
              <p class="text-xs text-gray-600 mt-1">in {{ timeToNextTide }}</p>
              <p class="text-xs text-gray-600">Height: {{ nextTide?.heightMeters.toFixed(2) || '--' }}m</p>
            </div>
          </div>
        </div>

        <!-- Range Information -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-4 border border-red-200">
            <p class="text-xs font-medium text-gray-600 mb-1">Today's Max</p>
            <p class="text-2xl font-bold text-red-600">{{ maxHeight.toFixed(2) }}m</p>
            <p class="text-xs text-gray-500">{{ (maxHeight * 3.28084).toFixed(1) }}ft</p>
          </div>
          <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <p class="text-xs font-medium text-gray-600 mb-1">Today's Min</p>
            <p class="text-2xl font-bold text-green-600">{{ minHeight.toFixed(2) }}m</p>
            <p class="text-xs text-gray-500">{{ (minHeight * 3.28084).toFixed(1) }}ft</p>
          </div>
        </div>

        <!-- Tidal Range -->
        <div class="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
          <p class="text-xs font-medium text-gray-600 mb-1">Tidal Range Today</p>
          <p class="text-2xl font-bold text-purple-600">{{ (maxHeight - minHeight).toFixed(2) }}m</p>
          <p class="text-xs text-gray-500">Difference between high and low tide</p>
        </div>

        <!-- Time to Next Tide -->
        <div class="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200">
          <p class="text-xs font-medium text-gray-600 mb-1">Time Until {{ nextTide?.type || 'Next Tide' }}</p>
          <p class="text-2xl font-bold text-amber-600">{{ timeToNextTide }}</p>
          <div class="w-full bg-amber-200 rounded-full h-2 mt-2">
            <div 
              class="bg-amber-500 h-2 rounded-full transition-all duration-1000"
              :style="{ width: `${timeProgressPercentage}%` }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import type { TideData } from '../services/tides';

interface Props {
  tides: TideData[];
  tideDirection: 'Rising' | 'Falling' | 'Unknown';
  nextTide: TideData | null;
  timeToNextTide: string;
}

const props = defineProps<Props>();

// Real-time clock
const now = ref(new Date());
let clockInterval: number;

onMounted(() => {
  clockInterval = window.setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (clockInterval) {
    clearInterval(clockInterval);
  }
});

const currentTime = computed(() => {
  const hours24 = now.value.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = now.value.getMinutes();
  const seconds = now.value.getSeconds();
  const period = hours24 >= 12 ? 'PM' : 'AM';
  
  return {
    hours: hours12.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0'),
    period,
    date: now.value.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
  };
});

// Calculate current approximate tide height based on time and next/previous tides
const currentHeight = computed(() => {
  if (!props.tides || props.tides.length === 0) return 1.0;
  
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  // Find the two tides surrounding current time
  const tidesWithMinutes = props.tides.map(tide => {
    const timeMatch = tide.time.match(/(\d+):(\d+)\s*([AP]M)/i);
    if (!timeMatch || !timeMatch[1] || !timeMatch[2] || !timeMatch[3]) return null;
    
    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const isPM = timeMatch[3].toUpperCase() === 'PM';
    
    if (isPM && hours !== 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
    
    return {
      tide,
      totalMinutes: hours * 60 + minutes,
    };
  }).filter(t => t !== null);

  if (tidesWithMinutes.length === 0) return 1.0;

  // Find previous and next tide
  let prevTide = tidesWithMinutes[tidesWithMinutes.length - 1];
  let nextTideData = tidesWithMinutes[0];
  
  for (let i = 0; i < tidesWithMinutes.length; i++) {
    if (tidesWithMinutes[i]!.totalMinutes <= currentMinutes) {
      prevTide = tidesWithMinutes[i];
      nextTideData = tidesWithMinutes[i + 1] || tidesWithMinutes[0];
    }
  }

  if (!prevTide || !nextTideData) return 1.0;

  // Calculate interpolated height
  const timeDiff = nextTideData.totalMinutes - prevTide.totalMinutes;
  const timeElapsed = currentMinutes - prevTide.totalMinutes;
  const ratio = timeDiff > 0 ? timeElapsed / timeDiff : 0.5;
  
  // Use sine wave for more realistic tidal curve
  const sinRatio = (Math.sin((ratio - 0.5) * Math.PI) + 1) / 2;
  
  const interpolatedHeight = prevTide.tide.heightMeters + 
    (nextTideData.tide.heightMeters - prevTide.tide.heightMeters) * sinRatio;
  
  return Math.max(0.3, Math.min(2.0, interpolatedHeight));
});

const maxHeight = computed(() => {
  if (!props.tides || props.tides.length === 0) return 1.8;
  return Math.max(...props.tides.map(t => t.heightMeters));
});

const minHeight = computed(() => {
  if (!props.tides || props.tides.length === 0) return 0.4;
  return Math.min(...props.tides.map(t => t.heightMeters));
});

const currentLevelPercentage = computed(() => {
  const range = maxHeight.value - minHeight.value;
  if (range === 0) return 50;
  const level = ((currentHeight.value - minHeight.value) / range) * 100;
  return Math.max(5, Math.min(95, level));
});

const timeProgressPercentage = computed(() => {
  if (!props.timeToNextTide || props.timeToNextTide === 'Unknown') return 0;
  
  // Parse time to next tide (e.g., "2h 30m" or "45m")
  const match = props.timeToNextTide.match(/(?:(\d+)h\s*)?(\d+)m/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const totalMinutes = hours * 60 + minutes;
  
  // Assume max time between tides is ~6 hours (360 minutes)
  const maxMinutes = 360;
  const remaining = Math.min(totalMinutes, maxMinutes);
  
  // Invert so bar fills as we get closer
  return Math.max(0, Math.min(100, ((maxMinutes - remaining) / maxMinutes) * 100));
});
</script>

<style scoped>
.water-fill {
  background: linear-gradient(to top, #0284c7, #0ea5e9, #38bdf8, #7dd3fc);
}

@keyframes wave {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

@keyframes shimmer {
  0%, 100% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
}

@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse-slow {
  animation: pulse-slow 2s ease-in-out infinite;
}

/* Bubble animations */
.bubble {
  position: absolute;
  bottom: 0;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.2));
  border-radius: 50%;
  opacity: 0.6;
  animation: rise linear infinite;
}

.bubble-1 {
  width: 20px;
  height: 20px;
  left: 10%;
  animation-duration: 4s;
  animation-delay: 0s;
}

.bubble-2 {
  width: 15px;
  height: 15px;
  left: 30%;
  animation-duration: 5s;
  animation-delay: 1s;
}

.bubble-3 {
  width: 25px;
  height: 25px;
  left: 50%;
  animation-duration: 6s;
  animation-delay: 2s;
}

.bubble-4 {
  width: 18px;
  height: 18px;
  left: 70%;
  animation-duration: 5.5s;
  animation-delay: 0.5s;
}

.bubble-5 {
  width: 22px;
  height: 22px;
  left: 85%;
  animation-duration: 4.5s;
  animation-delay: 1.5s;
}

@keyframes rise {
  0% {
    bottom: 0;
    opacity: 0;
    transform: translateX(0) scale(0.8);
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    bottom: 100%;
    opacity: 0;
    transform: translateX(20px) scale(1.2);
  }
}
</style>

