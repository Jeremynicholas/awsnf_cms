<template>
  <div>
    <!-- Post Overview -->
    <PostDetails :postData="postData" @edit-request="forwardEditRequest" />
</div>
</template>

<script setup>
import PostDetails from './details/PostTitle.vue'

const props = defineProps({
  postData: Object
})

const emit = defineEmits(['edit-request'])

function forwardEditRequest(payload) {
  emit('edit-request', payload)
}

function openEdit(field, value, inputType) {
  emit('edit-request', {
    field,
    value,
    inputType,
    title: `Edit ${field}`
  })
}
</script>
