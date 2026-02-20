import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['xlsx']
  },
  // Proxy disabled - using production backend at api.edureachapp.com
  // All API calls use full URLs via VITE_API_BASE_URL environment variable
  // If you need local development with proxy, uncomment the server.proxy section below
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: 'http://localhost:5000',
  //       changeOrigin: true,
  //       secure: false,
  //     }
  //   }
  // }
})
