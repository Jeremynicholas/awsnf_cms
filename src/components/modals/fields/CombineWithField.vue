<!-- components/modals/fields/CombineWithField.vue -->
<template>
  <div class="highlight-field">

    <!-- Image picker -->
    <div class="thumbnail items"
      :style="{ backgroundImage: model.imageData?.url ? `url(${model.imageData.url})` : 'none' }"
      style="max-height: 120px; margin-bottom: 12px;">
      <div class="icons feature_image"
        @click="imageModal = true">
        <i class="fas fa-edit"></i>
      </div>
    </div>

    <div style="margin-bottom: 10px;">
      <small>Title</small>
      <input
        class="text_input"
        type="text"
        :value="model.title"
        @input="update('title', $event.target.value)"
        placeholder="Combine With title"
      />
    </div>

    <div>
      <small>Text</small>
      <textarea
        class="text_input"
        :value="model.text"
        @input="update('text', $event.target.value)"
        placeholder="Combine With description"
        rows="4"
      />
    </div>

  </div>

  <EditBlogImageModal
    v-model:visible="imageModal"
    @select="handleImageSelect"
  />
</template>

<script setup>
import { ref } from 'vue'
import EditBlogImageModal from '../EditBlogImageModal.vue'
import { useLookupStore } from '../../../store/lookups'

const model = defineModel()
const imageModal = ref(false)
const lookupStore = useLookupStore()

function update(key, val) {
  model.value = { ...model.value, [key]: val }
}

function handleImageSelect(imageId) {
  const imageData = lookupStore.lookupMaps.images?.[imageId] || null
  model.value = { ...model.value, image: imageId, imageData }
}
</script>