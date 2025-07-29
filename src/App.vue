<template>
  <div class="app">
    <h1>Grid Surface Warper</h1>

    <div class="controls">
      <v-row>
        <v-col cols="12" sm="6">
          <v-slider
            v-model="spacing"
            :min="1"
            :max="100"
            :step="1"
            label="Grid Spacing"
            thumb-label
          ></v-slider>
        </v-col>
        <v-col cols="12" sm="6">
          <v-slider
            v-model="warpAlpha"
            :min="0.1"
            :max="50"
            :step="0.5"
            label="Warp Alpha"
            thumb-label
          ></v-slider>
        </v-col>
        <v-col>
          <!-- Add a button that cycles through three states: square, tri, hex. This sets the grid that displays -->
          <v-btn
            color="primary"
            @click="gridType = (gridType + 1) % 3"
          >
            {{ gridType === 0 ? 'Square' : gridType === 1 ? 'Tri' : 'Hex' }}
          </v-btn>
        </v-col>
      </v-row>

      <FunctionSelector
        v-model="selectedFunction"
        :function-key="selectedFunctionKey"
        @update:model-value="onFunctionUpdate"
        class="mb-6"
      />

      <v-btn color="primary" @click="draw" block class="mt-2">Redraw</v-btn>
    </div>

    <canvas 
      ref="canvas" 
      :width="canvasSize.width" 
      :height="canvasSize.height"
      @click="saveCanvasAsPNG"
      style="cursor: pointer; max-width: 100%; height: auto;"
      title="Click to save as PNG"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, onBeforeUnmount } from 'vue';
import FunctionSelector from './components/FunctionSelector.vue';
import { useFunctionStore } from './store';
import { functionDefinitions } from './functions';

const store = useFunctionStore()

// Canvas and grid settings
const spacing = ref(30);
const warpAlpha = ref(5);
const canvas = ref(null);
const gridType = ref(0);
const canvasSize = ref({ width: 800, height: 800 });

// Handle window resize
const handleResize = () => {
  if (!canvas.value) return;
  const container = canvas.value.parentElement;
  const size = Math.min(container.clientWidth - 40, 800); // Max 800px or container width - padding
  
  canvasSize.value = {
    width: size,
    height: size // Keep it square
  };
  
  // Redraw with new dimensions
  draw();
};


// Function selection and parameters
const selectedFunctionKey = ref('sineRidge');
const selectedFunction = ref(store.selectedFunctionKey);

// Update the function when selection or parameters change
const onFunctionUpdate = (newFunction) => {
  selectedFunction.value = newFunction;
  draw();
};

// Numerical gradient calculation
function grad_f(f, x, y, eps = null) {
  const epsilon = eps || 0.1;
  const dx = (f(x + epsilon, y) - f(x - epsilon, y)) / (2 * epsilon);
  const dy = (f(x, y + epsilon) - f(x, y - epsilon)) / (2 * epsilon);
  return [dx, dy];
}

// Warp point based on gradient
function warpPoint(x, y, f) {
  const [dx, dy] = grad_f(f, x, y);
  return [x + warpAlpha.value * dx, y + warpAlpha.value * dy];
}

// Draw the grid with the current function
function draw() {
  if (!canvas.value) return;
  
  const ctx = canvas.value.getContext('2d');
  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

    // Grid generation functions
  const generateTriangularGrid = (width, height, size) => {
    const origin = { x: -size, y: -size };
    const v1 = { x: size, y: 0 };
    const v2 = { x: size / 2, y: size * Math.sqrt(3) / 2 };
    const cols = Math.ceil(width / size) + 1;
    const rows = Math.ceil(height * 2 / (size * Math.sqrt(3))) + 1;
    let grid = [];
    for (let i = -cols; i <= cols; i++) {
      let row = [];
      for (let j = 0; j <= rows; j++) {
        const x = origin.x + i * v1.x + j * v2.x;
        const y = origin.y + i * v1.y + j * v2.y;
        row.push({ x, y });
      }
      grid.push(row);
    }
    return grid;
  };

  const getHexagonVertices = (center, size) => {
    let vertices = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i - 30);
      vertices.push({
        x: center.x + size * Math.cos(angle),
        y: center.y + size * Math.sin(angle)
      });
    }
    return vertices;
  };

  const generateHexagonalGrid = (width, height, size) => {
    const origin = { x: -size, y: -size };
    const v1 = { x: size * Math.sqrt(3), y: 0 };
    const v2 = { x: size * Math.sqrt(3) / 2, y: size * 1.5 };
    const cols = Math.ceil(width / (size * Math.sqrt(3))) + 1;
    const rows = Math.ceil(height / (size * 1.5)) + 1;
    let grid = [];
    for (let i = -cols; i <= cols; i++) {
      for (let j = -rows; j <= rows; j++) {
        const x = origin.x + i * v1.x + j * v2.x;
        const y = origin.y + i * v1.y + j * v2.y;
        grid.push({ x, y });
      }
    }
    return grid;
  };

  // Create a curried version of the selected function with its parameters
  const f = (x, y) => functionDefinitions[store.fnKey].func(x, y, store.fnParams);

  const width = canvas.value.width;
  const height = canvas.value.height;
  const s = spacing.value;

  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;

  switch (gridType.value) {
    case 0: // Square grid
      // Draw vertical lines
      for (let x = 0; x <= width; x += s) {
        const [wx1, wy1] = warpPoint(x, 0, f);
        const [wx2, wy2] = warpPoint(x, height, f);
        
        ctx.moveTo(wx1, wy1);
        ctx.lineTo(wx2, wy2);
      }
      
      // Draw horizontal lines
      for (let y = 0; y <= height; y += s) {
        const [wx1, wy1] = warpPoint(0, y, f);
        const [wx2, wy2] = warpPoint(width, y, f);
        
        ctx.moveTo(wx1, wy1);
        ctx.lineTo(wx2, wy2);
      }
      break;

    case 1: // Equilateral triangular grid
      const triangleGrid = generateTriangularGrid(width, height, s);
      
      // Draw the triangular grid
      for (let i = 0; i < triangleGrid.length - 1; i++) {
        for (let j = 0; j < triangleGrid[i].length - 1; j++) {
          const p1 = triangleGrid[i][j];
          const p2 = triangleGrid[i + 1][j];
          const p3 = triangleGrid[i][j + 1];
          
          // Warp the points
          const [x1, y1] = warpPoint(p1.x, p1.y, f);
          const [x2, y2] = warpPoint(p2.x, p2.y, f);
          const [x3, y3] = warpPoint(p3.x, p3.y, f);
          
          // Draw the triangle
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.lineTo(x3, y3);
          ctx.closePath();
          ctx.stroke();
          
          // Draw the adjacent triangle to complete the grid
          if (i < triangleGrid.length - 2 && j < triangleGrid[i].length - 2) {
            const p4 = triangleGrid[i + 1][j + 1];
            const [x4, y4] = warpPoint(p4.x, p4.y, f);
            
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(x3, y3);
            ctx.lineTo(x4, y4);
            ctx.closePath();
            ctx.stroke();
          }
        }
      }
      break;

    case 2: // Regular hexagonal grid
      const hexGrid = generateHexagonalGrid(width, height, s);
      
      // Draw the hexagonal grid
      hexGrid.forEach(center => {
        const vertices = getHexagonVertices(center, s);
        
        // Warp the vertices
        const warpedVertices = vertices.map(v => warpPoint(v.x, v.y, f));
        
        // Draw the hexagon
        ctx.beginPath();
        warpedVertices.forEach(([x, y], index) => {
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.stroke();
      });
      break;
  }
  
  ctx.stroke();
}

// Watch for changes to parameters and redraw
watch([spacing, warpAlpha, gridType, () => store.fnKey, () => store.fnParams], () => {
  draw();
}, { immediate: true });

// Generate a filename based on current function and parameters
const getFilename = () => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  
  const funcName = store.fnKey;
  const params = Object.entries(store.fnParams || {})
    .map(([key, value]) => `${key}${Math.round(value * 100) / 100}`)
    .join('_');
    
  return `grid_${funcName}_${params}_${dateStr}_${timeStr}.png`;
};

// Save canvas as PNG
const saveCanvasAsPNG = () => {
  if (!canvas.value) return;
  
  // Create a temporary canvas with white background
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.value.width;
  tempCanvas.height = canvas.value.height;
  const tempCtx = tempCanvas.getContext('2d');
  
  // Fill with white background
  tempCtx.fillStyle = 'white';
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  
  // Draw the original canvas on top
  tempCtx.drawImage(canvas.value, 0, 0);
  
  // Create download link
  const link = document.createElement('a');
  link.download = getFilename();
  link.href = tempCanvas.toDataURL('image/png');
  link.click();
};

// Initialize on mount
onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
  // Initial draw with default function
  onFunctionUpdate(selectedFunction.value);
  
  // Add cursor style to indicate clickable
  if (canvas.value) {
    canvas.value.style.cursor = 'pointer';
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
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
