<template>
    <Sections>
        <h1>Regions</h1>
        <div>
            <ul class="type-selector">
                <template v-for="region in regions" :key="region.id">
                <li class="is_parent">
                    <div class="type">
                        <input type="checkbox" :id="'type-' + region.id" :value="region.id" v-model="selectedRegion">
                        <label :for="'type-' + region.id">{{ region.name }}</label>
                    </div>
                </li>
                </template>
            </ul>

            <!-- Delete Button -->
            <button v-if="selectedRegion.length > 0" class="delete-button" @click="deleteSelectedRegion">
                Delete Selected region
            </button>
  
            <h2>Add new region</h2>
            <div class="grid_inputs">
                <input v-model="newRegion" placeholder="New region" />
                <button class="buttons" @click="addNewRegion">Add region</button>
            </div>
        </div>
    </Sections>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { firestore } from '../firebase/firebase';
  import { collection, doc, addDoc, getDocs, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';

  import Sections from '../components/layout/Sections.vue'  
  
  const regions = ref([]);
  const selectedRegion = ref([]);
  
  const newRegion = ref('');
 
  onMounted(() => {
  const regionRef = collection(firestore, 'regions');
  const unsubscribe = onSnapshot(regionRef, (snapshot) => {
    regions.value = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
    }));
  });

  return () => unsubscribe();  // Cleanup the subscription when the component unmounts
});
  
  
const addNewRegion = async () => {
  if (!newRegion.value.trim()) {
    alert("Please enter a region.");
    return;
  }
  const regionQuery = query(collection(firestore, 'regions'), where("name", "==", newRegion.value.trim()));
  const snapshot = await getDocs(regionQuery);
  if (snapshot.empty) {
    await addDoc(collection(firestore, 'regions'), {
      name: newRegion.value.trim(),
    });

    newRegion.value = '';
  } else {
    alert("This region already exists.");
  }
};
  
   
  const deleteSelectedRegion = async () => {
  try {
    const deletePromises = selectedRegion.value.map(regionId => {
      const docRef = doc(firestore, 'regions', regionId);
      return deleteDoc(docRef);
    });
    await Promise.all(deletePromises);
    selectedRegion.value = []; // Clear selection after deletion
    alert('Selected region has been deleted.');
  } catch (error) {
    console.error('Error deleting region:', error);
    alert('Failed to delete region.');
  }
};
  
  </script>
  
  <style scoped>
  
  ul {
    list-style-type: none;
  
    input, select {
      width: auto;
    }

    input[type="checkbox"] {
        height: 15px;
        width: 15px;
    }
  }
  .type-selector .type {
    display: flex;
    align-items: center;
    gap: var(--gap10)
  }
  
  .type-selector .is_parent {
   margin-bottom: var(--gap10);
  }
  
  .type-selector .has_children {
   margin-left: var(--gap10);
  }
  
  
  </style>
  