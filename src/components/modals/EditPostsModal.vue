<template>
    <div class="actions">
      <div class="icons" @click.stop="openToggleModal(post.id)">
        <i class="fas fa-ellipsis-v"></i>
      </div>
      
    <!-- Modal toggle -->
      <div v-if="isToggleOpen === post.id" class="modal toggle">
        <span class="close-button toggle" @click="closeToggleModal(post.id)">&times;</span>
        <div class="edit" @click="openEditModal(post.id)">
            <i class="fas fa-edit"></i>
        </div>
        <div class="edit" @click="openDeleteModal(post.id)">
            <i class="fas fa-trash"></i>
        </div>
      </div>   
    </div>
    
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const props = defineProps({
    post: Object
  });
  
  const emit = defineEmits(['edit', 'delete', 'close']);
  
  const isToggleOpen = ref(null);
  
    function openToggleModal(id) {
        isToggleOpen.value = id;
    }
  
    function closeToggleModal(id) {
        if (isToggleOpen.value === id) {
            isToggleOpen.value = null;
            emit('close');
        }
    }
  
    function openEditModal() {
        emit('edit', props.post); 
        }

    function openDeleteModal() {
        emit('delete', props.post);
    }
    
  </script>
  
  <style scoped>

  </style>
  