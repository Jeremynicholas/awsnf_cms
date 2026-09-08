<!-- Media.vue -->
<template>
  <Sections>
    <div class="media_container">
        <div class="gallery_container scrollbar">
            <div class="gallery_upload">
              <input ref="fileInput" type="file" accept="image/*, application/pdf" style="display:none" @change="uploadSingleImage" />
              <button type="button" class="solid" @click="fileInput.click()">
                Upload Image
              </button>
              <div>
                <input v-model="searchQuery" placeholder="Search for an image" class="search-input">

                <div class="refresh"
                    @click="fetchImages(true)">
                    <i class="fa fa-refresh"></i>
                </div>

                <button type="button"  @click="imageStore.syncCloudinaryImages">
                  <i class="fa fa-refresh"></i> Sync
                </button>
              </div>
            </div>

            <div v-if="isLoading && !allImages.length">
                <Loading />
            </div>

            <div v-else-if="!allImages.length">
                <p>No images found.</p>
            </div>
        
            <div v-else class="gallery scrollbar">
                <div v-for="(image, index) in allImages" :key="image.public_id || image.name" class="image_container">
                    <div v-if="image.isUploading" class="loading-bar">
                        <div :style="{ width: image.progress + '%' }"></div>
                    </div>  
                    <div v-else 
                        class="items thumbnail clickable" :class="{ selected: image.docId === selectedImage?.docId || image.docId === model?.docId }">
                        <div class="overlay"></div>
                        <img v-if="!image.format || image.format !== 'pdf'"
                          v-lazy="image.url"
                          alt="Gallery image"
                          @click="handleImageClick(image, index)"
                        />
                        <img v-else
                          v-lazy="'/file-icon-pdf'"
                          alt="Gallery image"
                          @click="handleImageClick(image, index)"
                        >
                            <div class="item_footer">
                            <span class="image_title">{{ image.name }}</span>
                            </div>
                        
                    </div>
                </div>
            </div>

            <div class="load_more" v-if="imageStore.hasMore && !searchQuery.trim()">
                <button type="button" class="buttons" @click="imageStore.loadMoreImages()">
                    {{ imageStore.isLoadingMore ? 'Loading…' : 'Load more' }}
                </button>
            </div>
        </div>

        <div class="sidebar">
            <h3 v-if="!editContentState.visible">Select an Image to edit</h3>
            <EditImageData
            :visible="editContentState.visible"
            @update:visible="editContentState.visible = $event"
            @delete:image="handleImageDelete"
            @update:imageData="handleImageUpdate"
            :modelValue="editContentState.value"
            :title="'Edit ' + editContentState.field"
            :inputType="editContentState.inputType"
            :index="editContentState.index"/>
        </div>
    </div>
  </Sections>
</template>
  
<script setup>
import { ref, computed, watch, watchEffect, onMounted } from 'vue';

import Loading from '../components/layout/Loading.vue';
import { useImageStore } from '../store/images';
import EditImageData from '../components/modals/fields/EditImageData.vue'
import Sections from '../components/layout/Sections.vue';

  const props = defineProps({
    modelValue: {
      type: Object,
      default: () => ({}) 
    }
  });

  const imageStore = useImageStore();

  onMounted(() => {
    if (!imageStore.images.length) {
        imageStore.fetchImages(false)
    }
})

  const emit = defineEmits(['update:modelValue', 'saveFeatureImage',
  'update:visible', 'selected', 'update:imageData']);
  
  const model = defineModel()
  const fileInput = ref(null)

  const { fetchImages, uploadSingleImage, handleImageUpdate, handleImageDelete, selectImage, } = imageStore;

  const images = computed(() => imageStore.images);
  const filteredImages = computed(() => imageStore.filteredImages);
  const selectedImage = computed(() => imageStore.selectedImage);
  const isLoading = computed(() => imageStore.isLoading);

  const searchQuery = computed({
    get: () => imageStore.searchQuery,
    set: (val) => imageStore.searchQuery = val,
  });
  

const allImages = computed(() => filteredImages.value || []);


// EDIT IMAGE DATA MODAL
const handleImageClick = (image, index) => {
  selectImage(image);
  openEditModal(image, index);
};

  const editContentState = ref({
          visible: false,
          value: {},
          field: '',
          inputType: '',
          index: -1,
          activeIndex: null
      });

  const openEditModal = (image, index) => {
    editContentState.value = {
        visible: true,
        value: image,  
        field: 'image', 
        inputType: 'meta',
        activeIndex: index
      };
  };    
    

  watchEffect(() => {
  if (props.modelValue) {
    const match = images.value.find(img => img.docId === props.modelValue);
    if (match) {
      selectImage(match);
      openEditModal(match, images.value.indexOf(match));
    }
  }
});


// If image is deleted, then save feature image back to empty string
watch(
  () => images.value.map(img => img.docId), // just track docIds
  (newDocIds) => {
    const featureId = typeof props.modelValue === 'string'
      ? props.modelValue
      : props.modelValue?.docId

    if (!featureId) return

    const stillExists = newDocIds.includes(featureId)
    if (!stillExists) {
      emit('update:modelValue', null) 
      emit('saveFeatureImage', '')
    }
  }
)

  </script>

<style scoped>

</style>
