<template>
    <div>
        <h3>Intro content</h3>  
          <div>
            <div class=" items thumbnail" style="max-width: 200px;" :style="{ backgroundImage: postData.featureImage2Data?.url ? `url(${postData.featureImage2Data?.url})` : 'none'}">
                <div class="icons feature_image"
                    @click="emitEditRequest({
                        title: 'Edit secondary feature image',
                        inputType: 'blogImage',
                        field: 'featureImage2',
                        value: postData.featureImage2Data,
                    })">
                    <i class="fas fa-edit"></i>
                </div>
            </div>

        </div>

        <div class="items html_content">
           <p v-html="postData.content"></p>
           <div class="icons"
            @click="emitEditRequest({
              title: 'Edit main content',
              inputType: 'html',
              field: 'content',
              value: postData.content,
              index,
              })">
             <i class="fas fa-edit"></i>
           </div>
         </div>

        <h3>Blog Content</h3>
        <div class="grid_inputs blog_inputs">
            
            <draggable
                class="grid_inputs"
                v-model="internalBlogCollection"
                item-key="id"
                @start="onDragStart"
                @end="onDragEnd"
                handle=".drag-handle"
            >
                <template #item="{ element: block, index }">
                    <div class="blog_blocks" :key="block.id">
                        <div>
                            <span class="drag-handle">⠿</span>
                        </div>                        
                        <div>
                            <div class="items html_content">
                                <div>
                                    <img
                                        v-if="block.blogImageData?.url"
                                        class="blog_images"
                                        :src="block.blogImageData.url"
                                        alt=""
                                        />
                                    <div>
                                        <p v-html="block.content"></p>
                                    </div>
                                </div>
                                <div class="icons"
                                    @click="emitEditRequest({
                                        title: 'Edit block',
                                        inputType: 'html',
                                        field: 'blogDetails',
                                        value: block.content,
                                        index,
                                        })">
                                    <i class="fas fa-edit"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </draggable>
 
            <button @click="emitEditRequest({
                    title: 'Add new blog block',
                    inputType: 'html',
                    field: 'blogDetails',
                    value: '',
                    index: -1
                })">Add New Block
            </button>
        </div>
    </div>
</template>


<script setup>
import { ref, watch } from 'vue'
import { usePostsStore } from '../../../../store/posts'
import draggable from "vuedraggable";

const props = defineProps({
    blogCollection: Array,
    postData: Object,
});

const emit = defineEmits(['edit-request', 'readtime-calculated']);

function emitEditRequest({ field, value, inputType, title, index = null }) {
  emit('edit-request', { field, value, inputType, title: title, index });
}

const postsStore = usePostsStore()
const internalBlogCollection = ref([...props.blogCollection])
const isReordering = ref(false)

watch(
  () => props.blogCollection,
  (newVal) => {
    if (!isReordering.value) {
      internalBlogCollection.value = [...newVal]
    }
  },
  { deep: true }
)

async function onDragStart() {
  isReordering.value = true
}

async function onDragEnd(evt) {
  const blogId = props.postData.id

  internalBlogCollection.value.forEach((block, index) => {
    block.order = index
  })

  internalBlogCollection.value = [...internalBlogCollection.value]

  for (const block of internalBlogCollection.value) {
    await postsStore.updateBlogBlock(blogId, block.id, { order: block.order })
  }

  postsStore.blogs[blogId] = [...internalBlogCollection.value]

}

// READ TIME
function stripHtml(html = "") {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

const AVERAGE_WPM = 230;

let timeout
watch(
  [() => props.postData.content, internalBlogCollection],
  ([content, blocks]) => {
    clearTimeout(timeout)
    timeout = setTimeout(async () => {
      const allHtml = (content || '') + ' ' + blocks.map(b => b.content || '').join(' ')
      const text = stripHtml(allHtml)
      const wordCount = text.split(/\s+/).filter(Boolean).length
      const readTime = Math.ceil(wordCount / AVERAGE_WPM)

      console.log('word count is:', wordCount)
      // Only update if it’s changed
      if (readTime && readTime !== props.postData.readTime) {
        console.log(`🕒 Updating readTime: ${readTime} min`)
        await postsStore.updatePost('blogs', props.postData.id, { readTime })
      }
    }, 1000)
  },
  { immediate: true, deep: true }
)

</script>

<style>
.blog_blocks {
    display: grid;
    grid-template-columns: min-content auto min-content;
    align-items: start;
    gap: var(--gap10);
}
</style>