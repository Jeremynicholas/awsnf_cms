<template>
    <Sections>
        <h1>Areas</h1>
        <div>
            <ul class="type-selector">
                <template v-for="area in areas" :key="area.id">
                <li class="is_parent">
                    <div class="type">
                        <input type="checkbox" :id="'type-' + area.id" :value="area.id" v-model="selectedArea">
                        <label :for="'type-' + area.id">{{ area.name }}</label>
                    </div>
                </li>
                </template>
            </ul>

            <!-- Delete Button -->
            <button v-if="selectedArea.length > 0" class="delete-button" @click="deleteSelectedArea">
                Delete Selected area
            </button>
  
            <h2>Add new area</h2>
            <div class="grid_inputs">
                <input v-model="newArea" placeholder="New area" />
                <button class="buttons" @click="addNewArea">Add area</button>
            </div>
        </div>
    </Sections>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { firestore } from '../firebase/firebase';
  import { collection, doc, addDoc, getDocs, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';

  import Sections from '../components/layout/Sections.vue'  
  
  const areas = ref([]);
  const selectedArea = ref([]);
  
  const newArea = ref('');
 
  onMounted(() => {
  const areaRef = collection(firestore, 'areas');
  const unsubscribe = onSnapshot(areaRef, (snapshot) => {
    areas.value = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
    }));
  });

  return () => unsubscribe();  // Cleanup the subscription when the component unmounts
});
  
  
const addNewArea = async () => {
  if (!newArea.value.trim()) {
    alert("Please enter a area.");
    return;
  }
  const areaQuery = query(collection(firestore, 'areas'), where("name", "==", newArea.value.trim()));
  const snapshot = await getDocs(areaQuery);
  if (snapshot.empty) {
    await addDoc(collection(firestore, 'areas'), {
      name: newArea.value.trim(),
    });

    newArea.value = '';
  } else {
    alert("This area already exists.");
  }
};
  
   
  const deleteSelectedArea = async () => {
  try {
    const deletePromises = selectedArea.value.map(areaId => {
      const docRef = doc(firestore, 'areas', areaId);
      return deleteDoc(docRef);
    });
    await Promise.all(deletePromises);
    selectedArea.value = []; // Clear selection after deletion
    alert('Selected area has been deleted.');
  } catch (error) {
    console.error('Error deleting area:', error);
    alert('Failed to delete area.');
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
  