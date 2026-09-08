<template>
    <Sections>
      <NewPostForm type="trips"
        :isSpecial="isSpecial"
        :isGroupTour="isGroupTour"
        @postCreated="handlePostCreated"
        />
    </Sections>
    <Sections>
    
      <h2 v-if="!isSpecial && !isGroupTour">All Trips</h2>
      <h2 v-if="isSpecial">All Specials</h2>
      <h2 v-if="isGroupTour">All Group Tours</h2>
      
      <ListAllPosts
        :postType="'trips'"
        :isSpecial="isSpecial"
        :isGroupTour="isGroupTour"
        :refreshKey="refreshKey"
      />

    </Sections>
  </template>
  
  <script setup>
  import { ref } from 'vue';

  import ListAllPosts from '../components/posts/ListAllPosts.vue'
  import NewPostForm from '../components/posts/NewPostForm.vue'
  import Sections from '../components/layout/Sections.vue'

    const props = defineProps({
      isSpecial: Boolean,
      isGroupTour: Boolean
  });

  const refreshKey = ref(0);

  function handlePostCreated() {
    refreshKey.value++; // This will trigger reactivity in ListAllPosts
  }

</script>