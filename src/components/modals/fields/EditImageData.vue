<!-- EditImageData.vue -->
<template>
    <div v-if="visible">
      <div class="image_modal">
        <h3>Edit Image Metadata</h3>
    
        <div class="image_content">
          <div class="container">
            <div>
              <div class="edit_image_modal">
                <img :src="localModel.url" class="image-preview" alt="Preview"/>
              </div>
              <div class="file_info">
                <span>{{ localModel.title }}</span>
                <span>Size: {{ localModel.size ? (localModel.size / 1024).toFixed(2) + ' KB' : 'Unknown' }}</span>
                <span>Created: {{ localModel.created_at ? new Date(localModel.created_at).toLocaleDateString() : 'Unknown' }}</span>
              </div>
            </div>

            <div class="meta_data grid_inputs">
              <label for="title">Name: {{ localModel.name }}</label>
              <input id="title" type="text" v-model="localModel.name" placeholder="Enter name">
              <label for="alt">Alt Text:</label>
              <input id="alt" type="text" v-model="localModel.alt" placeholder="Enter alt text">
              <label for="location">Location (Country or State):</label>            
              <input id="location" type="text" v-model="localModel.location" placeholder="Enter location">
            </div>
          </div>

          <div class="image_content_footer">
            <button class="solid" @click="onUpdate">Save</button>
            <button @click="openDeleteModal">Delete</button>
          </div>

          <div v-if="showConfirmDelete" class="modal image_delete_toggle">
            <p>Are you sure you want to delete this?</p>
            <button @click="onCancelDelete">No</button>
            <button @click="onDelete">Yes, Delete</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue';

    const props = defineProps({
      modelValue: Object,
      visible: Boolean
    });
  
    const emit = defineEmits(['update:visible', 'update:imageData', 'delete:image']);
    
  const localModel = ref({});

  // UPDATE IMAGE
  const onUpdate = () => {
    const updatedData = {
        public_id: localModel.value.public_id,
        alt: localModel.value.alt || '',
        caption: localModel.value.name || '', // or use localModel.value.title
        location: localModel.value.location || ''
    };
      console.log("Emitting update with:", updatedData); // Log to confirm data
      emit('update:imageData', updatedData);
  };

  //DELETE IMAGE
  const showConfirmDelete = ref(false);
  const openDeleteModal = () => {
      showConfirmDelete.value = true; // Show the confirmation dialog
  };

  const onCancelDelete = () => {
      showConfirmDelete.value = false; // Hide the confirmation dialog
  };

  const onDelete = () => {
      console.log("Deleting:", localModel.value.public_id);
      emit('delete:image', localModel.value.public_id);
      showConfirmDelete.value = false;
  };

    
watch(
  () => props.modelValue,
  (newVal) => {
    localModel.value = {
      ...newVal,
      location: newVal.location || '',  // ensure top-level location is set
      alt: newVal.alt || '',
      name: newVal.name || '',
      context: {
        ...(newVal?.context || {}),
        custom: {
          alt: newVal.context?.custom?.alt || '',
          caption: newVal.context?.custom?.caption || '',
          location: newVal.context?.custom?.location || '',
        }
      }
    };
  },
  { immediate: true, deep: true }
);



  </script>
  
  <style scoped>
  .image_modal {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--gap5);
    padding: var(--padding15);
    border: var(--borders);
    border-color: var(--borderColor);
    border-radius: var(--rounded);

    @media (max-width: 485px) {
      padding: var(--gap10);
    }

    h3 {
      margin: 0!important;
    }

    .image_content {
      display: flex;
      flex-direction: column;
      gap: var(--gap15);

      @media (max-width: 768px) {
        flex-direction: row;
      }
      
      @media (max-width: 585px) {
        flex-direction: column;
        gap: var(--gap5);
      }

      .container {
        @media (max-width: 768px) {
          display: flex;
          gap: var(--gap15);
          flex: 1;
        }

         @media (max-width: 425px) {
          flex-direction: column;
        }
      }

      .image_content_footer {
        display: flex;
        justify-content: space-between;
        gap: var(--gap15);

        @media (max-width: 768px) {
          flex-direction: column-reverse;
          justify-content: flex-start;
          align-items: flex-start;
        }

        @media (max-width: 585px) {
          flex-direction: row;
          justify-content: space-between;
        }
      }
  }
      

  }

 .edit_image_modal {
    position: relative;
    aspect-ratio: 2/1;
    overflow: hidden;
  
    @media (max-width: 768px) {
        height: 100%;
        width: 120px;
      }

    @media (max-width: 525px) {
        width: 100px;
      }

    @media (max-width: 425px) {
        display: none;
      }

    img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      
    }
  }

  .close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
  }
  
  .close:hover,
  .close:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
  }

  .file_info {
    display: grid;
    font-size: var(--fontSizeTiny);

    @media (max-width: 1024px) {
        display: none;
      }
  }
  .meta_data {
    margin-block: var(--gap15);
    width: 100%;

    .title {
      font: var(--fontBody);
    }

  } 

  @media (max-width: 768px) {
    .meta_data {
      margin-block: 0;
    }
      label {
        display: none;
      }
    }

  @media (max-width: 300px) {
    .meta_data input {
      width: calc(100vw - 102px);
    }
  }
    
  </style>
  