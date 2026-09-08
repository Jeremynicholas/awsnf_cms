<template>
  <div v-if="postData">
    <h3>Page Details</h3>
    <div class="two_columns">
        <div>
            <small>Title</small>
            <div class="items">
                <p>{{ postData.name }}</p>
                <div class="icons"
                  @click="emitEditRequest({
                    title: 'Edit name',
                    inputType: 'text',
                    value: postData.name,
                    field: 'name',
                    index: null
                    })">
                <i class="fas fa-edit"></i>
                </div>
            </div>
            </div>

            <div>
            <small>Current Slug</small>
            <div class="items">
                <p>{{ displaySlug }}</p>
                <div class="icons"
                  @click="emitEditRequest({
                    title: 'Edit slug',
                    inputType: 'text',
                    value: slugPart,
                    field: 'slug',
                    index: null
                    })">
                <i class="fas fa-edit"></i>
                </div>
            </div>
        </div>
    </div>

    <div>
      <small>Preview Slug</small>
      <div class="items">
        <p>{{ postData.vueSlug }}</p>
        <div class="icons"
          @click="emitEditRequest({
            title: 'Edit vueSlug',
            inputType: 'text',
            value: postData.vueSlug,
            field: 'vueSlug',
            index: null
            })">
          <i class="fas fa-edit"></i>
        </div>
      </div>
    </div>

    <!-- SEO Description -->
    <div>
      <small>SEO Description</small>
      <div class="items">
        <p>{{ postData.description }}</p>
        <div class="icons"
          @click="emitEditRequest({
            title: 'Edit description',
            inputType: 'text',
            value: postData.description,
            field: 'description',
            index: null})">
          <i class="fas fa-edit"></i>
        </div>
      </div>
      <div class="seo-indicator" :class="seoStatus.class">
        <span class="seo-dot" />
        <small>{{ seoStatus.label }} · {{ descLength }} / 155 chars</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  postData: Object
})

const emit = defineEmits(['edit-request']);

function emitEditRequest({ field, value, inputType, title, index = null }) {
  emit('edit-request', { field, value, inputType, title: title, index });
}

const slugPart = ref('')

const extractSlugPart = (slug) => {
  if (!slug) return ''
  return slug.replace(/^(group-tour|specials|tailor-made)\//, '')
}

slugPart.value = extractSlugPart(props.postData.slug)

const displaySlug = computed(() => {
  if (!props.postData) return ''

  const cleanSlug = props.postData.vueSlug || ''

  if (props.postData.groupTour) {
    return `group-tour/${cleanSlug}`
  }

  if (props.postData.specialOffer) {
    return `specials/${cleanSlug}`
  }

  return `tailor-made/${cleanSlug}`
})

// watch for changes in parent prop and update local slugPart
watch(
  () => props.postData.slug,
  (newSlug) => {
    slugPart.value = extractSlugPart(newSlug)
  }
)

const descLength = computed(() => props.postData?.description?.length ?? 0)

const seoStatus = computed(() => {
  const len = descLength.value
  if (len === 0)         return { class: 'seo-bad',     label: 'Missing' }
  if (len < 120)         return { class: 'seo-warning',  label: 'Too short' }
  if (len <= 155)        return { class: 'seo-good',     label: 'Good' }
  return                        { class: 'seo-warning',  label: 'Too long' }
})

</script>
