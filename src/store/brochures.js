// store/forms.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { firestore } from '../firebase/firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'

export const useBrochureStore = defineStore('brochures', () => {
  const brochures = ref([])
  const isLoading = ref(false)
  const searchQuery = ref('')

  const fetchBrochures = async (force = false) => {
    // super light cache: if we already have data and not forcing, don’t refetch
    if (!force && brochures.value.length) return

    isLoading.value = true
    try {
      const q = query(collection(firestore, 'brochures'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      brochures.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } catch (e) {
      console.error('Error fetching brochures:', e)
    } finally {
      isLoading.value = false
    }
  }

  const filteredBrochures = computed(() => {
    const terms = searchQuery.value.toLowerCase().split(/\s+/).filter(Boolean)

    return brochures.value.filter(b => {
      const haystack = `${b.title || ''} ${b.name || ''} ${b.file?.filename || ''}`.toLowerCase()
      return terms.every(t => haystack.includes(t))
    })
  })

  return {
    brochures,
    isLoading,
    searchQuery,
    fetchBrochures,
    filteredBrochures,
  }
})
