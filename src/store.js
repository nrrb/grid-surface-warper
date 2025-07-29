// create a pinia store to contain the state of which function is selected and its parameters
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { functionDefinitions } from './functions';

export const useFunctionStore = defineStore('function', () => {
    const fnKey = ref('sineRidge');
    const fnParams = ref({
      a: functionDefinitions['sineRidge'].params.a.value,
      b: functionDefinitions['sineRidge'].params.b.value
    });

    return {
      fnKey,
      fnParams
    }
  })

