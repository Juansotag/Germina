import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        // Sin limite de body en el proxy para permitir subida de audio
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // Asegurar que el Content-Length llega intacto al backend
            if (req.headers['content-length']) {
              proxyReq.setHeader('content-length', req.headers['content-length'])
            }
          })
        },
      }
    }
  }
})
