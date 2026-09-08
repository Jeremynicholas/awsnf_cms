import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  server: {
    host: '0.0.0.0',

    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,

        rewrite: (path) =>
          `/YOUR_FIREBASE_PROJECT_ID/australia-southeast1/api${path.replace(/^\/api/, '')}`,
      },
    },
  },
})