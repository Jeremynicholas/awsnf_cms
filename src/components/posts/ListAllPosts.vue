<template>
  <nav class="sorting grid-row" role="row">
    <span class="cell"
      :class="{ active: sortBy.startsWith('name') }"
      @click="changeSort('name')"
      type="button"
    >
      Name
      <div class="arrows" aria-hidden="true">
        <i class="fas fa-caret-up" :class="{ asc: sortBy === 'name_asc' }"></i>
        <i class="fas fa-caret-down" :class="{ desc: sortBy === 'name_desc' }"></i>
      </div>
    </span>

    <span class="cell"
      :class="{ active: sortBy.startsWith('regionNames') }"
      @click="changeSort('regionNames')"
      type="button"
    >
      Region
      <div class="arrows" aria-hidden="true">
        <i class="fas fa-caret-up" :class="{ asc: sortBy === 'regionNames_asc' }"></i>
        <i class="fas fa-caret-down" :class="{ desc: sortBy === 'regionNames_desc' }"></i>
      </div>
    </span>

    <span class="cell"
      :class="{ active: sortBy.startsWith('countryNames') }"
      @click="changeSort('countryNames')"
      type="button"
    >
      Countries
      <div class="arrows" aria-hidden="true">
        <i class="fas fa-caret-up" :class="{ asc: sortBy === 'countryNames_asc' }"></i>
        <i class="fas fa-caret-down" :class="{ desc: sortBy === 'countryNames_desc' }"></i>
      </div>
    </span>

    <span class="cell" 
      :class="{ active: sortBy.startsWith('groupTour') }"
      @click="changeSort('groupTour')"
      type="button"
    >
      <span class="less_1500">Group Tour</span>
      <i class="fas fa-users greater_1500"></i>
      <div class="arrows" aria-hidden="true">
        <i class="fas fa-caret-up" :class="{ asc: sortBy === 'groupTour_asc' }"></i>
        <i class="fas fa-caret-down" :class="{ desc: sortBy === 'groupTour_desc' }"></i>
      </div>
    </span>

    <span class="cell" 
      :class="{ active: sortBy.startsWith('specialOffer') }"
      @click="changeSort('specialOffer')"
      type="button"
    >
      <span class="less_1500">Special Offers</span>
      <i class="fas fa-star greater_1500"></i>
      <div class="arrows" aria-hidden="true">
        <i class="fas fa-caret-up" :class="{ asc: sortBy === 'specialOffer_asc' }"></i>
        <i class="fas fa-caret-down" :class="{ desc: sortBy === 'specialOffer_desc' }"></i>
      </div>
    </span>

    <span class="cell"
      :class="{ active: sortBy.startsWith('createdAt') }"
      @click="changeSort('createdAt')"
      type="button"
    >
      Date
      <div class="arrows" aria-hidden="true">
        <i class="fas fa-caret-up" :class="{ asc: sortBy === 'createdAt_asc' }"></i>
        <i class="fas fa-caret-down" :class="{ desc: sortBy === 'createdAt_desc' }"></i>
      </div>
    </span>

    <span class="cell status"
      :class="{ active: sortBy.startsWith('published') }"
      @click="changeSort('published')"
      type="button"
    >
      Status
      <div class="arrows" aria-hidden="true">
        <i class="fas fa-caret-up" :class="{ asc: sortBy === 'published_asc' }"></i>
        <i class="fas fa-caret-down" :class="{ desc: sortBy === 'published_desc' }"></i>
      </div>
    </span>
  </nav>

  <!-- Rows -->
  <ul class="all_posts">
    <li v-for="post in sortedPosts" :key="post.id" class="card">
      <div v-if="!post.deleteMessage" class="grid-row">
        <div class="title cell">
          <RouterLink :to="'/' + postType + '/' + post.vueSlug" class="icons view_post">
            <i class="fas fa-eye" :class="{ published: post.published, draft: !post.published }"></i>
          </RouterLink>
          <span>{{ post.name }}</span>
        </div>

        <div class="cell">
          <strong>{{ post.regionNames.join('') }}</strong>
        </div>

        <div class="cell">
          <span>{{ post.countryNames.join(', ') }}</span>
        </div>

        <div class="cell">
          <i v-if="post.groupTour" class="fas fa-users"></i>
        </div>

        <div class="cell" >
          <i v-if="post.specialOffer" class="fas fa-star"></i>
        </div>

        <div class="cell">{{ post.createdAt }}</div>

        <div class="cell">
          <span class="status_button" :class="{ published: post.published, draft: !post.published }">
            <span class="show-published">{{ post.published ? 'Published' : 'Draft' }}</span>
            <span class="show-tick">{{ post.published ? '✓' : 'x' }}</span>
          </span>
        </div>
              <EditPostsModal :post="post" @edit="openEditModal" @delete="openDeleteModal" @close="closeModals" />

      </div>

      <div v-else class="delete_message">{{ post.deleteMessage }}</div>

    </li>
  </ul>
</template>

  
  <script setup>
  import { ref, computed, reactive, onMounted, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { usePostsStore } from '../../store/posts'
  import { useLookupStore } from '../../store/lookups'

  import EditPostsModal from '../modals/EditPostsModal.vue';
  import CountrySelector from '../modals/selectors/CountrySelector.vue';

  const props = defineProps({
    postType: String,
    isSpecial: Boolean,
    isGroupTour: Boolean,
    refreshKey: Number
  });

  const posts = usePostsStore()
  const lookups = useLookupStore()

  const route = useRoute();

  const sortBy = ref('') // e.g. 'name_asc'
  const activeModal = ref(null)
  const editPost = reactive({ id: '', name: '', countries: [] })
  const successMessage = ref('')

  
// FILTER BY SPECIAL OFFER OR GROUP TOUR
  onMounted(async () => {
    await lookups.fetchRegions()
    await lookups.fetchCountries()
    posts.fetchPosts(props.postType, {
      specialOffer: props.isSpecial,
      groupTour: props.isGroupTour
    })
  })

// WATCH ROUTE CHANGE
watch(
  () => [props.postType, props.isSpecial, props.isGroupTour, route.fullPath],
  ([newType, isSpecial, isGroupTour]) => {
    console.log('Fetching posts due to prop change');
    posts.fetchPosts(newType, {
      specialOffer: isSpecial,
      groupTour: isGroupTour
    })
  }
)

// WATCH FOR NEW POST CREATION
watch(
  () => props.refreshKey,
  () => {
    console.log('Fetching posts due to new post');
    posts.fetchPosts(props.postType, {
      specialOffer: props.isSpecial,
      groupTour: props.isGroupTour
    }, true)
  }
)

// Handle sorting
  const changeSort = (field) => {
    const [currentField, currentDir] = sortBy.value.split('_')
    const newDir = currentField === field && currentDir === 'asc' ? 'desc' : 'asc'
    sortBy.value = `${field}_${newDir}`
  }

// Computed: sorted posts
  const sortedPosts = computed(() => {
  const filterKey = computed(() => {
  const keys = []
    if (props.isSpecial) keys.push('specialOffer')
    if (props.isGroupTour) keys.push('groupTour')
    return keys.sort().join('_') || 'all'
  })

  const cacheKey = computed(() => `${props.postType}_${filterKey.value}`)
  const all = computed(() => posts.posts[cacheKey.value] || [])

  if (!sortBy.value) return all.value

  const [field, dir] = sortBy.value.split('_')
  const modifier = dir === 'asc' ? 1 : -1

  return [...all.value].sort((a, b) => {
    const aVal = typeof a[field] === 'string' ? a[field].toLowerCase() : a[field]
    const bVal = typeof b[field] === 'string' ? b[field].toLowerCase() : b[field]

    if (aVal === bVal) return 0
    return aVal > bVal ? modifier : -modifier
  })
})


// HANDLING DELETES AND UPDATES
const isEditing = (post) => activeModal.value === 'edit' && editPost.id === post.id
const isDeleting = (post) => activeModal.value === 'delete' && editPost.id === post.id

const openEditModal = (post) => {
  activeModal.value = isEditing(post) ? null : 'edit'
  Object.assign(editPost, { id: post.id, name: post.name, countries: [...(post.countries || [])] })
}

const openDeleteModal = (post) => {
  activeModal.value = isDeleting(post) ? null : 'delete'
  editPost.id = post.id
}

const closeModals = () => {
  activeModal.value = null
  successMessage.value = ''
}

// Update post
const updatePost = async (post) => {
  await posts.updatePost(props.postType, post.id, {
    name: post.name,
    countries: post.countries
  })
  successMessage.value = 'Post updated successfully!'
}

// Delete post
const deletePost = async (post) => {
  await posts.deletePost(props.postType, post.id)
  closeModals()
}

</script>
  
  <style>

  .grid-row {
    display: grid;
    gap: var(--gap15);
    align-items: center;
    padding: var(--paddingInputs);
    grid-template-columns:
      minmax(300px, 460px)
      minmax(100px, 200px)
      minmax(200px, 1fr)
      minmax(40px, 145px)
      minmax(40px, 145px)
      minmax(150px, 200px)
      minmax(80px, 100px)
      minmax(30px, 40px);


    @media (max-width: 1350px) {
      grid-template-columns: 
      minmax(300px, 1fr)
      minmax(200px, 200px)
      minmax(100px, 100px)
      minmax(20px, 20px);

      .cell:nth-child(2), .cell:nth-child(3), .cell:nth-child(4), .cell:nth-child(5) {
        display: none;
      }
    }

    @media (max-width: 860px) {
      grid-template-columns: 1fr 160px 40px 30px;
    }

    @media (max-width: 500px) {
      grid-template-columns: 1fr 70px 40px;

      .cell:nth-child(7):not(.status) {
        position: absolute;
        top: -10px;
        right: -10px;

        .status_button {
          display: none;
        }
      }

      .view_post {
        position: absolute;
        top: 5px;
        right: 5px;

        i.draft {
          color: var(--error);
        }
        i.published {
          color: var(--success);
        }
      }

      .actions {
        position: absolute;
        bottom: 5px;
        right: 5px;
      }
    }
  }

   .sorting {
     span {
      display: flex;
      align-items: center;
      gap: var(--gap5);
      cursor: pointer;
    }

    @media (max-width: 768px) {
          margin-top: 30px;

          &.cell {
            font-size: .8rem;
          }
      }

    @media (min-width: 1500px) {
      .greater_1500 {
        display: none;
      }
    }

    @media (max-width: 1500px) {
      .less_1500 {
        display: none;
      }
    }

    .arrows {
      display: flex;
      flex-direction: column;

      @media (max-width: 500px) {
        display: none;
      }

      i {
        line-height: 0.5;

        &.asc, &.desc {
          opacity: var(--opacityHover);
        }
      }
    }
  }


    @media (min-width: 860px) {
      .show-tick {
        display: none;
      }
    }

    @media (max-width: 860px) {
      .show-published {
        display: none;
      }
    }

.title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.arrows {
  display: inline-flex;
  flex-direction: column;
  line-height: 1;
}


  .all_posts {
    position: relative;
    display: grid;
    list-style: none;
    margin: 0;
    margin-bottom: 60px;
    padding: 0;

    .card {
      position: relative;
      background: var(--background-white-dark);
      border: var(--borders);
      border-radius: 10px;
      margin-top: var(--gap15);
      cursor: default;

      &:hover {
        background: var(--backgroundHoverLight);
      }

      &.editing {
        border-color: var(--accent);
      }

      &.deleting {
        opacity: var(--opacityHover);
        border-color: var(--error);
        pointer-events: none;
      }
    }
  }
</style>