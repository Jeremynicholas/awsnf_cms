<!-- PricingPerField.vue -->
<template>
  <div>
    <select v-model="model">
        <option value="pp">per person</option>
        <option value="pc">per couple</option>
    </select>
  </div>
</template>

<script setup>
const model = defineModel()
</script>
