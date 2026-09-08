<template>
  <main>
    <Header v-if="authStore.user" />
    <div class="site-container scrollbar_hidden" :class="{ logged_out : !authStore.user }">
      <div class="col_left" v-if="authStore.user">
        <Sidebar /> 
      </div>
      <div class="col_right">
        <Loading v-if="isLoading" />
        <RouterView v-slot="{ Component }" >
        <Transition name="fade" mode="out-in">
          <div :key="Component">
            <component :is="Component"/>
          </div>
        </Transition>
      </RouterView>
      </div>
    </div>    
  </main>
</template>

<script setup >
import { ref, onMounted } from 'vue';
import Header from './components/layout/Header.vue'
import Sidebar from './components/layout/Sidebar.vue'
import Loading from './components/layout/Loading.vue'

import { useLookupStore } from './store/lookups'
import { useImageStore } from './store/images'
import { useAuthStore } from './store/auth'

  const isLoading = ref(true);
  const lookupStore = useLookupStore()
  const imageStore = useImageStore()
  const authStore = useAuthStore()

  onMounted(async () => {
    await Promise.all([
      lookupStore.fetchCountries(),
      lookupStore.fetchAccommodation(),
      lookupStore.fetchRegions(),
      lookupStore.fetchHolidayTypes(),
      lookupStore.fetchTestimonials(),
      lookupStore.fetchGettingThere(),
      lookupStore.fetchStaffBios(),
    ])

    console.log("App.js Loaded image count:", imageStore.images.length);
    isLoading.value = false;
    imageStore.fetchImages(false)
})

</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}


.site-container {
  display: grid;
  grid-template-columns: 200px auto;
  height: var(--siteContainerHeight);
  overflow-y: scroll;

  &.logged_out {
      grid-template-columns: auto;
  }

  @media (max-width: 1024px) {
      grid-template-columns: auto;
  }
}

.col_left {
  position: relative;
  border-right: var(--borders);
  
  @media(max-width: 1024px) {
      display: none;
    }

  .sidebar {
    @media(max-width: 1024px) {
      display: none;
    }
  }
}

.site-container.logged_out {
  height: 100svh;
}

.col_right {
  div {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
}  



</style>