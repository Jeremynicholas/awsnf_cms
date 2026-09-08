<template>
    <Sections>
        <h1>Countries</h1>
        <div>
            <ul class="type-selector">
                <template v-for="country in countries" :key="country.id">
                <li class="is_parent">
                    <div class="type">
                        <input type="checkbox" :id="'type-' + country.id" :value="country.id" v-model="selectedCountry">
                        <label :for="'type-' + country.id">{{ country.name }}</label>
                    </div>
                </li>
                </template>
            </ul>

            <!-- Delete Button -->
            <button v-if="selectedCountry.length > 0" class="delete-button" @click="deleteSelectedCountry">
                Delete Selected country
            </button>
  
            <h2>Add new country</h2>
            <div class="grid_inputs">
                <input v-model="newCountry" placeholder="New country" />
                <button class="buttons" @click="addNewCountry">Add Country</button>
            </div>
        </div>
    </Sections>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { firestore } from '../firebase/firebase';
  import { collection, doc, addDoc, getDocs, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';

  import Sections from '../components/layout/Sections.vue'  
  
  const countries = ref([]);
  const selectedCountry = ref([]);
  
  const newCountry = ref('');
 
  onMounted(() => {
  const countryRef = collection(firestore, 'countries');
  const unsubscribe = onSnapshot(countryRef, (snapshot) => {
    countries.value = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
    }));
  });

  return () => unsubscribe();  // Cleanup the subscription when the component unmounts
});
  
  
const addNewCountry = async () => {
  if (!newCountry.value.trim()) {
    alert("Please enter a Country.");
    return;
  }
  const countryQuery = query(collection(firestore, 'countries'), where("name", "==", newCountry.value.trim()));
  const snapshot = await getDocs(countryQuery);
  if (snapshot.empty) {
    await addDoc(collection(firestore, 'countries'), {
      name: newCountry.value.trim(),
    });

    newCountry.value = '';
  } else {
    alert("This country already exists.");
  }
};
  
   
  const deleteSelectedCountry = async () => {
  try {
    const deletePromises = selectedCountry.value.map(countryId => {
      const docRef = doc(firestore, 'countries', countryId);
      return deleteDoc(docRef);
    });
    await Promise.all(deletePromises);
    selectedCountry.value = []; // Clear selection after deletion
    alert('Selected country has been deleted.');
  } catch (error) {
    console.error('Error deleting country:', error);
    alert('Failed to delete country.');
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
  