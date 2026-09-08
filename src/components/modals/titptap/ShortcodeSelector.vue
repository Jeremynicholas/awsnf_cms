<template>
    <div class="tiptap_modal" v-if="visible">
      <ul>
        <li v-for="code in shortcodes" :key="code" @click="selectShortcode(code.value)" :class="{ 'active_shortcode': code.value === active }"
        >
          {{ code.label  }}
        </li>
      </ul>
    </div>
  </template>
  
  <script setup> 
  const props = defineProps({
    visible: Boolean,
    shortcodes: Array,
    active: String
  });
  
  const emit = defineEmits(['select', 'close']);
  
  const selectShortcode = (shortcodeValue) => {
    emit('select', `{{${shortcodeValue}}}`);
    emit('close');
  };
  </script>
  
  <style scoped>
  .tiptap_modal {
    position: absolute;
    background: var(--background-white-dark);
    border: var(--borders);
    border-color: var(--borderColor);
    border-radius: var(--rounded);
    padding: var(--padding15);
    width: 200px;
    z-index: 100;
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

    &.active_shortcode {
      background: #ededed;
    }
  }
  </style>
  