<template>
    <Sections>
      <NewPostForm type="blogs" />
    </Sections>
    <Sections>
    
      <h2>All Blogs</h2>
      <ListAllPosts :postType="'blogs'" />

    </Sections>
  </template>
  
  <script setup>
  import ListAllPosts from '../components/posts/ListAllPosts.vue'
  import NewPostForm from '../components/posts/NewPostForm.vue'
  import Sections from '../components/layout/Sections.vue'
  </script>