<template>
    <div class="loading-screen">
       <img src="/loading.gif" />
    </div>
</template>

<script setup>
</script>

<style scoped>
.loading-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--background);

    img {
      width: 20px;
    }
  }

</style>