<template>
    <Sections>
        <h1>Global Collections</h1>
          <div>
            <div class="global_tabs">
              <button v-for="tab in tabs" 
                :key="tab.name" 
                @click="activeTab = tab.name"
                :class="{ 'active-tab': activeTab === tab.name }">
                {{ tab.label }}
              </button>
            </div>

            <GlobalEditor 
              v-if="activeTab === 'gettingThere'"
              title="Getting There"
              collectionName="gettingThere"
            />
            <GlobalEditor 
              v-else-if="activeTab === 'staffBios'"
              title="Staff Bios"
              collectionName="staffBios"
            />
            <GlobalEditor 
              v-else-if="activeTab === 'testimonials'"
              title="Testimonial"
              collectionName="testimonials"
            />
          </div>
    </Sections>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRouter, useRoute } from 'vue-router'

  import Sections from '../components/layout/Sections.vue'  
  import GlobalEditor from '../components/global-data/GlobalEditor.vue'
  
  const router = useRouter()
  const route = useRoute()

  const activeTab = ref('gettingThere')
  const tabs = [
    { name: 'gettingThere', label: 'Getting There' },
    { name: 'staffBios', label: 'Staff Bios' },
    { name: 'testimonials', label: 'Testimonials' },
  ]

  onMounted(() => {
    const tabFromQuery = route.query.tab
    if (tabFromQuery && tabs.some(t => t.name === tabFromQuery)) {
      activeTab.value = tabFromQuery
    }
  })
  
  watch(activeTab, (newTab) => {
    router.replace({ query: { ...route.query, tab: newTab } })
  })
  
  </script>
  
  <style>
  .global_tabs {
    display: flex;
    gap: var(--gap10);
    margin-bottom: var(--gap30);
  }


  

  </style>
  