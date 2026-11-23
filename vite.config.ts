import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    host: '::',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  preview: {
    host: '::',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
})
