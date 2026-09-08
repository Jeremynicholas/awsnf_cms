<!-- FeatureImageField.vue -->
<template>
  <div class="modal_media_container">
    <div class="gallery_container scrollbar">
      <div class="gallery_upload">
        <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="uploadSingleImage" />
        <button type="button" class="solid" @click="fileInput.click()">
          Upload Feature Image
        </button>
        <div>
          <input v-model="searchQuery" placeholder="Search for a banner image" class="search-input">

          <div class="refresh"
              @click="fetchImages(true)">
              <i class="fa fa-refresh"></i>
          </div>
        </div>
      </div>

      <div v-if="isLoading && !bannerImages.length">
        <Loading />
      </div>

      <div v-else-if="!bannerImages.length">
        <p>No images found.</p>
      </div>
      
      <div v-else class="gallery scrollbar">
        <div v-for="(image, index) in bannerImages" :key="image.url" class="image_container">
          <div v-if="image.isUploading" class="loading-bar">
            <div :style="{ width: image.progress + '%' }"></div>
          </div>  
          <div v-else 
            class="items thumbnail clickable" :class="{ selected: image.docId === selectedImage?.docId || image.docId === model?.docId }">
            <div class="overlay"></div>
            <img v-lazy="image.url"
                alt="Gallery image"
                @click="handleImageClick(image, index)">
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

      <button class="solid" @click="setAsFeatureImage(selectedImage)">Set as feature image</button>

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
</template>
  
  <script setup>
  import { ref, computed, watch, watchEffect, onMounted } from 'vue';

  import Loading from '../../layout/Loading.vue';
  import { useImageStore } from '../../../store/images';
  import EditImageData from '../fields/EditImageData.vue'

  const props = defineProps({
    modelValue: { type: Object, default: () => ({}) },
    imageFilter: { type: String, default: '_banner' }
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
  

const bannerImages = computed(() => {
  if (!filteredImages.value || !Array.isArray(filteredImages.value)) return []

  if (!props.imageFilter) return filteredImages.value  // no filter = show all

  return filteredImages.value.filter(image =>
    image?.public_id?.toLowerCase().includes(props.imageFilter.toLowerCase()) ||
    image?.name?.toLowerCase().includes(props.imageFilter.toLowerCase())
  )
})


// SAVE AS FEATURE IMAGE
  const setAsFeatureImage = (image) => {
    if (!image || !image.docId) {
      console.warn('No image selected');
      return;
    }

    emit('update:modelValue', image);
    emit('saveFeatureImage', image.docId);
  };

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
