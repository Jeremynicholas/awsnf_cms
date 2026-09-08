<template>
  <div v-if="visible" class="full_screen">
    <div class="modal-content">
      <span class="close" @click="$emit('update:visible', false)">&times;</span>
      <h3>{{ title }}</h3>

      <iframe
        v-if="url"
        :src="url"
        style="width:100%; height:100%; border:0;"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: Boolean,
  url: String,
  title: { type: String, default: 'Preview' },
})
defineEmits(['update:visible'])
</script>