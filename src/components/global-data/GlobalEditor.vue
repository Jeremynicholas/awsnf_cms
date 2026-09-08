<!--GLOBAL COLLECTION EDITOR-->
<template>
    <div class="global_editor">
        <div>
            <h2>{{ title }}</h2>
            <select v-model="selectedId" class="dropdown">
                <option value="">Select an entry</option>
                <option v-for="entry in documents" :key="entry.id" :value="entry.id">
                    {{ entry.name }}
                </option>
            </select>

            <div v-if="selectedDoc" class="grid_inputs selected">
                <input v-model="editName" placeholder="Edit name" />
                <input v-if="props.collectionName === 'staffBios'" v-model="editRole" placeholder="Edit role" />
                <textarea ref="editTextarea" v-model="editText" rows="1" placeholder="Edit text"></textarea>

                <div v-if="props.collectionName === 'staffBios'" class="gallery">
                  <button @click="openStaffImageModal">Edit Profile Images</button>

                  <div class="thumbnail bio_preview" v-if="editImages.length">
                    <img
                      v-for="img in editImages"
                      :key="img"
                      :src="lookupImages[img]?.url"
                      class="small_preview"
                    />
                  </div>
                </div>

            </div>
            
            <div class="footer-buttons" >
              <button v-if="selectedId" @click="updateDocEntry">Update</button>
              <button class="delete-button" v-if="selectedId" @click="deleteDocEntry">Delete</button>
            </div>

        </div>
        <div>
          <span class="line"></span>
        </div>

        <div>
            <h2>Add new {{ title }}</h2>
            <div class="grid_inputs">
                <input v-model="newName" placeholder="Name" />
                <input v-if="props.collectionName === 'staffBios'" v-model="newRole" placeholder="Role" />
                <input v-if="props.collectionName === 'testimonials'" v-model="testimonialDate" placeholder="Date" />
                <textarea ref="newTextarea" v-model="newText" placeholder="Text" rows="3"></textarea>

                <div v-if="props.collectionName === 'staffBios'">
                  <button @click="openNewStaffImageModal">Add Profile Images</button>

                  <div class="thumbnail bio_preview" v-if="newImages.length">
                    <img
                      v-for="img in newImages"
                      :key="img"
                      :src="lookupImages[img]?.url"
                      class="small_preview"
                    />
                  </div>
                </div>

                <button class="buttons" @click="addNewDocEntry">Add</button>
            </div>
            
        </div>
    </div>

    <EditFieldsModal
      v-if="imageModalVisible"
      v-model="imageFieldConfig.value"
      :visible="imageModalVisible"
      :title="imageFieldConfig.title"
      :field="imageFieldConfig.field"
      :inputType="imageFieldConfig.inputType"
      :index="imageFieldConfig.index"
      @update:visible="imageModalVisible = $event"
      @save="handleStaffImageSave"
    />

</template>

<script setup>
import { ref, computed, watch, watchEffect, onMounted, nextTick  } from 'vue'
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { firestore } from '../../firebase/firebase';
import { useLookupStore } from '../../store/lookups';
import { useImageStore } from '../../store/images';

import EditFieldsModal from '../modals/EditFieldsModal.vue';

const props = defineProps({
  title: String,
  collectionName: String
})

const lookupStore = useLookupStore()
const imageStore = useImageStore();

const lookupImages = computed(() => {
  const map = {}
  imageStore.images.forEach(img => {
    map[img.docId] = img
  })
  return map
})

const documents = ref([])
const selectedId = ref('')
const editName = ref('')
const editRole = ref('')
const editText = ref('')
const newName = ref('')
const newRole = ref('')
const testimonialDate = ref('')
const newText = ref('')
const colRef = collection(firestore, props.collectionName)

const editTextarea = ref(null)
const newTextarea = ref(null)

const newImages = ref([]) // For the Add New form
const editImages = ref([]) // holds selected image docIds
const imageModalVisible = ref(false)
const imageFieldConfig = ref({})

const resizeTextarea = (el) => {
  if (el) {
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }
}

watch(editText, async () => {
  await nextTick()
  resizeTextarea(editTextarea.value)
})

watch(newText, async () => {
  await nextTick()
  resizeTextarea(newTextarea.value)
})

onMounted(() => {
  nextTick(() => {
    resizeTextarea(editTextarea.value)
    resizeTextarea(newTextarea.value)
  })
})


watchEffect(() => {
  const unsub = onSnapshot(colRef, (snapshot) => {
    documents.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  })
  return () => unsub()
})

const selectedDoc = computed(() =>
  documents.value.find((d) => d.id === selectedId.value)
)

watchEffect(() => {
  if (selectedDoc.value) {
    editName.value = selectedDoc.value.name
    editRole.value = selectedDoc.value.role
    editText.value = selectedDoc.value.text
    editImages.value = selectedDoc.value.staffImages || []
  } else {
    editName.value = ''
    editRole.value = ''
    editText.value = ''
  }
})


async function openStaffImageModal() {

  if (!imageStore.images.length) {
    await imageStore.fetchImages()
  }

  imageFieldConfig.value = {
    field: "staffImages",
    title: "Edit Staff Images",
    inputType: "postGallery",   // <— USE EXISTING gallery field!
    value: editImages.value,
    index: null,
  }
  imageModalVisible.value = true
}

async function openNewStaffImageModal() {
  if (!imageStore.images.length) {
    await imageStore.fetchImages()
  }

  imageFieldConfig.value = {
    field: "newStaffImages",
    title: "Select Profile Images",
    inputType: "postGallery",
    value: newImages.value,
    index: null,
  }

  imageModalVisible.value = true
}

function handleStaffImageSave({ field, value }) {
  if (field === "staffImages") {
    editImages.value = [...value]
  }

  if (field === "newStaffImages") {
    newImages.value = [...value]
  }
}


const updateDocEntry = async () => {
  if (!selectedId.value || !editName.value || !editText.value) return
  const docRef = doc(firestore, props.collectionName, selectedId.value)

  const updateData = {
    name: editName.value.trim(),
    role: editRole.value.trim(),
    text: editText.value.trim(),
  }

  if (props.collectionName === "staffBios") {
    updateData.staffImages = editImages.value
  }

  await updateDoc(docRef, updateData)

  // update lookupStore immediately
  const updated = {
    id: selectedId.value,
    name: editName.value,
    role: editRole.value,
    text: editText.value,
    staffImages: editImages.value,
  }

  lookupStore.lookups[props.collectionName] = lookupStore.lookups[props.collectionName].map(d =>
    d.id === updated.id ? updated : d
  )
  lookupStore.lookupMaps[props.collectionName][updated.id] = updated
}

const deleteDocEntry = async () => {
  if (!selectedId.value) return
  await deleteDoc(doc(firestore, props.collectionName, selectedId.value))
  
  // remove from lookupStore
  lookupStore.lookups[props.collectionName] =
    lookupStore.lookups[props.collectionName].filter(d => d.id !== selectedId.value)
  delete lookupStore.lookupMaps[props.collectionName][selectedId.value]

  selectedId.value = ''
}

const addNewDocEntry = async () => {
  if (!newName.value || !newText.value) return
  const exists = documents.value.find(
    (doc) => doc.name.toLowerCase() === newName.value.toLowerCase()
  )
  if (exists) {
    alert('Entry with this name already exists.')
    return
  }

  const newDocRef = await addDoc(colRef, {
    name: newName.value.trim(),
    role: newRole.value.trim(),
    text: newText.value.trim(),
    staffImages: newImages.value,
  })

  const newItem = { 
    id: newDocRef.id, 
    name: newName.value.trim(),
    role: newRole.value.trim(),
    text: newText.value.trim(),
    staffImages: newImages.value   // <-- ADD THIS
  }

  // add to lookupStore immediately
  lookupStore.lookups[props.collectionName].push(newItem)
  lookupStore.lookupMaps[props.collectionName][newDocRef.id] = newItem


  newName.value = ''
  newRole.value = ''
  newText.value = ''
}
</script>

<style scoped>
h2 {
  margin-top: 0;
}

.global-editor {
  display: grid;
  justify-items: stretch;
  gap: var(--gap5);
}

.selected {
  margin-top: 20px;
}

.bio_preview {
  max-width: 140px;
  border-radius: var(--rounded);
}

</style>
