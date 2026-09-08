<template>
  <Teleport to="body">
    <div v-if="visible" class="image-modal-overlay">
      <div class="image-modal-content">
        <span class="close" @click="$emit('update:visible', false)">&times;</span>
        <h2>Select Image</h2>

        <!-- reuse BlogImageField inside -->
        <BlogImageField
          v-model="selectedImage"
          @saveFeatureImage="handleSelect"
        />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import BlogImageField from './fields/BlogImageField.vue'

const props = defineProps({
  visible: Boolean,
})
const emit = defineEmits(['update:visible', 'select'])

const selectedImage = ref(null)

function handleSelect(imageId) {
  emit('select', imageId)
  emit('update:visible', false)
}
</script>

<style scoped>
.image-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.image-modal-content {
  position: relative;
  width: 90%;
  max-width: 1200px;
  max-height: 80vh;
  height: min-content;
  background: var(--background);
  border-radius: var(--rounded);
  padding: var(--padding15);
  box-shadow: var(--box-shadow-large);
  overflow: hidden;

  &:deep(.gallery) {
    max-height: calc(80vh - 16rem);

    @media (max-width: 768px) {
      max-height: calc(80vh - 18rem);
    }
  }
}
</style>
