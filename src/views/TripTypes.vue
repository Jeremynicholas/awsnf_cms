<template>
    <Sections>
        <h1>Trip Types</h1>
        <div>
            <ul class="type-selector">
                <template v-for="type in holidayTypes" :key="type.id">
                <li class="is_parent">
                    <div class="type">
                        <input type="checkbox" :id="'type-' + type.id" :value="type.id" v-model="selectedTypes">
                        <label :for="'type-' + type.id">{{ type.name }}</label>
                    </div>
                </li>
                </template>
            </ul>

            <!-- Delete Button -->
            <button v-if="selectedTypes.length > 0" class="delete-button" @click="deleteSelectedType">
                Delete Selected holiday types
            </button>
  
            <h2>Add new holiday type</h2>
            <div class="grid_inputs">
                <input v-model="newTypeName" placeholder="New type name" />
                <button class="buttons" @click="addNewType">Add Category</button>
            </div>
        </div>
    </Sections>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { firestore } from '../firebase/firebase';
  import { collection, doc, addDoc, getDocs, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';

  import Sections from '../components/layout/Sections.vue'  
  
  const holidayTypes = ref([]);
  const selectedTypes = ref([]);
  
  const newTypeName = ref('');
 
  onMounted(() => {
  const typeRef = collection(firestore, 'holidayTypes');
  const unsubscribe = onSnapshot(typeRef, (snapshot) => {
    holidayTypes.value = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
    }));
  });

  return () => unsubscribe();  // Cleanup the subscription when the component unmounts
});
  
  
const addNewType = async () => {
  if (!newTypeName.value.trim()) {
    alert("Please enter a type name.");
    return;
  }
  const typeQuery = query(collection(firestore, 'holidayTypes'), where("name", "==", newTypeName.value.trim()));
  const snapshot = await getDocs(typeQuery);
  if (snapshot.empty) {
    await addDoc(collection(firestore, 'holidayTypes'), {
      name: newTypeName.value.trim(),
    });

    newTypeName.value = '';
  } else {
    alert("This type already exists.");
  }
};
  
   
  const deleteSelectedType = async () => {
  try {
    const deletePromises = selectedTypes.value.map(typeId => {
      const docRef = doc(firestore, 'holidayTypes', typeId);
      return deleteDoc(docRef);
    });
    await Promise.all(deletePromises);
    selectedTypes.value = []; // Clear selection after deletion
    alert('Selected holiday types have been deleted.');
  } catch (error) {
    console.error('Error deleting holiday types:', error);
    alert('Failed to delete holiday types.');
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
  