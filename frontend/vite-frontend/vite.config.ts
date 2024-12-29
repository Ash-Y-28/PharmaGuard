import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Ensure Vite runs on 5173
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5003', // Flask backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Remove "/api" prefix
      },
    },
  },
});
