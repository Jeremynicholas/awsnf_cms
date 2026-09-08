<template>
  <div v-if="visible" class="tiptap_modal">
    <input v-model="localHref" placeholder="Enter URL" />
    <select v-model="localTarget">
      <option value="_self">Same tab</option>
      <option value="_blank">New tab</option>
    </select>
    <div>
      <button @click="confirm">Apply</button>
      <button @click="$emit('cancel')">Cancel</button>
    </div>
  </div>
</template>
  
  <script setup>
  import { ref, watch } from 'vue';

  const props = defineProps({
    visible: Boolean,
    href: String,
    target: String
  });
  
  const emit = defineEmits(['update:href', 'update:target', 'confirm', 'cancel']);
  
  const localHref = ref(props.href);
  const localTarget = ref(props.target);

  watch(() => props.href, (val) => (localHref.value = val));
  watch(() => props.target, (val) => (localTarget.value = val));

  const confirm = () => {
    emit('update:href', localHref.value);
    emit('update:target', localTarget.value);
    emit('confirm');
  };
  </script>
  
  <style scoped>
.tiptap_modal {
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: var(--gap10);
    background: var(--background-white-dark);
    border: var(--borders);
    border-radius: var(--rounded);
    box-shadow: var(--box-shadow-large);
    padding: var(--padding15);
    width: 300px;
    z-index: 100;

    div {
      display: flex;
      gap: var(--gap10);
    }
  }
  .tiptap_modal ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .tiptap_modal li {
    padding: 5px 10px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  </style>
  