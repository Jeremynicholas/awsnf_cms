<template>
    <div class="selector_popup">
      <div class="input-area" @click="togglePopup(true)">
        <input type="text" v-model="searchQuery" placeholder="Search accommodation..." @input="filterAccommodation">
        <span class="category-tag" v-for="accommId in internalSelectedAccommodation" :key="accommId">
          {{ getAccommodationName(accommId) }} <span @click.stop="removeAccommodation(accommId)">x</span>
        </span>
      </div>
      <ul v-show="popupVisible && filteredAccommodation.length > 0" class="category-popup">
        <li v-for="accomm in filteredAccommodation" :key="accomm.id" @click="addAccommodation(accomm.id)">
          {{ accomm.name }}
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
  const accommodation = computed(() => lookupStore.lookups.accommodation)
  const internalSelectedAccommodation = ref([...props.modelValue])
  const searchQuery = ref('');
  const filteredAccommodation = ref([]);
  const popupVisible = ref(false);
  
  const filterAccommodation = () => {
    if (searchQuery.value.trim() === '') {
      filteredAccommodation.value = accommodation.value;
    } else {
      filteredAccommodation.value = accommodation.value.filter(accom =>
      accom.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    }
  };
  
  const togglePopup = (show) => {
    popupVisible.value = show;
    filterAccommodation();
  };

  const handleOutsideClick = (event) => {
    if (!event.target.closest('.selector_popup') && popupVisible.value) {
      popupVisible.value = false;
    }
  };

  onMounted(async () => {
    document.addEventListener('click', handleOutsideClick)

    if (lookupStore.lookups.accommodation.length === 0) {
      await lookupStore.fetchAccommodation()
    }
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleOutsideClick);
  });
    
  const getAccommodationName = (id) => {
    const accom = accommodation.value.find(accom => accom.id === id);
    return accom ? accom.name : 'Name not found';
  };
  
  const addAccommodation = (id) => {
    if (!internalSelectedAccommodation.value.includes(id)) {
        internalSelectedAccommodation.value.push(id);
        emit('update:modelValue', [...internalSelectedAccommodation.value]);
    }
    searchQuery.value = '';
    popupVisible.value = false; 
  };
  
  const removeAccommodation = (id) => {
    const index = internalSelectedAccommodation.value.indexOf(id);
    if (index !== -1) {
        internalSelectedAccommodation.value.splice(index, 1);
      emit('update:modelValue', internalSelectedAccommodation.value);
    }
  };
  
  
  watch(() => props.modelValue, (newVal) => {
    internalSelectedAccommodation.value = [...newVal]
  })
    
  </script>
  
