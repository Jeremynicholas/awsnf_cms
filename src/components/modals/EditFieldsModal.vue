<!-- EditFieldsModal.vue -->
<template>
  <div>
    <div v-if="visible" class="full_screen">
      <div class="modal-content scrollbar_hidden">
        <span class="close" @click="close">&times;</span>
        <h2>{{ title }}</h2>

        <div v-if="props.field === 'description'" class="seo-indicator" :class="seoStatus.class">
          <span class="seo-dot" />
          <small>{{ seoStatus.label }} · {{ descLength }} / 155 chars</small>
        </div>

        <div v-if="props.field === 'blogDetails' && props.imageData?.url" class="blog_thumbnail">
          <img :src="props.imageData.url" alt="Blog block image" />
        </div>

        <!-- Dynamically render the field component -->
        <component
          :is="fieldComponent"
          v-model="model"
          v-bind="dynamicFieldBindings"
        />

        <div class="footer-buttons">
          <button v-if="inputType != 'postGallery' && inputType != 'featureImage'" @click="handleSave">Save</button>

          <button v-if="props.inputType === 'html' && props.field === 'blogDetails'" @click="openBlogImagePicker">Select Image</button>

          <button class="delete-button" v-if="inputType === 'itineraries'" @click="deleteDay(index)">Delete day</button>

          <button class="delete-button" v-if="inputType === 'departures'" @click="deleteDeparture(index)">Delete departure</button>

          <button class="delete-button" v-if="inputType === 'highlightsExtra' && index !== -1" @click="deleteArrayItem(index)">Delete highlight</button>

          <button class="delete-button" v-if="inputType === 'combineWithData' && index !== -1" @click="deleteArrayItem(index)">Delete combine with</button>
        </div>
      </div>
    </div>

    <EditBlogImageModal
      v-model:visible="imageModal"
      @select="handleBlogImageSelect"
    />
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

import TextField from '../modals/fields/TextField.vue'
import NumberField from '../modals/fields/NumberField.vue'
import DepartureField from './fields/DepartureField.vue'
import PricingPerField from './fields/PricingPerField.vue'
import ItineraryField from './fields/ItineraryField.vue'
import TiptapEditor from '../modals/titptap/TiptapEditor.vue'
import FileField from './fields/FileField.vue'
import FeatureImageField from './fields/FeatureImageField.vue'
import GalleryImageField from './fields/GalleryImageField.vue'
import HighlightsExtra from './fields/HighlightsExtra.vue'
import CombineWithField from './fields/CombineWithField.vue'
import BlogImageField from './fields/BlogImageField.vue'
import EditBlogImageModal from './EditBlogImageModal.vue'

import CountrySelector from './selectors/CountrySelector.vue'
import AccommodationSelector from './selectors/AccommodationSelector.vue'
import RegionSelector from './selectors/RegionSelector.vue'
import HolidayTypeSelector from './selectors/HolidayTypeSelector.vue'
import TestimonialSelector from './selectors/TestimonialSelector.vue'
import GettingThereSelector from './selectors/GettingThereSelector.vue'
import StaffBioSelector from './selectors/StaffBioSelector.vue'

const props = defineProps({
  visible: Boolean,
  title: String,
  inputType: String,
  field: String, 
  index: {
    type: [Number, null],
    default: null,
  },
  isBlog: Boolean,
  imageFilter: { type: String, default: null },
  imageData: {
  type: Object,
  default: () => null,
},
})

const model = defineModel()

const imageModal = ref(false)
const selectedBlogImage = ref(null)


// DYNAMIC MODAL FIELDS
const fieldComponentMap = {
  text: TextField,
  number: NumberField,
  departures: DepartureField,
  pricingPer: PricingPerField,
  itineraries: ItineraryField,
  file: FileField,
  featureImage: FeatureImageField,
  postGallery: GalleryImageField,
  blogImage: BlogImageField,
  highlightsExtra: HighlightsExtra,
  combineWithData: CombineWithField,
  html: TiptapEditor,
  regions: RegionSelector,
  countries: CountrySelector,
  accommodation: AccommodationSelector,
  holidayTypes: HolidayTypeSelector,
  testimonials: TestimonialSelector,
  gettingThere: GettingThereSelector,
  staffBios: StaffBioSelector,
}

const fieldComponent = computed(() => fieldComponentMap[props.inputType] || TextField)

const emit = defineEmits(['update:model', 'update:visible', 'save', 'delete'])

const fieldListeners = computed(() => {
  const listeners = {}
  if (['featureImage', 'blogImage'].includes(props.inputType)) {
    listeners.onSaveFeatureImage = handleFeatureImage
  }
  if (props.inputType === 'postGallery') {
    listeners.onSaveGalleryImages = handleGalleryImage
  }
  return listeners
})

const dynamicFieldBindings = computed(() => {
  const bindings = {
    ...fieldListeners.value,
  }

  if (['featureImage', 'blogImage', 'postGallery'].includes(props.inputType)) {
    bindings.imageFilter = props.imageFilter
  }

  return bindings
})

//SEO DATA
const descLength = computed(() => (model.value?.length ?? 0))

const seoStatus = computed(() => {
  const len = descLength.value
  if (len === 0)   return { class: 'seo-bad',     label: 'Missing' }
  if (len < 120)   return { class: 'seo-warning',  label: 'Too short' }
  if (len <= 155)  return { class: 'seo-good',     label: 'Good' }
  return                  { class: 'seo-warning',  label: 'Too long' }
})


// HANDLE SAVE FROM FEATURE IMAGE
function handleFeatureImage(imageData) {
  model.value = imageData // this updates the bound model
  nextTick(() => {
    handleSave() // ensure DOM/model is updated before saving
  })
}

// HANDLE SAVE FROM POST GALLERY
function handleGalleryImage(imageData) {
  const existing = Array.isArray(model.value) ? model.value : []
  const newImages = Array.isArray(imageData) ? imageData : []
  const merged = [...new Set([...existing, ...newImages])]
  model.value = merged
  nextTick(() => {
    handleSave()
  })
}

// HANDLE BLOG IMAGE
async function handleBlogImageSelect(imageId) {
  emit('save', {
    field: props.field,
    value: imageId,
    index: props.index,
    inputType: 'blogImage',
  })
}


function openBlogImagePicker() {
  selectedBlogImage.value = null
  imageModal.value = true
}

// EMIT SAVE
function handleSave() {
  console.log('⬆️ Emitting save for field:', props.field, model.value)

  emit('save', {
    field: props.field,
    value: model.value,
    index: props.index ?? null,
    inputType: props.inputType,
  })
  emit('update:visible', false)
}

// EMIT DELETE
function deleteDay(index) {
  emit('delete', index)
  close()
}

// EMIT DELETE
function deleteDeparture(index) {
  emit('delete', index)
  close()
}

function deleteArrayItem(index) {
  emit('delete', index)
  close()
}

function close() {
  emit('update:visible', false)
}

</script>

<style scoped>
.gallery {
  height: 100%;

  @media (max-width: 768px) {
    height: calc(80vh - 345px);
    padding-block-end: 30px;
  }

  @media (max-width: 425px) {
    height: 100%;
    padding-block-end: 30px;
  }
}
  
.blog_thumbnail {
  display: flex;
  margin-bottom: var(--gap15);
  border-radius: var(--rounded);
  overflow: hidden;
  max-width: 150px;
}



</style>