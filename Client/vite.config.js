import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Any request starting with /api is forwarded to the backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,   // rewrites the Host header to localhost:5000
        secure: false,
      },
      // Forward /uploads so product/avatar images still load
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})