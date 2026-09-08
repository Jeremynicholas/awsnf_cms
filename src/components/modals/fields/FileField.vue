<template>
  <div class="media_container">
    <div class="gallery_container scrollbar">

      <input type="file" accept="application/pdf" @change="onUpload" />

      <div v-if="isUploading" class="loading-bar">
        <div :style="{ width: uploadProgress + '%' }"></div>
      </div>

      <input v-model="searchQuery" placeholder="Search PDFs" class="search-input" />

      <div class="refresh" @click="refresh">
        <i class="fa fa-refresh"></i> <span>Refresh</span>
      </div>

      <div v-if="isLoading">Loading…</div>

      <div v-else class="gallery files scrollbar">
        <div
           v-for="b in brochures"
          :key="b.id"
          class="items files"
          :class="{ selected: b.file?.storagePath === model?.storagePath }"
          @click="model = b.file"
        >
         <img src="/file-icon-pdf.png" />
          <div class="item_footer">
            <span class="image_title">{{ b.title}}</span>
            <small v-if="b.file?.bytes">{{ Math.round(b.file.bytes / 1024) }} KB</small>
            <button v-if="b.file?.url" type="button" class="buttons" @click.stop="openPreview(b.file.url)">Preview</button>
          </div>
        </div>
      </div>

      <div v-if="model?.url" class="selected_row">
        <strong>Selected:</strong> {{ model.filename }}
      </div>

    </div>
  </div>

  <PdfPreviewModal 
    v-model:visible="previewOpen"
    :url="previewUrl"
    :title="'Preview PDF'"
  />

</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFileStore } from '../../../store/files'
import { useBrochureStore } from '../../../store/brochures'
import PdfPreviewModal from '../PdfPreviewModal.vue'

const model = defineModel()
const fileStore = useFileStore()
const brochureStore = useBrochureStore()

const isLoading = computed(() => brochureStore.isLoading)
const brochures = computed(() => brochureStore.filteredBrochures)

const searchQuery = computed({
  get: () => brochureStore.searchQuery,
  set: (v) => (brochureStore.searchQuery = v),
})

const isUploading = computed(() => fileStore.isUploading)
const uploadProgress = computed(() => fileStore.uploadProgress)

const previewOpen = ref(false)
const previewUrl = computed(() => model.value?.url || '')

function openPreview(url) {
  model.value = model.value || { url }
  previewOpen.value = true
}

async function refresh() {
  await brochureStore.fetchBrochures(true)
}


const onUpload = async (e) => {
  const f = e.target.files?.[0]
  if (!f) return

  const uploaded = await fileStore.uploadPdf(f)
  if (!uploaded) return

  model.value = uploaded
  e.target.value = ''
}

onMounted(() => brochureStore.fetchBrochures(false))

</script>