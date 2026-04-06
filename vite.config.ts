/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/ffxiv-baldesion/',
  server: {
    port: 8080,
  },
  test: {
    environment: 'jsdom',
  },
})
