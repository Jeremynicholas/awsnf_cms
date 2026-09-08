<!-- GalleryImageField.vue -->
<template>
  <div class="media_container">
    <div class="gallery_container scrollbar">

      <input ref="fileInput" type="file" multiple @change="uploadMultipleImages" />
      <input v-model="searchQuery" placeholder="Search for a banner image" class="search-input">

      <div class="refresh"
        @click="fetchImages(true)">
        <i class="fa fa-refresh"></i> <span>Refresh</span>
      </div>

      <div v-if="isLoading && !galleryImages.length">
        <Loading />
      </div>

      <div v-else-if="!galleryImages.length">
        <p>No images found.</p>
      </div>
      
      <div v-else class="gallery scrollbar">
        <div v-for="(image, index) in galleryImages" :key="image.url" class="image_container">
          <div v-if="image.isUploading" class="loading-bar">
            <div :style="{ width: image.progress + '%' }"></div>
          </div>  
          <div v-else 
            class="items thumbnail"
            :class="{ selected: selectedImages.some(img => img.docId === image.docId) }"
            >
            <div class="overlay"></div>
            <i v-if="showTick(image.docId)"
              class="fas fa-check tick_icon">
            </i>
            <img v-lazy="image.url"
                alt="Gallery image"
                @click="handleImageSelection(image, index, $event)">
                <div class="item_footer">
                <span class="image_title">{{ image.name }}</span>
              </div>
              
          </div>
        </div>
      </div>
    
      <button @click="setAsGalleryImages">Save to gallery</button>

    </div>

  <div class="sidebar">
    <h3 v-if="!editContentState.visible">Select an Image to edit</h3>
    <EditImageData v-if="editContentState.visible"
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
</template>
  
<script setup>
import { ref, computed, watch, watchEffect, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia'

import Loading from '../../layout/Loading.vue';
import { useImageStore } from '../../../store/images';
import EditImageData from '../fields/EditImageData.vue'

  const props = defineProps({
    modelValue: {
      type: Object,
      default: () => ({}) 
    },
    imageFilter: { type: String, default: null }, // null = show all non-banner
    maxImages: { type: Number, default: 6 }
  });
  
  
  const emit = defineEmits(['update:modelValue', 'saveGalleryImages',
  'update:visible', 'selected', 'update:imageData']);
  
  const model = defineModel()
  const route = useRoute();

  const fileInput = ref(null);

  const imageStore = useImageStore();
  const { fetchImages, uploadMultipleImages, handleImageUpdate, handleImageDelete, selectImages, } = imageStore;

  const images = computed(() => imageStore.images);
  const filteredImages = computed(() => imageStore.filteredImages);
  const { selectedImages } = storeToRefs(imageStore)

  onMounted(() => {
  if (Array.isArray(props.modelValue) && props.modelValue.length) {
    return
  }
  selectedImages.value = []
})

  const showTick = (docId) => {
    return (
      editContentState.value.visible &&
      editContentState.value.value?.docId === docId
    );
};

  const isLoading = computed(() => imageStore.isLoading);

  const searchQuery = computed({
    get: () => imageStore.searchQuery,
    set: (val) => imageStore.searchQuery = val,
  });
  

const galleryImages = computed(() => {
  if (!filteredImages.value || !Array.isArray(filteredImages.value)) return [];

  if (props.imageFilter) {
    return filteredImages.value.filter(image =>
      image?.public_id?.toLowerCase().includes(props.imageFilter.toLowerCase()) &&
      image?.name?.toLowerCase().includes(props.imageFilter.toLowerCase())
    )
  }

  // default: exclude banners
  return filteredImages.value.filter(image =>
    !image?.public_id?.toLowerCase().includes('_banner') &&
    !image?.name?.toLowerCase().includes('_banner')
  )
})

// SAVE GALLERY IMAGES
    const setAsGalleryImages = () => {
    if (!selectedImages.value.length) {
        console.warn('No images selected');
        return;
    }

    const docIds = selectedImages.value.map(img => img.docId);
    emit('update:modelValue', docIds);
    emit('saveGalleryImages', docIds);
    };

// EDIT IMAGE DATA MODAL
const handleImageSelection = (image, index, event) => {
  const isCtrl = event?.ctrlKey || event?.metaKey
  const fullImage = images.value.find(i => i.docId === image.docId) || image
  const existingIndex = selectedImages.value.findIndex(img => img.docId === image.docId)

  // --- CTRL CLICK → MULTI-SELECT MODE ---
if (isCtrl) {
    if (existingIndex === -1) {
      if (selectedImages.value.length < 6) {
        selectedImages.value.push(fullImage);
      } else {
        alert("Maximum 6 images allowed.");
      }
    } else {
      selectedImages.value.splice(existingIndex, 1);
    }
    return;
  }

  // --- NORMAL CLICK (NO CTRL) ---
  if (existingIndex === -1) {
      selectedImages.value = [fullImage]
    }

  // already selected → open edit modal
  openEditModal(fullImage, index)
}

  const editContentState = ref({
          visible: false,
          value: {},
          field: '',
          inputType: '',
          index: -1,
          activeIndex: null
      });

  const openEditModal = (image, index) => {
    const fullImage = images.value.find(i => i.docId === image.docId) || image

    editContentState.value = {
        visible: true,
        value: fullImage,  
        field: 'image', 
        inputType: 'meta',
        activeIndex: index
      };
  };    
    

    watchEffect(() => {
    if (Array.isArray(props.modelValue) && props.modelValue.length) {
        const matches = props.modelValue
        .map(docId => images.value.find(img => img.docId === docId))
        .filter(Boolean); // remove nulls

        selectImages(matches);

        // Optionally open the first one for editing
        if (matches.length === 1) {
        openEditModal(matches[0], images.value.indexOf(matches[0]));
        }
    }
    });

  </script>
