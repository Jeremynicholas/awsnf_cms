<!--/components/posts/types/details/PostHtml.vue-->
<template>
    <div v-if="postData">
       <h3>Main content</h3>  
       <div class="items html_content">
           <p v-html="parsedContent"></p>
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

       <small>Highlights</small>  
       <div class="items html_content">
           <p v-html="postData.highlights"></p>
           <div class="icons"
            @click="emitEditRequest({
              title: 'Edit highlights',
              inputType: 'html',
              field: 'highlights',
              value: postData.highlights,
              index,
              })">
             <i class="fas fa-edit"></i>
           </div>
         </div>

        <!-- Highlights Block -->
        <small>Extra Highlights (with image)</small> 
        <div class="items_multiple" style="position: relative;">
          <div v-for="(highlight, index) in postData.highlightsExtra" :key="index" class="items highlights">
            <div class="thumbnail"
              :style="{ backgroundImage: highlight.imageData?.url ? `url(${highlight.imageData.url})` : 'none' }">
            </div>
            <div>
              <strong>{{ highlight.title || 'No title' }}</strong>
              <p>{{ highlight.text || 'No content' }}</p>
            </div>
            <div class="icons"
              @click="emitEditRequest({
                title: `Edit highlight #${index + 1}`,
                inputType: 'highlightsExtra',
                field: 'highlightsExtra',
                value: highlight,
                index,
              })">
              <i class="fas fa-edit"></i>
            </div>
          </div>

          <!-- Add new -->
          <div class="items">
            <p class="text-muted">{{ !postData.highlightsExtra?.length ? 'No highlights yet' : 'Add another highlight' }}</p>
            <div class="icons"
              @click="emitEditRequest({
                title: 'New highlight',
                inputType: 'highlightsExtra',
                field: 'highlightsExtra',
                value: { title: '', text: '', image: null },
                index: -1,
              })">
              <i class="fas fa-plus-circle"></i>
            </div>
          </div>
        </div>


       <small class="small-margin-top">Inclusions</small>  
       <div class="items html_content">
           <p v-html="postData.inclusions"></p>
           <div class="icons"
            @click="emitEditRequest({
              title: 'Edit inclusions',
              inputType: 'html',
              field: 'inclusions',
              value: postData.inclusions,
              index,
              })">
             <i class="fas fa-edit"></i>
           </div>
         </div>

      <small>Exclusions</small>  
        <div class="items html_content">
           <p v-html="postData.exclusions"></p>
           <div class="icons"
            @click="emitEditRequest({
              title: 'exclusions',
              inputType: 'html',
              field: 'exclusions',
              value: postData.exclusions,
              index,
              })">
             <i class="fas fa-edit"></i>
           </div>
        </div>

      <small>Activities</small>  
        <div class="items html_content">
            <p v-html="postData.activities"></p>
            <div class="icons"
              @click="emitEditRequest({
                title: 'activities',
                inputType: 'html',
                field: 'activities',
                value: postData.activities,
                index,
                })">
              <i class="fas fa-edit"></i>
            </div>
        </div>  

       <small>Getting There</small>  
       <div class="items html_content">
           <p>{{ gettingThereName }}</p>
           <div class="icons"
            @click="emitEditRequest({
              title: 'Select a getting there',
              inputType: 'gettingThere',
              field: 'gettingThere',
              value: postData.gettingThere,
              index,
              })">
             <i class="fas fa-edit"></i>
           </div>
         </div>

         <!-- Combine With Block -->
        <small class="small-margin-top">Combine With</small> 
        <div class="items_multiple" style="position: relative;">
          <div v-for="(combineWith, index) in postData.combineWithData" :key="index" class="items highlights">
            <div class="thumbnail"
              :style="{ backgroundImage: combineWith.imageData?.url ? `url(${combineWith.imageData.url})` : 'none' }">
            </div>
            <div>
              <strong>{{ combineWith.title || 'No title' }}</strong>
              <p>{{ combineWith.text || 'No content' }}</p>
            </div>
            <div class="icons"
              @click="emitEditRequest({
                title: `Edit combine with #${index + 1}`,
                inputType: 'combineWithData',
                field: 'combineWithData',
                value: combineWith,
                index,
              })">
              <i class="fas fa-edit"></i>
            </div>
          </div>

          <!-- Add new -->
          <div class="items">
            <p class="text-muted">{{ !postData.combineWithData?.length ? 'No combine with yet' : 'Add another' }}</p>
            <div class="icons"
              @click="emitEditRequest({
                title: 'New combine with',
                inputType: 'combineWithData',
                field: 'combineWithData',
                value: { title: '', text: '', image: null },
                index: -1,
              })">
              <i class="fas fa-plus-circle"></i>
            </div>
          </div>
        </div>
    
         <div>
        </div>

    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useLookupStore } from '../../../../store/lookups';

const props = defineProps({
 postData: Object,
 isBlog: Boolean
});

const emit = defineEmits(['edit-request']);

function emitEditRequest({ field, value, inputType, title, index = null }) {
  emit('edit-request', { field, value, inputType, title: title, index });
}

// CONVERT SHORTCODES
function parseShortcodes(content, data) {
  if (typeof content !== 'string') {
    console.warn('Expected string for content, got:', typeof content, content);
    return '';
  }

  return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] || match;
  });
}

const parsedContent = computed(() => {
  const firstDeparture = props.postData?.departures?.[0] || {};

  return parseShortcodes(props.postData.content, {
    ...props.postData,                               // keep any remaining top-level fields
    cost: firstDeparture.pricing?.cost,
    days: firstDeparture.days,
    nights: firstDeparture.nights,
    departureLocation: firstDeparture.locationStart,
    departureDate: firstDeparture.date,
    locationStart: firstDeparture.locationStart,
    locationEnd: firstDeparture.locationEnd,
  });
});

// LOOKUPS - GETTING THERE
const lookupStore = useLookupStore()

const gettingThereName = computed(() => {
  const id = props.postData?.gettingThere
  if (!id) return ''
  return lookupStore.lookupMaps.gettingThere?.[id]?.name || 'Unknown'
})

</script>

<style>
  .html_content p {
    pointer-events: none;
  }
</style>