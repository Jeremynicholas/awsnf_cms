<template>
  <div class="form_container">
    <div class="login_form">
      <h2>Login</h2>
      <form @submit.prevent="loginUser">
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Password" required />
        <button :disabled="loading">Login</button>
      </form>
      <p v-if="error" class="error">{{ error }}</p>
      
      <button @click="loginGoogle" class="google-btn">
        <svg height="100%" viewBox="0 0 20 20" width="100%"><path d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z" fill="#4285F4"></path><path d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z" fill="#34A853"></path><path d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z" fill="#FBBC05"></path><path d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z" fill="#EA4335"></path></svg>
      <span>Sign in with Google</span>
    </button>
    </div>

  </div>
</template>

<script setup >
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { storeToRefs } from 'pinia'

import Sections from '../components/layout/Sections.vue'


const email = ref('')
const password = ref('')
const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const { error } = storeToRefs(authStore)

async function loginUser() {
  loading.value = true
  error.value = null

  await authStore.login(email.value, password.value)

  if (authStore.error) {
    error.value = authStore.error
    loading.value = false
    return
  }

  router.push('/dashboard')
  loading.value = false
}

const loginGoogle = async () => {
  loading.value = true
  error.value = null

  await authStore.loginWithGoogle()

  if (authStore.error) {
    error.value = authStore.error
    loading.value = false
    return
  }

  router.push('/dashboard')
  loading.value = false
}
</script>


<style scoped>
.form_container {
  margin: auto;
  inset: 0;
  max-width: var(--formWidth);
  width: 100%;
}

.login_form {
  display: grid;
  gap: var(--gap10);
  padding-inline: var(--padding30);

  form {
    display: grid;
    gap: var(--gap5);
  }
  h2 {
    font-size: 2rem!important;
  }
}

.google-btn {
  display: flex;
  align-items: center;
  gap: var(--gap5);

  svg {
    height: 25px;
    width: 25px;
  }
}
</style>