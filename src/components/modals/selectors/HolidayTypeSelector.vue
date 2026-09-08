<template>
    <div class="selector_popup">
      <div class="input-area" @click="togglePopup(true)">
        <input type="text" v-model="searchQuery" placeholder="Search holiday types...">
        <span class="category-tag" v-for="id in internalSelected" :key="id">
          {{ getName(id) }} <span @click.stop="remove(id)">x</span>
        </span>
      </div>
      <ul v-show="popupVisible && filtered.length > 0" class="category-popup">
        <li v-for="item in filtered" :key="item.id" @click="add(item.id)">
          {{ item.name }}
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
const holidayTypes = computed(() => lookupStore.lookups.holidayTypes)
const internalSelected = ref([...props.modelValue])
const searchQuery = ref('');
const filtered = ref([]);
const popupVisible = ref(false);

const filterHolidayTypes = () => {
    filtered.value = searchQuery.value.trim()
        ? holidayTypes.value.filter(t => t.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
        : holidayTypes.value
}
  
const togglePopup = (show) => {
    popupVisible.value = show;
    filterHolidayTypes();
};

  const handleOutsideClick = (event) => {
    if (!event.target.closest('.selector_popup') && popupVisible.value) {
      popupVisible.value = false;
    }
  };

onMounted(async () => {
    document.addEventListener('click', handleOutsideClick)
    if (!lookupStore.lookups.holidayTypes?.length) {
        await lookupStore.fetchHolidayTypes()
    }
})

  onUnmounted(() => {
    document.removeEventListener('click', handleOutsideClick);
  });
    
  const getName = (id) => holidayTypes.value.find(t => t.id === id)?.name || 'Unknown'
  
  const add = (id) => {
    if (!internalSelected.value.includes(id)) {
        internalSelected.value.push(id);
        emit('update:modelValue', [...internalSelected.value]);
    }
    searchQuery.value = '';
    popupVisible.value = false; 
  };
  
const remove = (id) => {
  const index = internalSelected.value.indexOf(id)
  if (index !== -1) {
    internalSelected.value.splice(index, 1)
    emit('update:modelValue', [...internalSelected.value])
  }
}
  
  
  watch(() => props.modelValue, (val) => {
  internalSelected.value = [...val]
})
    
  </script>
  
