<template>
  <select v-model="selected" @change="emit('update:modelValue', selected)">
    <option value="">Select a tour escort</option>
    <option v-for="option in StaffBioOptions" :key="option.id" :value="option.id">
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
  const StaffBioOptions = computed(() => lookupStore.lookups.staffBios)
  const selected = ref(props.modelValue)



  onMounted(async () => {
    if (lookupStore.lookups.staffBios.length === 0) {
      await lookupStore.fetchStaffBios()
    }
  })
  
    watch(() => props.modelValue, val => {
    selected.value = val
    })
        
  </script>
  
