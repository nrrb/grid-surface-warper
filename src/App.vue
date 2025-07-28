<template>
  <div class="app">
    <h1>Grid Surface Warper</h1>

    <div class="controls">
      <v-row>
        <v-col cols="12" sm="6" md="4">
          <v-slider
            v-model="spacing"
            :min="1"
            :max="100"
            :step="1"
            label="Grid Spacing"
            thumb-label
          ></v-slider>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-slider
            v-model="warpAlpha"
            :min="1"
            :max="300"
            :step="1"
            label="Warp Alpha"
            thumb-label
          ></v-slider>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-slider
            v-model="warpPointEPS"
            :min="0.01"
            :max="1"
            :step="0.01"
            label="Warp EPS"
            thumb-label
          ></v-slider>
        </v-col>
      </v-row>

      <FunctionSelector
        v-model="selectedFunction"
        :function-key="selectedFunctionKey"
        @update:model-value="onFunctionUpdate"
        class="mb-4"
      />

      <v-btn color="primary" @click="draw" block class="mt-2">Redraw</v-btn>
    </div>

    <canvas ref="canvas" width="800" height="800" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import FunctionSelector from './components/FunctionSelector.vue';

// Canvas and grid settings
const spacing = ref(30);
const warpAlpha = ref(5);
const warpPointEPS = ref(0.1);
const canvas = ref(null);

// Function selection and parameters
const selectedFunctionKey = ref('sineRidge');
const selectedFunction = ref({
  func: (x, y) => 0,
  params: {}
});

// Update the function when selection or parameters change
const onFunctionUpdate = (newFunction) => {
  selectedFunction.value = newFunction;
  draw();
};

// Numerical gradient calculation
function grad_f(f, x, y, eps = null) {
  const epsilon = eps || warpPointEPS.value;
  const dx = (f(x + epsilon, y) - f(x - epsilon, y)) / (2 * epsilon);
  const dy = (f(x, y + epsilon) - f(x, y - epsilon)) / (2 * epsilon);
  return [dx, dy];
}

// Warp point based on gradient
function warpPoint(x, y, f) {
  const [dx, dy] = grad_f(f, x, y);
  return [x + warpAlpha.value * dx, y + warpAlpha.value * dy];
}

// Main drawing function
function draw() {
  if (!canvas.value) return;
  
  const ctx = canvas.value.getContext('2d');
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

  // Create a curried version of the selected function with its parameters
  const f = (x, y) => selectedFunction.value.func(x, y, selectedFunction.value.params);

  const cols = Math.floor(canvas.value.width / spacing.value);
  const rows = Math.floor(canvas.value.height / spacing.value);

  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;

  // Draw horizontal lines
  for (let i = 0; i <= cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = i * spacing.value;
      const y = j * spacing.value;
      const [wx1, wy1] = warpPoint(x, y, f);
      const [wx2, wy2] = warpPoint(x, y + spacing.value, f);
      
      ctx.beginPath();
      ctx.moveTo(wx1, wy1);
      ctx.lineTo(wx2, wy2);
      ctx.stroke();
    }
  }

  // Draw vertical lines
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j <= rows; j++) {
      const x = i * spacing.value;
      const y = j * spacing.value;
      const [wx1, wy1] = warpPoint(x, y, f);
      const [wx2, wy2] = warpPoint(x + spacing.value, y, f);
      
      ctx.beginPath();
      ctx.moveTo(wx1, wy1);
      ctx.lineTo(wx2, wy2);
      ctx.stroke();
    }
  }
}

// Watch for changes to parameters and redraw
watch([spacing, warpAlpha, warpPointEPS], () => {
  draw();
}, { immediate: true });

// Initialize on mount
onMounted(() => {
  // Initial draw with default function
  onFunctionUpdate(selectedFunction.value);
});
</script>

<style scoped>
.app {
  font-family: sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Make all form elements full width */
.controls {
  margin: 0.5em 0;
  width: 100%;
  max-width: 800px;
  font-size: 0.85em;
}

.controls label {
  display: block;
  width: 100%;
  margin: 0.3em 0;
}

.controls .v-slider {
  width: 100%;
  margin: 0.2em 0 0.5em;
}

.controls .v-select {
  width: 100%;
  margin: 0.2em 0 0.5em;
}

.controls .v-select .v-field {
  --v-field-padding-top: 8px;
  --v-field-padding-bottom: 8px;
  min-height: 36px;
}

.controls .v-btn {
  width: 100%;
  margin: 0.5em 0;
  height: 32px;
}

.controls .v-slider-thumb__label {
  font-size: 0.8em;
  height: 24px;
  min-width: 24px;
  padding: 0 4px;
}

.controls .v-slider-thumb {
  width: 14px;
  height: 14px;
}

canvas {
  border: 1px solid #ccc;
  margin-top: 0.5em;
}
</style>
