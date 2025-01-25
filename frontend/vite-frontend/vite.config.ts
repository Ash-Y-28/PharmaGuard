import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5173, // Ensure Vite runs on 5173
    proxy: {
      '/api': {
        target: mode === 'development' ? 'http://127.0.0.1:5003' : 'https://pharmaguard.onrender.com', // Use the local backend for development
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Remove "/api" prefix
      },
    },
  },
}));
