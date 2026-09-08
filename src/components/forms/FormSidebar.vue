<template>
    <div class="sidebar" v-if="formData">
      <div>
      <h3>Status</h3>
      <div class="items status">
        <span class="status_button clickable" :class="{ 'published': formData.published, 'draft': !formData.published }"
        @click="emitFieldUpdate('published')">
        {{ formData.published ? 'Published' : 'Draft' }} 
      </span>
        <a class="icons" :href="previewUrl" target="_blank">
          <i class="fas fa-eye"></i>
        </a>
      </div>

      <h3>Feature Image</h3>
      <div class="items thumbnail" 
      :style="{ backgroundImage: featureImageData?.url ? `url(${featureImageData?.url})` : 'none'}">
        <div class="icons feature_image"
          @click="emitEditRequest({
              title: 'Edit or select a feature image',
              inputType: 'featureImage',
              field: 'featureImage',
              value: formData.featureImage,
              index,
            })">
            <i class="fas fa-edit"></i>
        </div>
      </div>

      <div>
        <button class="duplicate-button" @click="$emit('duplicate')">
          <i class="fas fa-copy"></i> Duplicate Form
        </button>
      </div>

      <div>
        <button class="duplicate-button" @click="$emit('delete')">
          <i class="fas fa-trash"></i> Delete Form
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue';
import { useLookupStore } from '../../store/lookups';

const props = defineProps({
  formData: Object
})

const emit = defineEmits(['edit-request', 'save', 'duplicate', 'delete']);

// FOR MODALS
function emitEditRequest({ field, value, inputType, title, index = null }) {
  emit('edit-request', { field, value, inputType, title: title, index });
}

// NO MODALS SO LETTING SLUG PAGE HANDLE SAVING
const emitFieldUpdate = (fieldName, value) => {
  let newValue = value ?? props.formData[fieldName];

  if (fieldName === 'published') {
    newValue = !props.formData[fieldName];
  }

  emit('save', { field: fieldName, value: newValue });
};


// LOOKUPS
const lookupStore = useLookupStore()

const featureImageData = computed(() => {
  if (!props.formData?.featureImage) return null;
  
  const image = lookupStore.lookupMaps.images[props.formData.featureImage];
  if (!image) console.log('🛑 Image not found in lookupStore for ID:', props.formData.featureImage);
  return image || null;
});

const route = useRoute()

const vueSlug = route.params.vueSlug || ''
const isPreview = computed(() => (props.formData && !props.formData.published ? '?preview=true' : ''))

const previewUrl = computed(() => {
  const base = 'https://awsnfs-nuxt.web.app/au/'
  const slug = props.formData ? props.formData.slug : vueSlug
  return `${base}${slug}${isPreview.value}`
})

</script>