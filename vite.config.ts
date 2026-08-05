import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) return 'supabase'
            if (id.includes('framer-motion')) return 'motion'
            if (id.includes('react-icons')) return 'icons'
            if (id.includes('react-hook-form')) return 'forms'
            if (id.includes('@tanstack')) return 'query'
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router')
            ) {
              return 'react'
            }
            return 'vendor'
          }
        },
      },
    },
  },
  server: {
    port: 3000,
  },
})
