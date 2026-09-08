<template>
    <div v-if="postData">
        <h3>Post Gallery</h3>  
        <div class="items">
          <div class="post_gallery">
            <img v-for="(image, index) in postGalleryData" 
              :key="index"
              class="items status"
              loading="lazy"
              :src="image.url"
              />
          </div>
          <div class="icons"
            @click="emitEditRequest({
                title: 'Select images (max 6)',
                inputType: 'postGallery',
                field: 'postGallery',
                value: postData.postGallery,
                imageFilter: null,
                index,
            })">
              <i class="fas fa-edit"></i>
            </div>
        </div>

        <h3>Testimonial</h3>  
        <small>Testimonial images</small>
        <div class="items">
          <div class="post_gallery">
            <img v-for="(image, index) in testimonialGalleryData" 
              :key="index"
              class="items status"
              loading="lazy"
              :src="image.url"
            />
          </div>
          <div class="icons"
            @click="emitEditRequest({
              title: 'Select testimonial images (max 6)',
              inputType: 'postGallery',
              field: 'postTestimonialGallery',
              value: postData.postTestimonialGallery,
              imageFilter: null,
              index,
            })">
            <i class="fas fa-edit"></i>
          </div>
        </div>

        <small>Testimonials</small>
        <div class="items">
          <p>{{ testimonialNames?.join(', ') || 'No testimonials' }}</p>
          <div class="icons"
           @click="emitEditRequest({
            title: 'Select testimonials',
            inputType: 'testimonials',
            field: 'testimonials',
            value: postData.testimonials,
            index,
          })">
            <i class="fas fa-edit"></i>
          </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useLookupStore } from '../../../../store/lookups';

const props = defineProps({
  postData: Object
})

const emit = defineEmits(['edit-request', 'save']);

// FOR MODAL
function emitEditRequest({ field, value, inputType, title, imageFilter = null, index = null }) {
  emit('edit-request', { field, value, inputType, title: title, imageFilter, index });
}

// LOOKUPS
const lookupStore = useLookupStore()

const postGalleryData = computed(() => {
  if (!props.postData?.postGallery?.length) return []
  return props.postData.postGallery
    .map(id => lookupStore.lookupMaps.images[id])
    .filter(item => !!item)
})

const testimonialGalleryData = computed(() => {
  if (!props.postData?.postTestimonialGallery?.length) return []
  return props.postData.postTestimonialGallery
    .map(id => lookupStore.lookupMaps.images[id])
    .filter(Boolean)
})

const testimonialNames = computed(() => {
  if (!props.postData?.testimonials?.length) return []
  return props.postData.testimonials
    .map(id => lookupStore.lookupMaps.testimonials[id]?.name || 'Unknown')
})
</script>