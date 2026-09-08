<template>
  <div>
    <div class="slug_page" >
      <section class="col_left">
        <div class="row"> 
          <section>
              <h1>Form Collections</h1>
                <div>
                  <div class="global_tabs">
                    <button v-for="tab in tabs"
                      :key="tab.name"
                      :class="{ 'active-tab': activeTab === tab.name }"
                      @click="setActiveTab(tab.id)">
                      {{ tab.name }}
                    </button>
                  </div>

                  <FormEditor
                    v-if="formData"
                    :title="formData.title || formData.slug"
                    collectionName="forms"
                    :formId="formData.id"
                    @edit-request="openEditModal"
                    @duplicate="duplicateForm"
                  />

                  <Loading v-else />
                </div>
          </section>
        </div>  
        
        <EditFieldsModal
          v-model="editableFieldValue"
          :visible="modalVisible"
          :field="modalField"
          :title="modalTitle"
          :inputType="modalInputType"
          :index="editableIndex"
          @update:visible="modalVisible = $event"
          @update:modelValue="editableFieldValue = $event"
          @save="handleSave"
        />

      </section>  

    <!-- SIDEBAR-->
      <section class="col_right" :class="{ active: isMenuOpen }">
        <div class="sidebar_toggle show-at-mob-large" @click="toggleMobileMenu" :class="{ active: isMenuOpen }">
          <i class="fas fa-chevron-left"></i>
        </div>

        <FormSidebar
          :formData="formData"
          @edit-request="openEditModal"
          @save="handleSave"
          @delete="handleDelete"
        />
      </section>

    </div>
  </div>
  </template>
  
  <script setup>
  import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore'
  import { firestore } from '../firebase/firebase'
  import { ref, onMounted, watch } from 'vue';
  import { useRouter, useRoute } from 'vue-router'
  import { collection, getDocs } from 'firebase/firestore'
  import { useFormsStore } from '../store/forms'

  import EditFieldsModal from '../components/modals/EditFieldsModal.vue'
  import FormEditor from '../components/global-data/FormEditor.vue'
  import FormSidebar from '../components/forms/FormSidebar.vue';
  import Loading from '../components/layout/Loading.vue';
  
  const formsStore = useFormsStore()
  const router = useRouter()
  const route = useRoute()

  const tabs = ref([])
  const activeTab = ref('')
  const formData = ref(null);

  async function fetchForms() {
    tabs.value = await formsStore.fetchFormsList()
    if (!activeTab.value && tabs.value.length > 0) {
      activeTab.value = route.query.tab || tabs.value[0].id
    }
  }

  async function fetchFormData() {
    if (!activeTab.value) return
    formData.value = await formsStore.getForm(activeTab.value)
  }

  function setActiveTab(tabName) {
    activeTab.value = tabName
    router.replace({ query: { ...route.query, tab: tabName } })
  }

  onMounted(async () => {
    await fetchForms()
    await fetchFormData()
  })

watch(activeTab, async (newTab) => {
  if (!newTab) return
  await fetchFormData()
  router.replace({ query: { ...route.query, tab: newTab } })
})
  

// HANDLE SAVE
  async function handleSave({ field, value }) {
    if (!formData.value?.id) {
        console.warn('[handleSave] No form selected.');
        return;
      }  

    try {
      if (field === 'slug') {
        const newSlug = value
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-') // normalize
          .replace(/[^a-z0-9\-]/g, ''); // remove illegal chars
        
        await updateDoc(doc(firestore, 'forms', formData.value.id), {
          slug: newSlug,
          updatedAt: Date.now(),
        });

        formData.value.slug = newSlug;
        console.log('✅ Updated form slug:', newSlug);
        return;
      }
      
      await updateDoc(doc(firestore, 'forms', formData.value.id), {
        [field]: value,
        updatedAt: Date.now(),
      });
      formData.value[field] = value; // reflect in UI
      console.log(`✅ Updated form ${field}:`, value);
    } catch (err) {
      console.error('❌ Failed to update form:', err);
    }
  }

// HANDLE DELETE
  async function handleDelete() {
    if (!formData.value?.id) return alert('No form selected.')
    const confirmDelete = confirm(`Are you sure you want to delete the form "${formData.value.title || formData.value.id}"?`)
    if (!confirmDelete) return

    await deleteDoc(doc(firestore, 'forms', formData.value.id))
    console.log(`🗑️ Deleted form ${formData.value.id}`)

    // Refresh the list and fallback to first tab
    await fetchForms()
    if (tabs.value.length > 0) {
      activeTab.value = tabs.value[0].name
      await fetchFormData()
    } else {
      formData.value = null
    }
  }
  
// DUPLICATE FORM
  async function duplicateForm() {
    if (!formData.value) return alert('No form loaded to duplicate.')

    const newId = `${formData.value.slug || formData.value.id}-copy`
    const newRef = doc(firestore, 'forms', newId)

    const newData = {
      ...formData.value,
      title: `${formData.value.title || 'Untitled'} (Copy)`,
      slug: newId,
      id: newId,
      updatedAt: Date.now(),
    }

    delete newData.id // Firestore will get it from newId anyway

    await setDoc(newRef, newData)
    console.log('✅ Duplicated form as', newId)

    await fetchForms()
    activeTab.value = newId
  }

// EDIT FIELDS
  const modalVisible = ref(false)
  const modalField = ref('')
  const modalTitle = ref('')
  const modalInputType = ref('text')
  const editableFieldValue = ref('')
  const editableIndex = ref(null)

  function openEditModal({ field, title, inputType, value, index }) {
    console.log('Opening modal with:', field, title, inputType, value, index)
    modalField.value = field
    modalTitle.value = title
    modalInputType.value = inputType
    editableFieldValue.value = value
    editableIndex.value = index
    modalVisible.value = true
  }

  // TOGGLE SIDEBAR MOBILE
const isMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
  header.value.classList.remove("nav_open");
}

  </script>
  
  <style>
  .global_tabs {
    display: flex;
    gap: var(--gap10);
    margin-bottom: var(--gap30);
  }


  

  </style>
  