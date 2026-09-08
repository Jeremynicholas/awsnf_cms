<!-- PostSlug.vue -->
<template>
  <div>
    <div class="slug_page" >
      <section class="col_left">
        <div class="pagination">
          <button v-if="previousSlug" @click="goToSlug(previousSlug)">← Previous</button>
          <button v-if="nextSlug" @click="goToSlug(nextSlug)">Next →</button>
        </div>

        <div class="row"> 
          <TripContent
            v-if="!isLoading && type === 'trips' && postData"
            :postData="postData"
            @edit-request="openEditModal"
            @field-update="handleFieldUpdate"
          />
          <AccommodationContent
            v-if="!isLoading && type === 'accommodation' && postData"
            :postData="postData"
            @edit-request="openEditModal"
          />
          <BlogContent
            v-if="!isLoading && type === 'blogs' && postData"
            :postData="postData"
            @edit-request="openEditModal"
          />

          <div v-if="!isLoading && !postData" class="no-data">
            <p>Sorry, this post could not be found.</p>
          </div>
        </div>  
        
        <EditFieldsModal
          v-model="editableFieldValue"
          :visible="modalVisible"
          :field="modalField"
          :title="modalTitle"
          :inputType="modalInputType"
          :index="editableIndex"
          :imageData="modalImageData"
          :imageFilter="modalImageFilter"
          @update:visible="modalVisible = $event"
          @update:modelValue="editableFieldValue = $event"
          @delete="handleDelete"
          @save="handleSave"
        />

      </section>

      <!-- SIDEBAR-->
      <section class="col_right" :class="{ active: isMenuOpen }">
        <div class="sidebar_toggle show-at-mob-large" @click="toggleMobileMenu" :class="{ active: isMenuOpen }">
          <i class="fas fa-chevron-left"></i>
        </div>
        <PostSidebar
          :postData="postData"
          @edit-request="openEditModal"
          @save="handleSave"
        />
      </section>

    </div>
  </div>

  </template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import { usePostsStore } from '../store/posts'
import { normalizeText } from '../utils/normalizeText';

import TripContent from '../components/posts/types/TripContent.vue'
import AccommodationContent from '../components/posts/types/AccommodationContent.vue'
import BlogContent from '../components/posts/types/BlogContent.vue'
import PostSidebar from '../components/posts/types/details/PostSidebar.vue'
import EditFieldsModal from '../components/modals/EditFieldsModal.vue'

const route = useRoute()
const router = useRouter()
const isLoading = ref(true)

const postsStore = usePostsStore()

const slug = computed(() => route.params.vueSlug)
const type = computed(() => route.params.type || 'trips')

onMounted(async () => {
  await postsStore.fetchPosts(type.value)
  await postsStore.fetchItinerary(postData.value.id);
  console.log('Slug:', slug.value)
  isLoading.value = false
})

const postData = computed(() => postsStore.getPostBySlug(type.value, slug.value))

const previousSlug = computed(() => postsStore.getPreviousSlug(type.value, slug.value))
const nextSlug = computed(() => postsStore.getNextSlug(type.value, slug.value))

function goToSlug(vueSlug) {
  router.push({ name: route.name, params: { vueSlug } })
}


// EDIT FIELDS
const modalVisible = ref(false)
const modalField = ref('')
const modalTitle = ref('')
const modalInputType = ref('text')
const modalImageData = ref(null)
const editableFieldValue = ref('')
const editableIndex = ref(null)
const modalImageFilter = ref(null)

function openEditModal({ field, title, inputType, value, imageFilter, index }) {
  console.log('Opening modal')
  modalField.value = field
  modalTitle.value = title
  modalInputType.value = inputType
  editableFieldValue.value = value
  editableIndex.value = index
  modalImageFilter.value = imageFilter

  if (field === 'blogDetails' && index >= 0) {
    const blogId = postData.value.id
    const block = postsStore.blogs[blogId]?.[index]
    modalImageData.value = block?.blogImageData || null
  } else {
    modalImageData.value = null
  }
  
  modalVisible.value = true
}


// HANDLE SAVE
async function handleFieldUpdate({ field, value }) {
  // Reuse existing save pipeline so all your logic stays in one place
  await handleSave({
    field,
    value,
    index: null,
    inputType: 'boolean' // just to pass *something* — your logic ignores this for normal fields
  });
}

async function handleSave({ field, value, index, inputType }) {
  if (!field) {
    console.warn('[handleSave] No field specified, skipping update.')
    return
  }

  let updatedField

  try {
  // SAVE for itineraries (subcollection)
    if (field === 'itinerary') {
      const tripId = postData.value.id;
      if (!tripId) {
        console.error('[handleSave] Missing trip ID for itinerary save.');
        return;
      }

      if (value.id) {
        await postsStore.updateItineraryDay(tripId, value.id, value);
      } else {
        await postsStore.addItineraryDay(tripId, value);
      }
      return;
    }

    if (field === 'blogDetails') {
      const blogId = postData.value.id
      if (!blogId) return console.error('Missing blog ID.')

      const block = postsStore.blogs[blogId]?.[index]
        if (!block && index >= 0) {
          console.warn('No blog block found at index', index)
          return
        }
        
      // Update blog image
      if (inputType === 'blogImage') {
        await postsStore.updateBlogBlock(blogId, block.id, { blogImage: value })
        return
      }

      // Update HTML content
      if (inputType === 'html' && index >= 0) {
        await postsStore.updateBlogBlock(blogId, block.id, { content: value })
        return
      }

      // Add new block
      if (index === -1) {
      await postsStore.addBlogBlock(blogId, { content: value, blogImage: '' })
      return
    }

      await postsStore.fetchBlogs(blogId, true)
    }

  // Handle slug normalization
    if (['slug', 'vueSlug', 'slugPrefix'].includes(field)) {
      const post = postData.value;
       let prefix;
      
       if (field === 'slugPrefix') {
        // User manually chose the prefix
        prefix = value;
      } else {
        // Auto-select based on flags (groupTour wins)
        if (post.groupTour) prefix = 'group-tour';
        else if (post.specialOffer) prefix = 'specials';
        else prefix = 'tailor-made';
      }
      
      const slugPart = field === 'slugPrefix' ? post.vueSlug : normalizeText(value);
      const updatedField = {
        slug: `${prefix}/${slugPart}`,
        vueSlug: slugPart
      };

      post.slug = updatedField.slug;
      post.vueSlug = updatedField.vueSlug;

      await postsStore.updatePost(type.value, post.id, updatedField);

      if (field !== 'slugPrefix') {
        router.push(`/trips/${post.vueSlug}`);
      }
      return;
    }

  // SAVE for standard fields
    const arrayFields = ['departures', 'postGallery', 'postTestimonialGallery', 'testimonials', 'accommodation', 'accommodation', 'regions', 'countries', 'highlightsExtra', 'combineWithData']
    const isArrayField = arrayFields.includes(field)
    const post = postData.value

    // SPECIAL CASE: full array replacement (used by countries)
    if (isArrayField && Array.isArray(value) && (index === null || index === undefined)) {
      updatedField = { [field]: [...value] }
      postData.value[field] = [...value]
    } 
    // Append logic
    else if (isArrayField && index === -1) {
      const existingArray = Array.isArray(post[field]) ? [...post[field]] : []
      const itemToPush = Array.isArray(value) ? value[0] : value
      const updatedArray = [...existingArray, itemToPush]
      updatedField = { [field]: updatedArray }
      postData.value[field] = updatedArray
    } 
    // Replace at specific index
    else if (isArrayField) {
      const existingArray = Array.isArray(post[field]) ? [...post[field]] : []
      const updatedArray = [...existingArray]
      updatedArray[index] = value
      updatedField = { [field]: updatedArray }
      postData.value[field] = updatedArray
    } 
    // Regular field
    else {
      updatedField = { [field]: value }
      postData.value[field] = value

    // handle image hydration in local store
      if (field === 'featureImage2' && value?.id) {
        postData.value.featureImage2Data = value
      }
    }

    await postsStore.updatePost(type.value, post.id, updatedField)
    
  } catch (error) {
    console.error('[handleSave] Error during update:', error)
  }
}



// HANDLE DELETE
async function handleDelete(index) {
  if (index == null || index < 0) {
    console.warn('[handleDelete] Invalid index:', index)
    return
  }

  const fieldName = modalField.value

    try {

  // DELETE for itineraries
    if (fieldName === 'itinerary') {
      const tripId = postData.value.id;
      const tripItinerary = postsStore.itinerary[tripId] || [];
      const itineraryDay = tripItinerary[index];

      if (!tripId || !itineraryDay?.id) {
        console.error('[handleDelete] Missing tripId or itinerary day ID.');
        return;
      }

      await postsStore.deleteItineraryDay(tripId, itineraryDay.id);
        tripItinerary.splice(index, 1);
      return;
    }


// DELETE FOR STANDARD FIELDS
  const post = postData.value
  if (!Array.isArray(post[fieldName])) {
    console.warn(`[handleDelete] Field ${fieldName} is not an array`)
    return
  }

  const updatedArray = post[fieldName].filter((_, i) => i !== index)
  post[fieldName] = updatedArray
  
    await postsStore.updatePost(type.value, post.id, {
      [fieldName]: updatedArray
    })
  } catch (error) {
    console.error('[handleDelete] Error during delete:', error)
  }
}

// TOGGLE SIDEBAR MOBILE
const isMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
  document.body.classList.toggle("nav_open", isMenuOpen.value)
}
</script>

<style>
  .slug_page {
    display: flex;
    justify-content: space-between;
    position: relative;
    overflow: hidden;

    .col_left {
      flex: 1;
      border-right: var(--borders);

      @media(max-width: 1024px) {
        border-right: none;
      }

      .row {
        padding: var(--padding15);

        @media (max-width: 768px) {
          > div {
            margin-bottom: 200px;
          }
        }

        &:not(:last-child) {
          border-bottom: var(--borders);
        }
      }

      h3 {
        margin-block-start: 20px;
        margin-block-end: 10px;
      }

      small {
        display: block;
        margin-block-start: 10px;
        margin-block-end: 5px;

        &.small-margin-top {
          margin-block-start: 20px;
        }
      }
    }

    .col_right {

      .sidebar {
        padding: var(--padding15);
        min-width: 220px;

        @media(max-width: 1024px) {
          min-width: 300px;
        }
      }

      h3 {
        margin-block: 10px;
      }
    }
  }

  
  @media (max-width: 1024px) {
.slug_page {
    .col_right {
      position: fixed;
      right: -330px;
      background: var(--background-light);
      box-shadow: var(--box-shadow);
      height: 100%;
      transition: var(--timingAll);

      &.active {
        right: 0;
      }

      .sidebar {
        position: relative;
        height: calc(100% - 100px);
        overflow-y: scroll;
      }
    }

    .sidebar_toggle {
      position: fixed;
      background: var(--background-light);
      padding: var(--paddingInputs);
      margin-left: -30px;
      border-end-start-radius: var(--pill) ;
      box-shadow: -5px -1px 10px 0 rgba(0, 0, 0, 0.1);
      transition: var(--timingAll);
      cursor: pointer;

      &:hover {
        background: var(--backgroundHoverLight);
      }
    }
  }
}



  .two_columns {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--gap15);

    > div {
      flex: 1;
    }

    @media (max-width: 768px) {
      grid-template-columns: auto;
      gap: 0;
    }
  }

  .three_columns {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--gap15);

    > div {
      flex: 1;
    }

    @media (max-width: 768px) {
      grid-template-columns: auto;
      gap: 0;
    }
  }

  .items_double {
    display: flex;
    gap: var(--gap10);

    > div {
      flex: 1;
    }
  }

  .items_multiple .items:not(:last-child) {
    margin-bottom: var(--gap5);
  }

  .items:not(.status) {
    border: var(--borders);
    padding: var(--padding10);
    border-radius: var(--rounded);
    background-color: var(--background-white-dark);
  }

  .items.status {
    gap: var(--gap15)
  }
  
  .items .departures {
      display: grid;
      grid-template-columns: auto 10px auto 10px 200px 10px auto 10px auto 10px 100px;
      gap: var(--gap15);

      @media (max-width: 1325px) {
      grid-template-columns: 
        minmax(auto, 1fr)

        ;.hyphen {
          display: none;
        }
      }

      
      .departure_items {
        display: grid;

        > div {
          display: flex;
          gap: var(--gap5);
        }
      }

      > div {
        display: flex;
        align-items: baseline;
        gap: var(--gap5);
      }
    }

  .items.accommodation {
    flex-direction: column;

    div:not(:last-child) {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;

      a {
        margin-right: 10px;
      }
    }
  }

  .items {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;

    .blog_images {
      max-width: 300px;
    }

    &.highlights {
      flex-direction: column;

      .thumbnail {
        margin-right: auto;
        width: 150px;    
        border-radius: var(--rounded);
      }
    }

    &.html_content {

      h1, h2, h3, h4, h5, h6 {
      line-height: 1.1;
      margin-top: 0;
      margin-bottom: 1.5rem;
      text-wrap: pretty;
    }

      ul, ol {
        margin-left: 20px!important;
        list-style: inherit;

      }
    }
  }

  .itinerary_days {
    margin-bottom: var(--gap15);
  }
</style>