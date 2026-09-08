// store/lookups.js
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { firestore } from '../firebase/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { useImageStore } from '../store/images'

export const useLookupStore = defineStore('lookups', () => {
  const imageStore = useImageStore()

  const lookups = ref({
    images: [],
    countries: [],
    accommodation: [],
    regions: [],
    holidayTypes: [],
    testimonials: [],
    gettingThere: [],
    staffBios: []
  })

  const lookupMaps = ref({
    images: {},
    countries: {},
    accommodation: {},
    regions: {},
    holidayTypes: {},
    testimonials: {},
    gettingThere: {},
    staffBios: {}
  })

const fetchLookups = async (key, collectionName) => {
  if (!collectionName) {
    console.warn(`Collection name for key '${key}' is invalid.`);
    return
  }

  if (lookups.value[key]?.length > 0) return

    const snapshot = await getDocs(collection(firestore, collectionName))
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    lookups.value[key] = data
    lookupMaps.value[key] = data.reduce((map, item) => {
      map[item.id] = item
      return map
    }, {})
  }

// --- Sync images with imageStore instead of fetching ---
  watch(
    () => imageStore.images, // assuming imageStore.images is reactive
    (newImages) => {
      lookups.value.images = newImages
      lookupMaps.value.images = newImages.reduce((map, img) => {
        map[img.public_id] = img
        return map
      }, {})
    },
    { immediate: true }
  )

  // Convenience wrappers
  const fetchCountries = () => fetchLookups('countries', 'countries')
  const fetchAccommodation = () => fetchLookups('accommodation', 'accommodation')
  const fetchRegions = () => fetchLookups('regions', 'regions')
  const fetchHolidayTypes = () => fetchLookups('holidayTypes', 'holidayTypes')
  const fetchTestimonials = () => fetchLookups('testimonials', 'testimonials')
  const fetchGettingThere = () => fetchLookups('gettingThere', 'gettingThere')
  const fetchStaffBios = () => fetchLookups('staffBios', 'staffBios')

  return {
    lookups,
    lookupMaps,
    fetchCountries,
    fetchAccommodation,
    fetchRegions,
    fetchHolidayTypes,
    fetchTestimonials,
    fetchGettingThere,
    fetchStaffBios,
    fetchLookups // still exported in case you want to call dynamically
  }
})
