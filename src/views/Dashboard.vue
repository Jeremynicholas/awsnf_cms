<template>
  <Sections>
    <h1>All posts</h1>

    <div class="flex space_between">
      <h2>Trips</h2>
      <RouterLink :to="{ name: 'trips' }"><i class="fas fa-plus"></i> <span>Add new trip</span></RouterLink>
    </div>
    <ListAllPosts :postType="'trips'" />

    <div class="flex space_between">
      <h2>Accommodation</h2>
     <RouterLink :to="{ name: 'accommodation' }"><i class="fas fa-plus"></i> <span>Add new accommodation</span></RouterLink>
    </div>
    <ListAllPosts :postType="'accommodation'" />

    <div class="flex space_between">
      <h2>Blogs</h2>
     <RouterLink :to="{ name: 'blogs' }"><i class="fas fa-plus"></i> <span>Add new blog</span></RouterLink>
    </div>
    <ListAllPosts :postType="'blogs'" />
    
  </Sections>

  
</template>

<script setup>
import ListAllPosts from '../components/posts/ListAllPosts.vue'
import Sections from '../components/layout/Sections.vue'
</script>

<style scoped>
h2 {
  margin: 0;
}
</style>