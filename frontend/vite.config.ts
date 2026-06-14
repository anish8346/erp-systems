import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  configureServer(server) {
    if (!server.httpServer) return

    server.httpServer.on('request', (req, res) => {
      if (/\.(tsx|ts|jsx|js|mjs)$/.test(req.url || '')) {
        delete req.headers['if-none-match']
        delete req.headers['if-modified-since']
      }
    })
  },
})
