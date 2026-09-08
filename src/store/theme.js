// src/store/theme.js
import { defineStore } from 'pinia'
import { watch, nextTick } from 'vue'

export const useTheme = defineStore('theme', {
  state: () => ({
    darkMode: false
  }),
  
  actions: {
    async initTheme() {
      if (typeof window === 'undefined') return

      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        this.darkMode = savedTheme === 'dark'
      } else {
        this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
      }

      await nextTick()
      document.body.classList.toggle('dark', this.darkMode)

      // Watch the reactive state instead of listening to DOM events
      watch(
        () => this.darkMode,
        (val) => {
          document.body.classList.toggle('dark', val)
          localStorage.setItem('theme', val ? 'dark' : 'light')
          console.log('Theme watcher →', val)
        },
        { immediate: true }
      )
    },
  },
})
