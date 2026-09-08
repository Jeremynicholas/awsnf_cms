<template>
    <div class="sidebar" v-if="postData">
      <div>
      <h3>Status</h3>
      <div class="items status ">
        <span class="status_button clickable" :class="{ 'published': postData.published, 'draft': !postData.published }"
        @click="emitFieldUpdate('published')">
        {{ postData.published ? 'Published' : 'Draft' }} 
      </span>
        <a class="icons" :href="previewUrl" target="_blank">
          <i class="fas fa-eye"></i>
        </a>
      </div>

      <div class="flex">
        <h3 style="margin-right: auto;">Recommended</h3>
        <span class="clickable sidebar_icons"
          @click="emitFieldUpdate('recommended')">
          <HeartFull v-if="postData.recommended" />
          <Heart v-else />
        </span>
      </div>

      <div class="flex">
        <h3 style="margin-right: auto;">Price Rating</h3>
        <span
          class="clickable sidebar_icons"
          v-for="n in 3" :key="n"
          @click="emitFieldUpdate('priceRating', n)">
          <DollarFull v-if="postData.priceRating >= n" />
          <Dollar v-else />
        </span>
      </div>

      <div v-if="route.params.type == 'trips'">
        <h3>Group Tour</h3>
        <div class="items status">
          <select v-model="postData.groupTour" @change="emitFieldUpdate('groupTour')">
            <option :value="true">Yes</option>
            <option :value="false">No</option>
          </select>
        </div>
      </div>

      <div v-if="route.params.type == 'trips'">
        <h3>Is Special</h3>
        <div class="items status">
          <select v-model="postData.specialOffer" @change="emitFieldUpdate('specialOffer')">
            <option :value="true">Yes</option>
            <option :value="false">No</option>
          </select>
        </div>
      </div>

      <div v-if="route.params.type == 'blogs'">
        <h3>Author</h3>
        <div class="items">
          <p>{{ StaffBioName }}</p>
          <div class="icons"
            @click="emitEditRequest({
              title: 'Edit author',
              inputType: 'staffBios',
              field: 'staffBios',
              value: postData.staffBios,
              index: null
              })">
            <i class="fas fa-edit"></i>
          </div>
        </div>
      </div>

      <div v-if="route.params.type == 'blogs'" class="flex space_between">
        <h3>Read Time</h3>
        <span class="items status">
         {{postData.readTime}} minutes
        </span>
      </div>


      <h3>Feature Image</h3>
      <div class="items thumbnail" 
      :style="{ backgroundImage: featureImageData?.url ? `url(${featureImageData?.url})` : 'none'}">
        <div class="icons feature_image"
          @click="emitEditRequest({
              title: 'Edit or select a feature image',
              inputType: 'featureImage',
              field: 'featureImage',
              value: postData.featureImage,
              imageFilter: '_banner',
              index,
            })">
            <i class="fas fa-edit"></i>
        </div>
      </div>

            
      <h3>Region</h3>
        <div class="items">
          <p>{{ regionNames.join(', ') || 'No region listed' }}</p>
          <div class="icons"
            @click="emitEditRequest({
              title: 'Edit regions',
              inputType: 'regions',
              field: 'regions',
              value: postData.regions,
              index,
            })">
            <i class="fas fa-edit"></i>
          </div>
        </div>
            
      <h3>Countries</h3>
        <div class="items">
          <p>{{ countryNames.join(', ') || 'No country listed' }}</p>
          <div class="icons" 
             @click="emitEditRequest({
              title: 'Edit countries',
              inputType: 'countries',
              field: 'countries',
              value: postData.countries,
              index,
            })">
            <i class="fas fa-edit"></i>
          </div>
        </div>

        <h3>Holiday Type</h3>
        <div class="items">
          <p>{{ holidayTypeNames?.join(', ') || 'No holiday types listed' }}</p>
          <div class="icons"
           @click="emitEditRequest({
            title: 'Edit holiday types',
            inputType: 'holidayTypes',
            field: 'holidayTypes',
            value: postData.holidayTypes,
            index,
          })">
            <i class="fas fa-edit"></i>
          </div>
        </div>

        <div v-if="route.params.type !== 'accommodation'">
          <h3>Accomodation</h3>
          <div class="items accommodation">
            <div v-for="accom in accommodationItems" :key="accom.id">
              <p>{{ accom.name || 'No accommodation linked' }}</p>
              <RouterLink :to="`/accommodation/${accom.vueSlug}`"><i class="fas fa-eye"></i></RouterLink>
            </div>
            <div class="icons"
                @click="emitEditRequest({
                  title: 'Edit accommodation',
                  inputType: 'accommodation',
                  field: 'accommodation',
                  value: postData.accommodationItems,
                  index,
                })">
              <i class="fas fa-edit"></i>
            </div>
          </div>
        </div>

    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { ref, computed, onMounted, watch } from 'vue';
import Heart from '../../../icons/Heart.vue';
import HeartFull from '../../../icons/HeartFull.vue';
import Dollar from '../../../icons/Dollar.vue';
import DollarFull from '../../../icons/DollarFull.vue';
import { useLookupStore } from '../../../../store/lookups';
import { normalizeText } from '../../../../utils/normalizeText';

const props = defineProps({
  postData: Object
})

const emit = defineEmits(['edit-request', 'save']);

// FOR MODALS
function emitEditRequest({ field, value, inputType, title, imageFilter = null, index = null }) {
  emit('edit-request', { field, value, inputType, title, imageFilter, index });
}

// NO MODALS SO LETTING SLUG PAGE HANDLE SAVING
const emitFieldUpdate = (fieldName, value) => {
  let newValue = value ?? props.postData[fieldName];

  if (fieldName === 'published' || fieldName === 'recommended') {
    newValue = !props.postData[fieldName];
  }

  if (fieldName === 'priceRating' && props.postData[fieldName] === value) {
      newValue = 0;
  }

  emit('save', { field: fieldName, value: newValue });

  //  UPDATE SLUG UPDATE FOR GROUP TOUR
  if (fieldName === 'groupTour' || fieldName === 'specialOffer') {

    const future = {
      groupTour: fieldName === 'groupTour' ? newValue : props.postData.groupTour,
      specialOffer: fieldName === 'specialOffer' ? newValue : props.postData.specialOffer,
    }

    let prefix;

    if (future.groupTour) prefix = 'group-tour'
    else if (future.specialOffer) prefix = 'specials'
    else prefix = 'tailor-made'

    emit('save', { field: 'slugPrefix', value: prefix })
  }
};


// LOOKUPS
const lookupStore = useLookupStore()

const featureImageData = computed(() => {
  if (!props.postData?.featureImage) return null;
  
  const image = lookupStore.lookupMaps.images[props.postData.featureImage];
  if (!image) console.log('🛑 Image not found in lookupStore for ID:', props.postData.featureImage);
  return image || null;
});

const accommodationItems = computed(() => {
  if (!props.postData?.accommodation?.length) return []
  return props.postData.accommodation
    .map(id => lookupStore.lookupMaps.accommodation[id])
    .filter(item => !!item)
})

const regionNames = computed(() => {
  if (!props.postData?.regions?.length) return []
  return props.postData.regions
    .map(id => lookupStore.lookupMaps.regions[id]?.name || 'Unknown')
})

const countryNames = computed(() => {
  if (!props.postData?.countries?.length) return []
  return props.postData.countries
    .map(id => lookupStore.lookupMaps.countries[id]?.name || 'Unknown')
})

const holidayTypeNames = computed(() => {
  if (!props.postData?.holidayTypes?.length) return []
  return props.postData.holidayTypes
    .map(id => lookupStore.lookupMaps.holidayTypes[id]?.name || 'Unknown')
})

const StaffBioName = computed(() => {
  const id = props.postData?.staffBios
  if (!id) return ''
  return lookupStore.lookupMaps.staffBios?.[id]?.name || 'Unknown'
})

const route = useRoute()

const type = route.params.type
const vueSlug = route.params.vueSlug || ''
const isPreview = computed(() => (props.postData && !props.postData.published ? '?preview=true' : ''))

const previewUrl = computed(() => {
  const base = 'https://awsnfs-nuxt.web.app/au/'
  const pathPrefix = type === 'trips' ? '' : `${type}/`
  const slug = props.postData ? props.postData.slug : vueSlug
  return `${base}${pathPrefix}${slug}${isPreview.value}`
})





</script>