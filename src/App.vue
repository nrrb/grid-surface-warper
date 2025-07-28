<template>
  <div class="app">
    <h1>Grid Surface Warper</h1>

    <div class="controls">
      <label>
        Grid Spacing:
        <input type="range" v-model.number="spacing" min="10" max="100" />
      </label>

      <label>
        Warp Alpha:
        <input type="range" v-model.number="warpAlpha" min="10" max="200" />
      </label>

      <label>
        Surface:
        <select v-model="surfaceType">
          <option value="sin">Sin Bumps</option>
          <option value="gaussian">Gaussian Hill</option>
        </select>
      </label>

      <template v-if="surfaceType === 'sin'">
        <label>
          Sin Multiplier:
          <input type="range" v-model.number="sinMultiplier" min="0.001" max="0.2" step="0.001" />
        </label>
        <label>
          Sin Amplitude:
          <input type="range" v-model.number="sinAmplitude" min="0" max="10" />
        </label>
      </template>

      <template v-if="surfaceType === 'gaussian'">
        <label>
          Gaussian Radius:
          <input type="range" v-model.number="gaussianRadius" min="1" max="800" />
        </label>
        <label>
          Gaussian Height:
          <input type="range" v-model.number="gaussianHeight" min="1" max="100" />
        </label>
      </template>

      <button @click="draw">Redraw</button>
    </div>

    <canvas ref="canvas" width="800" height="800" />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

const spacing = ref(30)
const surfaceType = ref('sin')
const canvas = ref(null)

const sinMultiplier = ref(0.1)
const sinAmplitude = ref(1)

const gaussianRadius = ref(200)
const gaussianHeight = ref(400)

const warpAlpha = ref(5)


const f_sin = (x, y) => sinAmplitude.value * Math.sin(x * sinMultiplier.value) * Math.cos(y * sinMultiplier.value)

const f_gaussian = (x, y) => {
  // Change cx and cy to be the center of the canvas
  const cx = canvas.value.width / 2
  const cy = canvas.value.height / 2
  const sigma = gaussianRadius.value / 4
  const amplitude = gaussianHeight.value
  const dx = x - cx
  const dy = y - cy
  const d2 = dx * dx + dy * dy
  return amplitude * Math.exp(-d2 / (2 * sigma * sigma))
}

function grad_f(f, x, y, eps = 1) {
  const dx = (f(x + eps, y) - f(x - eps, y)) / (2 * eps)
  const dy = (f(x, y + eps) - f(x, y - eps)) / (2 * eps)
  return [dx, dy]
}

function warpPoint(x, y, f) {
  const alpha = warpAlpha.value
  const [dx, dy] = grad_f(f, x, y)
  return [x + alpha * dx, y + alpha * dy]
}

function draw() {
  const ctx = canvas.value.getContext('2d')
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  const f = surfaceType.value === 'gaussian' ? f_gaussian : f_sin

  const cols = Math.floor(canvas.value.width / spacing.value)
  const rows = Math.floor(canvas.value.height / spacing.value)

  ctx.strokeStyle = '#000'
  ctx.lineWidth = 1

  for (let i = 0; i <= cols; i++) {
    for (let j = 0; j <= rows; j++) {
      const x = i * spacing.value
      const y = j * spacing.value
      const [wx, wy] = warpPoint(x, y, f)

      // horizontal edge
      if (i < cols) {
        const [wx2, wy2] = warpPoint(x + spacing.value, y, f)
        ctx.beginPath()
        ctx.moveTo(wx, wy)
        ctx.lineTo(wx2, wy2)
        ctx.stroke()
      }

      // vertical edge
      if (j < rows) {
        const [wx2, wy2] = warpPoint(x, y + spacing.value, f)
        ctx.beginPath()
        ctx.moveTo(wx, wy)
        ctx.lineTo(wx2, wy2)
        ctx.stroke()
      }
    }
  }
}

onMounted(draw)
watch([spacing, surfaceType, sinMultiplier, sinAmplitude, gaussianRadius, gaussianHeight, warpAlpha], draw)
</script>

<style scoped>
.app {
  font-family: sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.controls {
  margin-top: 1em;
}

label {
  margin-right: 1em;
}
canvas {
  border: 1px solid #ccc;
  margin-top: 1em;
}
</style>
