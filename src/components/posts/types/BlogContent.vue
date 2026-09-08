<template>
  <div>
    <!-- Post Overview -->
    <PostDetails
      :postData="postData"
      @edit-request="forwardEditRequest" />
    
     <BlogDetails
      :postData="postData"
      :blogCollection="postsStore.blogs[postData.id] || []"
      @edit-request="forwardEditRequest"
      />
    
</div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { usePostsStore } from '../../../store/posts'

import BlogDetails from './details/BlogDetails.vue'
import PostDetails from './details/PostTitle.vue'

const props = defineProps({
  postData: Object
})

const emit = defineEmits(['edit-request'])

function forwardEditRequest(payload) {
  emit('edit-request', payload)
}

const postsStore = usePostsStore()

watch(
  () => props.postData?.id,
  async (newId, oldId) => {
    if (newId && newId !== oldId) {
      await postsStore.fetchBlogs(newId, true)
    }
  },
  { immediate: true }
)

</script>
