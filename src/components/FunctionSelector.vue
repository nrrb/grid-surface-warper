<template>
  <div class="function-selector">
    <v-row>
      <v-col cols="12">
        <v-select
          v-model="store.fnKey"
          :items="functionOptions"
          item-title="name"
          item-value="key"
          :item-title="key => functionDefinitions[key].name"
          label="Surface Function"
          @update:model-value="onFunctionChange"
        ></v-select>
      </v-col>
    </v-row>

    <v-row v-if="currentFunction?.params">
      <v-col v-for="(param, key) in currentFunction.params" :key="key" cols="12" sm="6" md="4">
        <v-slider
          :model-value="store.fnParams[key]"
          @update:model-value="(val) => onParamChange(key, val)"
          :min="param.min"
          :max="param.max"
          :step="param.step || 0.01"
          :label="param.label || key.toUpperCase()"
          thumb-label
          class="mb-6"
        ></v-slider>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { watch, computed } from 'vue';
import { functionDefinitions } from '../functions';
import { useFunctionStore } from '../store';

const store = useFunctionStore();

// Get all function keys for the select dropdown
const functionOptions = Object.keys(functionDefinitions);

// Current function definition based on selected key
const currentFunction = computed(() => functionDefinitions[store.fnKey]);

// Handle function selection change
const onFunctionChange = () => {
  if (!currentFunction.value?.params) {
    store.fnParams = {};
    return;
  }
  
  // Update params with default values from the function definition
  const newParams = {};
  Object.entries(currentFunction.value.params).forEach(([key, param]) => {
    newParams[key] = param.value;
  });
  
  store.fnParams = newParams;
};

// Handle parameter changes
const onParamChange = (key, value) => {
  store.fnParams = {
    ...store.fnParams,
    [key]: value
  };
};

// Watch for function key changes to update parameters
watch(() => store.fnKey, (newKey) => {
  if (newKey && functionDefinitions[newKey]) {
    onFunctionChange();
  }
}, { immediate: true });
</script>

<style scoped>
.function-selector {
  width: 100%;
}
</style>
