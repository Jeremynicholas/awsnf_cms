<template>
    <div class="selector_popup">
      <div class="input-area" @click="togglePopup(true)">
        <input type="text" v-model="searchQuery" placeholder="Search regions..." @input="filterRegions">
        <span class="category-tag" v-for="regionId in internalSelectedRegion" :key="regionId">
          {{ getRegionName(regionId) }} <span @click.stop="removeRegion(regionId)">x</span>
        </span>
      </div>
      <ul v-show="popupVisible && filteredRegions.length > 0" class="category-popup">
        <li v-for="region in filteredRegions" :key="region.id" @click="addRegion(region.id)">
          {{ region.name }}
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { useLookupStore } from '../../../store/lookups'

  const props = defineProps({
    modelValue: {
      type: Array,
      default: () => [] 
    }
  });
  
  const emit = defineEmits(['update:modelValue'])

  const lookupStore = useLookupStore()
  const regions = computed(() => lookupStore.lookups.regions)
  const internalSelectedRegion = ref([...props.modelValue])
  const searchQuery = ref('');
  const filteredRegions = ref([]);
  const popupVisible = ref(false);
  
  const filterRegions = () => {
    if (searchQuery.value.trim() === '') {
      filteredRegions.value = regions.value;
    } else {
      filteredRegions.value = regions.value.filter(region =>
      region.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    }
  };
  
  const togglePopup = (show) => {
    popupVisible.value = show;
    filterRegions();
  };

  const handleOutsideClick = (event) => {
    if (!event.target.closest('.selector_popup') && popupVisible.value) {
      popupVisible.value = false;
    }
  };

  onMounted(async () => {
    document.addEventListener('click', handleOutsideClick)

    if (lookupStore.lookups.regions.length === 0) {
      await lookupStore.fetchRegions()
    }
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleOutsideClick);
  });
    
  const getRegionName = (id) => {
    const region = regions.value.find(cont => cont.id === id);
    return region ? region.name : 'Name not found';
  };
  
  const addRegion = (id) => {
    if (!internalSelectedRegion.value.includes(id)) {
        internalSelectedRegion.value.push(id);
        emit('update:modelValue', [...internalSelectedRegion.value]);
    }
    searchQuery.value = '';
    popupVisible.value = false; 
  };
  
  const removeRegion = (id) => {
    const index = internalSelectedRegion.value.indexOf(id);
    if (index !== -1) {
        internalSelectedRegion.value.splice(index, 1);
      emit('update:modelValue', internalSelectedRegion.value);
    }
  };
  
  
  watch(() => props.modelValue, (newVal) => {
    internalSelectedRegion.value = [...newVal]
  })
    
  </script>
  
