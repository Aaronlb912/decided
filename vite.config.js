import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' && process.env.npm_lifecycle_event === 'build'
    ? '/decided/'
    : '/',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 48531,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 48531,
    strictPort: true,
  },
})
