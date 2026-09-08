<template>
    <Sections>
      <NewPostForm type="accommodation" />
    </Sections>
    <Sections>
    
      <h2>All Accommodation</h2>
      <ListAllPosts :postType="'accommodation'" />

    </Sections>
  </template>
  
  <script setup>
  import ListAllPosts from '../components/posts/ListAllPosts.vue'
  import NewPostForm from '../components/posts/NewPostForm.vue'
  import Sections from '../components/layout/Sections.vue'
  </script>