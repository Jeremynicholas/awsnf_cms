// store/auth.js
import { defineStore } from 'pinia'
import { auth } from '../firebase/firebase'
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const isLoggedIn = computed(() => !!user.value)

  const allowedStaff = [
  'james.c@awsnfs.com',
  'sara@awsnfs.com',
  'steve@awsnfs.com',
  'jeremy.c@awsnfs.com'
]

  function init() {
    onAuthStateChanged(auth, (u) => {
      user.value = u
      loading.value = false
    })
  }

  // --- EMAIL LOGIN ---
  async function login(email, password) {
    loading.value = true
    error.value = null

    try {
    const { user: u } = await signInWithEmailAndPassword(auth, email, password)

    if (!allowedStaff.includes(u.email)) {
      await signOut(auth)
      throw new Error('Unauthorized account – access restricted to AWS staff.')
    }
    user.value = u
  } catch (err) {
    console.error('Email login failed:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

  
  // --- GOOGLE LOGIN ---
async function loginWithGoogle() {
    loading.value = true
    error.value = null

    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ hd: 'awsnfs.com' })

      const result = await signInWithPopup(auth, provider)
      const u = result.user

      const allowedEmails = ['graphics@awsnfs.com']
      if (!allowedEmails.includes(u.email)) {
        await signOut(auth)
        throw new Error('Unauthorized Google account')
      }

      user.value = u
    } catch (err) {
      console.error('Google login failed:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await signOut(auth)
    user.value = null
  }

  return { 
    user,
    loading,
    error,
    isLoggedIn,
    init,
    login,
    loginWithGoogle,
    logout
  }
})
