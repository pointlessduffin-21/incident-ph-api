<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
        @click.self="closeModal"
      >
        <div class="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <div class="flex items-center space-x-3">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <h3 class="text-xl font-bold text-gray-900">{{ title }}</h3>
            </div>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-auto p-6">
            <div class="space-y-4">
              <!-- Description -->
              <p class="text-gray-700">{{ description }}</p>

              <!-- Iframe URL Display -->
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Widget URL (Embeddable):
                </label>
                <div class="flex items-center space-x-2">
                  <input
                    ref="urlInput"
                    type="text"
                    :value="iframeUrl"
                    readonly
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    @click="copyToClipboard"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <svg v-if="!copied" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{{ copied ? 'Copied!' : 'Copy' }}</span>
                  </button>
                </div>
              </div>

              <!-- Iframe Code Display -->
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Embed Code (Copy & Paste):
                </label>
                <div class="relative">
                  <textarea
                    ref="codeInput"
                    :value="iframeCode"
                    readonly
                    rows="4"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  ></textarea>
                  <button
                    @click="copyCode"
                    class="absolute top-2 right-2 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                  >
                    {{ codeCopied ? 'Copied!' : 'Copy' }}
                  </button>
                </div>
              </div>

              <!-- Usage Instructions -->
              <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <div class="flex items-start">
                  <svg class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div class="text-sm text-blue-800">
                    <p class="font-semibold mb-1">How to use:</p>
                    <ol class="list-decimal list-inside space-y-1">
                      <li>Copy the embed code above</li>
                      <li>Paste it into your HTML page where you want the widget to appear</li>
                      <li>Adjust the width and height attributes as needed</li>
                      <li>The widget will automatically update with live data</li>
                    </ol>
                  </div>
                </div>
              </div>

              <!-- Preview Link -->
              <div class="flex justify-end">
                <a
                  :href="iframeUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  <span>Open in new tab</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end p-6 border-t border-gray-200">
            <button
              @click="closeModal"
              class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  modelValue: boolean;
  title: string;
  description: string;
  iframeUrl: string;
  width?: string;
  height?: string;
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '600',
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const urlInput = ref<HTMLInputElement | null>(null);
const codeInput = ref<HTMLTextAreaElement | null>(null);
const copied = ref(false);
const codeCopied = ref(false);

const iframeCode = computed(() => {
  return `<iframe src="${props.iframeUrl}" width="${props.width}" height="${props.height}" frameborder="0" style="border: 0;" allowfullscreen></iframe>`;
});

function closeModal() {
  emit('update:modelValue', false);
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(props.iframeUrl);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy URL:', err);
    // Fallback for older browsers
    if (urlInput.value) {
      urlInput.value.select();
      document.execCommand('copy');
      copied.value = true;
      setTimeout(() => {
        copied.value = false;
      }, 2000);
    }
  }
}

async function copyCode() {
  try {
    await navigator.clipboard.writeText(iframeCode.value);
    codeCopied.value = true;
    setTimeout(() => {
      codeCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy code:', err);
    // Fallback for older browsers
    if (codeInput.value) {
      codeInput.value.select();
      document.execCommand('copy');
      codeCopied.value = true;
      setTimeout(() => {
        codeCopied.value = false;
      }, 2000);
    }
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9) translateY(-20px);
}
</style>
