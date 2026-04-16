import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('recharts')) return 'charts'
          if (id.includes('@tanstack/react-query')) return 'query'
          if (id.includes('lucide-react')) return 'icons'
          if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('react')) return 'react'
          return undefined
        },
      },
    },
  },
})
