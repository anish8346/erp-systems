import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import http from 'node:http'

const EXTS = /\.(tsx|ts|jsx|js|mjs|css)$/

function applyEtagBlock() {
  const proto = http.ServerResponse.prototype
  const orig = proto.setHeader
  proto.setHeader = function (name: string, value: any) {
    if (typeof name === 'string' && name.toLowerCase() === 'etag') return this
    return orig.call(this, name, value)
  }
}
applyEtagBlock()

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    },
  },
  configureServer(server) {
    if (!server.httpServer) return
    server.httpServer.on('request', (req: any, res: any) => {
      if (EXTS.test(req.url || '') || String(req.url || '').startsWith('/api')) {
        delete req.headers['if-none-match']
        delete req.headers['if-modified-since']
      }
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
      res.setHeader('Pragma', 'no-cache')
      res.setHeader('Expires', '0')
    })
  },
})
