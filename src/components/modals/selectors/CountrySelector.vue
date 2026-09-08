<template>
    <div class="selector_popup">
      <div class="input-area" @click="togglePopup(true)">
        <input type="text" v-model="searchQuery" placeholder="Search countries..." @input="filterCountries">
        <span class="category-tag" v-for="countryId in internalSelectedCountry" :key="countryId">
          {{ getCountryName(countryId) }} <span @click.stop="removeCountry(countryId)">x</span>
        </span>
      </div>
      <ul v-show="popupVisible && filteredCountries.length > 0" class="category-popup">
        <li v-for="country in filteredCountries" :key="country.id" @click="addCountry(country.id)">
          {{ country.name }}
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
  const countries = computed(() => lookupStore.lookups.countries)
  const internalSelectedCountry = ref([...props.modelValue])
  const searchQuery = ref('');
  const filteredCountries = ref([]);
  const popupVisible = ref(false);
  
  const filterCountries = () => {
    if (searchQuery.value.trim() === '') {
      filteredCountries.value = countries.value;
    } else {
      filteredCountries.value = countries.value.filter(country =>
      country.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    }
  };
  
  const togglePopup = (show) => {
    popupVisible.value = show;
    filterCountries();
  };

  const handleOutsideClick = (event) => {
    if (!event.target.closest('.selector_popup') && popupVisible.value) {
      popupVisible.value = false;
    }
  };

  onMounted(async () => {
    document.addEventListener('click', handleOutsideClick)

    if (lookupStore.lookups.countries.length === 0) {
      await lookupStore.fetchCountries()
    }
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleOutsideClick);
  });
    
  const getCountryName = (id) => {
    const country = countries.value.find(cont => cont.id === id);
    return country ? country.name : 'Name not found';
  };
  
  const addCountry = (id) => {
    if (!internalSelectedCountry.value.includes(id)) {
        internalSelectedCountry.value.push(id);
        emit('update:modelValue', [...internalSelectedCountry.value]);
    }
    searchQuery.value = '';
    popupVisible.value = false; 
  };
  
  const removeCountry = (id) => {
    const index = internalSelectedCountry.value.indexOf(id);
    if (index !== -1) {
        internalSelectedCountry.value.splice(index, 1);
      emit('update:modelValue', internalSelectedCountry.value);
    }
  };
  
  
  watch(() => props.modelValue, (newVal) => {
    internalSelectedCountry.value = [...newVal]
  })
    
  </script>
  
