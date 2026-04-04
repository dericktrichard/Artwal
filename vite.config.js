import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['three'] // Split Three.js into separate file
        }
      }
    },
    chunkSizeWarningLimit: 1000 // Optional: increase warning limit to 1MB
  }
})