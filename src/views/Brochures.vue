<!-- Brochures.vue -->
<template>
    <Sections>
     <h1>Add a new Brochure</h1>
        <div class="grid_inputs">

            <div class="flex create_new_inputs">
              <input v-model="brochureTitle" placeholder="Title" />
                <div >
                  <button type="button" style="width: max-content;" @click="selectFile">Select file</button>
                  <div v-if="brochureFile" class="selected_file">
                    <strong>{{ brochureTitle || brochureFile.filename  }}</strong>
                    <a :href="brochureFile.url" target="_blank">Open</a>
                  </div>
                </div>

                <div>
                  <button type="button" style="width: max-content;" @click="selectCoverImage">Select cover image</button>
                  <div v-if="coverImage" class="selected_file">
                    <strong>{{ coverImage  }}</strong>
                  </div>
                </div>

                <div>
                <input ref="fileInput" type="file" accept="application/pdf" style="display:none" @change="onUpload" />
                
              </div>
            </div>

            <button class="solid" @click="createBrochure">Create Brochure</button>
        </div>

        <EditFieldsModal
            v-model="editableFieldValue"
            :visible="modalVisible"
            :field="modalField"
            :title="modalTitle"
            :inputType="modalInputType"
            :imageFilter="modalImageFilter"
            @update:visible="modalVisible = $event"
            @save="handleSave"
        />
    </Sections>
    
    <Sections>
      <h2>All Brochures</h2>
    
      <div class="gallery files scrollbar">
        <div v-if="!isLoading"
          v-for="b in brochures"
          :key="b.id"
          class="items files"
        >
        <img :src="getBrochureCoverImage(b.coverImage)?.url || '/file-icon-pdf.png'">
          <div class="item_footer" >
            <span class="image_title">{{ b.title }}</span>
            <small v-if="b.file?.bytes">{{ Math.round(b.file.bytes / 1024) }} KB</small>
            <a v-if="b.file?.url" :href="b.file.url" target="_blank">Preview</a>
            <button v-if="b.file?.url" type="button" class="buttons" @click.stop="openPreview(b.file.url)">Preview</button>

            <button type="button" class="solid" @click="fileInput.click()">
                Upload PDF
                </button>
                
              <div class="flex">
                <button type="button" class="edit" @click.stop="editBrochureTitle(b)">
                  <i class="fas fa-pen"></i>
                </button>

                <button type="button" class="edit" @click.stop="editBrochurePdf(b)">
                    <i class="fas fa-book"></i>
                </button>

                <button type="button" class="edit" @click.stop="editBrochureCover(b)">
                  <i class="fas fa-camera"></i>
                </button>
              </div>
          </div>
        </div>
      </div>

    </Sections>

      <PdfPreviewModal 
        v-model:visible="previewOpen"
        :url="previewUrl"
        :title="'Preview PDF'"
      />

  </template>
  
<script setup>
import { ref, computed, onMounted } from 'vue'
import { firestore } from '../firebase/firebase'
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { useBrochureStore } from '../store/brochures'
import { useLookupStore } from '../store/lookups';
import Sections from '../components/layout/Sections.vue'
import EditFieldsModal from '../components/modals/EditFieldsModal.vue'
import PdfPreviewModal from '../components/modals/PdfPreviewModal.vue'

const brochureTitle = ref('')
const brochureFile = ref(null) 
const coverImage = ref(null) 
const fileInput = ref(null)

const modalVisible = ref(false)
const modalField = ref('')
const modalTitle = ref('')
const modalInputType = ref('text')
const editableFieldValue = ref(null)

const editingBrochureId = ref(null)

const brochureStore = useBrochureStore()
const brochures = computed(() => brochureStore.filteredBrochures)
const isLoading = computed(() => brochureStore.isLoading)

const modalImageFilter = ref('_banner')

const previewOpen = ref(false)
const previewFileUrl = ref('')
const previewUrl = computed(() => previewFileUrl.value)



// LOOKUPS
const lookupStore = useLookupStore()

function getBrochureCoverImage(coverImageId) {
  if (!coverImageId) return null

  const image = lookupStore.lookupMaps.images?.[coverImageId]

  if (!image) {
    console.log('🛑 Image not found in lookupStore for ID:', coverImageId)
  }

  return image || null
}

onMounted(() => brochureStore.fetchBrochures(false))

function selectFile() {
  modalField.value = 'brochureFile'
  modalTitle.value = brochureTitle.value
    ? `Select or upload PDF for: ${brochureTitle.value}`
    : 'Select or upload brochure PDF'
  modalInputType.value = 'file'
  editableFieldValue.value = brochureFile.value
  modalVisible.value = true
}


function selectCoverImage() {
  modalField.value = 'coverImage'
  modalTitle.value = 'Select cover image'
  modalInputType.value = 'featureImage'
  editableFieldValue.value = coverImage.value
  modalImageFilter.value = '_cover'  // only _cover images
  modalVisible.value = true
}

async function handleSave({ field, value }) {
  if (editingBrochureId.value) {
    await updateBrochureField(editingBrochureId.value, field, value)
    modalVisible.value = false
    editingBrochureId.value = null
    await brochureStore.fetchBrochures(true)
    return
  }

  // create-mode state
  if (field === 'brochureFile' || field === 'file') brochureFile.value = value
  if (field === 'coverImage') coverImage.value = value?.docId || value || ''
  if (field === 'title') brochureTitle.value = value

  modalVisible.value = false
}

const createBrochure = async () => {
  if (!brochureTitle.value.trim()) return alert('Please enter a title.')
  if (!brochureFile.value?.url) return alert('Please select a PDF file.')

  const data = {
    title: brochureTitle.value.trim(),

    // Store the selected file metadata:
    file: {
      url: brochureFile.value.url,
      filename: brochureFile.value.filename,
      storagePath: brochureFile.value.storagePath,
      format: brochureFile.value.format || 'pdf',
      resource_type: brochureFile.value.resource_type || 'raw',
      bytes: brochureFile.value.bytes || null,
    },

    coverImage: coverImage.value?.docId || coverImage.value || '',

    published: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  await addDoc(collection(firestore, 'brochures'), data)

  brochureTitle.value = ''
  brochureFile.value = null
  coverImage.value = null
  
  await brochureStore.fetchBrochures(true)
}

async function updateBrochureField(brochureId, field, value) {
  const brochureRef = doc(firestore, 'brochures', brochureId)

  const payload = {
    updatedAt: serverTimestamp(),
  }

  if (field === 'title') {
    payload.title = value?.trim?.() || ''
  }

  if (field === 'file') {
    payload.file = value
      ? {
          url: value.url || '',
          filename: value.filename || '',
          storagePath: value.storagePath || '',
          format: value.format || 'pdf',
          resource_type: value.resource_type || 'raw',
          bytes: value.bytes || null,
        }
      : null
  }

if (field === 'coverImage') {
  payload.coverImage = value?.docId || value || ''
}

  await updateDoc(brochureRef, payload)
}

// EDIT MODAL
function editBrochureTitle(brochure) {
  editingBrochureId.value = brochure.id
  modalField.value = 'title'
  modalTitle.value = `Edit title: ${brochure.title}`
  modalInputType.value = 'text'
  editableFieldValue.value = brochure.title || ''
  modalVisible.value = true
}

function editBrochurePdf(brochure) {
  editingBrochureId.value = brochure.id
  modalField.value = 'file'
  modalTitle.value = `Edit PDF: ${brochure.title}`
  modalInputType.value = 'file'
  editableFieldValue.value = brochure.file || null
  modalVisible.value = true
}

function editBrochureCover(brochure) {
  editingBrochureId.value = brochure.id
  modalField.value = 'coverImage'
  modalTitle.value = `Edit cover image: ${brochure.title}`
  modalInputType.value = 'featureImage'
  editableFieldValue.value = brochure.coverImage || null
  modalImageFilter.value = '_cover'
  modalVisible.value = true
}

function openPreview(url, title = 'Preview PDF') {
  previewFileUrl.value = url
  previewOpen.value = true
}

</script>