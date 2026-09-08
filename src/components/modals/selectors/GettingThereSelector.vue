<template>
  <select v-model="selected" @change="emit('update:modelValue', selected)">
    <option value="">Select a getting there</option>
    <option v-for="option in gettingThereOptions" :key="option.id" :value="option.id">
      {{ option.name }}
    </option>
  </select>
</template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { useLookupStore } from '../../../store/lookups'

  const props = defineProps({
    modelValue: {
      type: String,
      default: '' 
    }
  });
  
  const emit = defineEmits(['update:modelValue'])

  const lookupStore = useLookupStore()
  const gettingThereOptions = computed(() => lookupStore.lookups.gettingThere)
  const selected = ref(props.modelValue)



  onMounted(async () => {
    if (lookupStore.lookups.gettingThere.length === 0) {
      await lookupStore.fetchGettingThere()
    }
  })
  
    watch(() => props.modelValue, val => {
    selected.value = val
    })
        
  </script>
  
