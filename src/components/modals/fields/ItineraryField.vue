<!-- ItineraryField.vue -->
<template>
  <div class="departure-input">
    <label>Day:</label>
    <input type="text" v-model="model.day" />

    <label>Date:</label>
    <input type="text" v-model="model.date" />

    <label>Location:</label>
    <input type="text" v-model="model.location" />

    <label>Description:</label>
    <textarea type="text" v-model="model.description"></textarea>
  </div>
</template>

<script setup>
const model = defineModel()
</script>
