<template>
  <h1>Add a new {{ postTypeSingular }}</h1>
   <div class="grid_inputs">
    
    <input v-model="postName" placeholder="Enter post name" />
    <input v-model="slugInput"
      @blur="normalizeSlug"
      placeholder="Slug will appear here"
    />

    <select v-model="postType">
      <option :value="postType">{{ postTypeName }}</option>
    </select>

    <select id="postTypeFlag" v-model="postTypeFlag">
      <option value="">Trip type</option>
      <option value="groupTour">Group Tour</option>
      <option value="specialOffer">Special Offer</option>
    </select>

    <CountrySelector :countries="countries" v-model="selectedCountries" />

    <button class="create_trip_button" @click="createPost">Create {{ postTypeSingular }}</button>
  </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { firestore } from '../../firebase/firebase';
  import { collection, addDoc, setDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
  import CountrySelector from '../modals/selectors/CountrySelector.vue'
  import { normalizeText } from '../../utils/normalizeText.js';

  const props = defineProps({
    type: String,
    isSpecial: Boolean,
    isGroupTour: Boolean
  });

  const emit = defineEmits(['postCreated']);

  const postName = ref('');
  const postType = ref(props.type);

  const postTypeName = computed(() => {
    return postType.value.charAt(0).toUpperCase() + postType.value.slice(1);
  });

  const postTypeFlag = ref('')  // '' | 'groupTour' | 'specialOffer'

watch(
  () => [props.isSpecial, props.isGroupTour],
  () => {
    if (props.isSpecial) {
      postTypeFlag.value = 'specialOffer'
    } else if (props.isGroupTour) {
      postTypeFlag.value = 'groupTour'
    } else {
      postTypeFlag.value = ''
    }
  },
  { immediate: true }
)

  const postTypeSingular = computed(() => {
    switch (postType.value) {
      case 'trips':
        return 'Trip';
      case 'blogs':
        return 'Blog';
      case 'accommodation':
        return 'Accommodation';
      default:
        return 'Unknown Type';
    }
  });

const countries = ref([]);
const selectedCountries = ref([]);
const cleanSlug = computed(() => normalizeText(postName.value));
const slugLocked = ref(false)

const slugInput = ref('')

const slug = computed(() => {
  let prefix = 'tailor-made'

  switch (postTypeFlag.value) {
    case 'groupTour':
      prefix = 'group-tours'
      break
    case 'specialOffer':
      prefix = 'special'
      break
  }

  return `${prefix}/${slugInput.value}`
})

const vueSlug = computed(() => cleanSlug.value); 

watch(postName, (val) => {
  if (!slugLocked.value) {
    slugInput.value = normalizeText(val)
  }
})

// When user edits slug manually → lock it
watch(slugInput, (val, old) => {
  if (val !== old && val !== normalizeText(postName.value)) {
    slugLocked.value = true
  }
})

// Normalize slug on blur
function normalizeSlug() {
  slugInput.value = normalizeText(slugInput.value)
}

onMounted(async () => {
  const countriesRef = collection(firestore, 'countries');
  const snapshot = await getDocs(countriesRef);
  countries.value = snapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name,
    parentId: doc.data().parentId
  }));
});

const createPost = async () => {
  try {
    if (!postName.value.trim()) {
      alert("Please enter a name for the post.");
      return;
    }

    if (selectedCountries.value.length === 0) {
      alert("Please select at least one country.");
      return;
    }

    const postRef = collection(firestore, postType.value);

    const postData = {
      name: postName.value,
      slug: slug.value,
      vueSlug: vueSlug.value,
      countries: selectedCountries.value,
      departures: [],
      createdAt: new Date(),
      groupTour: false,
      specialOffer: false,
      published: false,
    };

    if (postType.value === 'trips') {
      if (postTypeFlag.value === 'groupTour') {
        postData.groupTour = true;
      } else if (postTypeFlag.value === 'specialOffer') {
        postData.specialOffer = true;
      }
    }

    const docRef = await addDoc(postRef, postData);

    postName.value = '';
    selectedCountries.value = [];
    
    emit('postCreated');
    console.log("Trip created with ID: ", docRef.id);

    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  
  </script>
  
  <style>
    .toggle_new_posts {
      position: relative;
      z-index: 99;
      display: flex;
      align-items: center;
      gap: var(--gap15);
    }

    .create_post_form {
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      background: var(--white);
      border: var(--borders);
      border-radius: var(--rounded);
      padding: var(--padding15);
      box-shadow: var(--box-shadow-large);
    }
  </style>
  