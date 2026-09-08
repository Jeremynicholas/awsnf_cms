import { createApp, watch } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router/router'
import VueLazyLoad from 'vue3-lazy'
import { useAuthStore } from './store/auth'
import { useTheme } from './store/theme'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
const authStore = useAuthStore(pinia)
authStore.init()

app.use(router)
app.use(VueLazyLoad, {})

const themeStore = useTheme(pinia)

themeStore.initTheme()

router.isReady().then(() => {
  watch(
    () => authStore.user,
    (user) => {
      const isPublic = !!router.currentRoute.value.meta.public

      if (!user && !isPublic) {
        router.replace({ name: 'login' })
      }

      if (user && router.currentRoute.value.name === 'login') {
        router.replace({ name: 'dashboard' })
      }
    },
    { immediate: true }
  )

  app.mount('#app')
})