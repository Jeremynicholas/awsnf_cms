<!-- TripContent.vue -->
 <template>
  <div>
    <PostTitle :postData="postData" @edit-request="forwardEditRequest" />
    <PostDetails :postData="postData"
      @edit-request="forwardEditRequest"
      @field-update="forwardFieldUpdate"
      />
    <PostHtml :postData="postData" @edit-request="forwardEditRequest" />
    <PostGallery :postData="postData" @edit-request="forwardEditRequest" />
    <ItineraryDetails :itineraryCollection="itineraryCollection" @edit-request="forwardEditRequest" />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { usePostsStore } from '../../../store/posts'

import PostTitle from './details/PostTitle.vue'
import PostDetails from './details/PostDetails.vue'
import PostGallery from './details/PostGallery.vue'
import PostHtml from './details/PostHtml.vue'
import ItineraryDetails from './details/ItineraryDetails.vue'

const props = defineProps({
  postData: Object
})

const emit = defineEmits(['edit-request', 'field-update'])

function forwardEditRequest(payload) {
  emit('edit-request', payload)
}

function forwardFieldUpdate(payload) {
  emit('field-update', payload)
}

const itineraryCollection = ref([])

const postsStore = usePostsStore()

watch(() => props.postData?.id, async (newId) => {
  if (newId) {
    await postsStore.fetchItinerary(newId)
    itineraryCollection.value = postsStore.itinerary[newId] || []
  }
}, { immediate: true })

</script>
